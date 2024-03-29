import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import config from './src/config/config.js'
import passport from "passport"
import cookieParser from "cookie-parser"
import CartMongo from "./src/dao/mongo/carts.mongo.js"
import TicketMongo from "./src/dao/mongo/tickets.mongo.js"
import cartsRouter from './src/routes/carts.router.js'
import productsRouter from './src/routes/products.router.js'
import usersRouter from './src/routes/users.router.js'
import ticketsRouter from './src/routes/tickets.router.js'
import UserMongo from "./src/dao/mongo/users.mongo.js"
import ProdMongo from "./src/dao/mongo/products.mongo.js"
import { Strategy as JwtStrategy } from 'passport-jwt';
import { ExtractJwt as ExtractJwt } from 'passport-jwt';
import __dirname, { authorization, passportCall, transport, createHash } from "./utils.js"
import initializePassport from "./src/config/passport.config.js"
import * as path from "path"
import {setToken, setTokenEmail, tokenResetPass, emailFromToken, emailFromTokenLogin} from "./src/jwt/token.js"
import UserDTO from './src/dao/DTOs/user.dto.js'
import { engine } from "express-handlebars"
import {Server} from "socket.io"
import compression from 'express-compression'
import { nanoid } from 'nanoid'
import loggerMiddleware from "./logger.Middleware.js"
import bodyParser from "body-parser"
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUiExpress from 'swagger-ui-express'
 
const app = express()
const port = process.env.PORT || 8080

const users = new UserMongo()
const products = new ProdMongo()
const carts = new CartMongo()
const tickets = new TicketMongo()

mongoose.connect(process.env.MONGO_URL);

//logger
app.use(loggerMiddleware)

const swaggerOptions = {
    definition:{
        openapi:'3.0.1',
        info:{
            title: 'Documentación de Api',
            description:'Api clase Swagger' 
        }
    },
    apis:[`src/docs/users.yaml`,
          `src/docs/products.yaml`,
          `src/docs/tickets.yaml`,
          `src/docs/carts.yaml`]
}
const specs = swaggerJSDoc(swaggerOptions)
app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs))

 
//listo
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: "Secret-key"
}

passport.use(
    new JwtStrategy(jwtOptions, (jwt_payload, done)=>{
        const user = users.findJWT((user) =>user.email ===jwt_payload.email)
        if(!user)
        {
            return done(null, false, {message:"Usuario no encontrado"})
        }
        return done(null, user)
    })
)

//middlewares
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.engine("handlebars", engine())
app.set("view engine", "handlebars")
app.set("views", path.resolve(__dirname + "/views"))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(compression())
initializePassport()
app.use(passport.initialize())
app.use(loggerMiddleware)

const httpServer = app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto 8080`)
})

const socketServer = new Server(httpServer)

socketServer.on("connection", socket => {
    console.log("Socket Conectado")

    socket.on("message", data => {
        console.log(data)
    })

    socket.on("newProd", (newProduct) => {
        let validUserPremium = users.getUserRoleByEmail(newProduct.owner)
        if(validUserPremium == 'premium'){
            products.addProduct(newProduct)
            socketServer.emit("success", "Producto Agregado de forma correcta");
        }else{
            socketServer.emit("errorUserPremium", "Producto no fue agregado");
        }
    })

    socket.on("delUser", (id) => {
        users.deleteUser(id)
        socketServer.emit("success", "Usuario Eliminado Correctamente");
    });

    socket.on("updProd", ({id, newProduct}) => {
        products.updateProduct(id, newProduct)
        socketServer.emit("success", "Producto Actualizado de forma correcta");
    })

    socket.on("delProd", (id) => {
        products.deleteProduct(id)
        socketServer.emit("success", "Producto Eliminado Correctamente");
    });

    socket.on("delProdPremium", ({id, owner, email}) => {
        console.log(owner)
        console.log(email)
        if(owner == email){
            products.deleteProduct(id)
            socketServer.emit("success", "Producto eliminado de forma correcta");
        }else{
            socketServer.emit("errorDelPremium", "Error al eliminar el producto");
        }  
    });

    socket.on("notMatchPass", () => {
        socketServer.emit("warning", "Contraseña no coincide");
    });

    socket.on("newEmail", async({email, comment}) => {
        let result = await transport.sendMail({
            from:'<cristina.salazar125@gmail.com>',
            to:email,
            subject:'Correo',
            html:`
            <div>
                <h1>${comment}</h1>
            </div>
            `,
            attachments:[]
        })
        socketServer.emit("success", "Correo enviado correctamente");
    });
})

// Rutas
app.use("/carts", cartsRouter) 
app.use("/products", productsRouter)
app.use("/users", usersRouter)
app.use("/tickets", ticketsRouter)

// Ruta de autenticación con JWT 
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const emailToFind = email;
    const user = await users.findEmail({ email: emailToFind });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Error de autenticación" });
    }
    try {
        if (!isValidPassword(user, password)) {
            req.logger.error("Error de autenticación: Contraseña incorrecta");
            return res.status(401).json({ message: "Error de autenticación" });
        }
        const token = setToken(res, email, password); 
        const userDTO = new UserDTO(user);
        const prodAll = await products.get();
        res.json({ token, user: userDTO, prodAll });

        req.logger.info("Inicio de sesión exitoso para el usuario: " + emailToFind);
    } catch (error) {
        req.logger.error("Error: " + error.message)
        return res.status(500).json({ message: "Error interno del servidor" })
    }
  });

app.post("/api/register", async(req,res)=>{
    const {first_name, last_name, email,age, password, rol} = req.body
    const emailToFind = email
    const exists = await users.findEmail({ email: emailToFind })
    if (exists) {
        req.logger.warn("Correo electrónico ya existe: " + emailToFind);
        return res.send({ status: "error", error: "Usuario ya existe" })
    }

    let resultNewCart = await carts.addCart()
    const newUser = {
        first_name,
        last_name,
        email,
        age,
        password: createHash(password),
        id_cart: resultNewCart._id.toString(),
        rol
    }
    try {
        users.addUser(newUser);
        const token = setToken(res, email, password);
        res.send({ token });
        req.logger.info("Registro exitoso: " + emailToFind);
    } catch (error) {
        req.logger.error("Error al registrar al usuario: " + error.message)
        res.status(500).json({ message: "Error interno del servidor" })
    }
});

app.get('/', (req, res) => {
    req.logger.info("Inicio de Login");
    res.sendFile('index.html', { root: app.get('views') });
})


app.get('/register', (req, res) => {
    req.logger.info("Página de Registro de Usuarios");
    res.sendFile('register.html', { root: app.get('views') });
})

app.get('/current',passportCall('jwt', { session: false }), authorization('user'),(req,res) =>{
    req.logger.info("Se inicia página de Usuario");
    authorization('user')(req, res,async() => {      
        const prodAll = await products.get();
        res.render('home', { products: prodAll });
    })
})

app.get('/current-plus',passportCall('jwt', { session: false }), authorization('user'),(req,res) =>{
    req.logger.info("Se inicia página de Usuario Premium")
    authorization('user')(req, res,async() => {  
        const { token} = req.query
        const emailToken = emailFromTokenLogin(token) 
        const prodAll = await products.get()
        res.render('home-plus', { products: prodAll, email: emailToken })
    });
})

app.get('/admin',passportCall('jwt'), authorization('user'),(req,res) =>{
    req.logger.info("Se inicia página de Administrador")
    authorization('user')(req, res,async() => {    
        const prodAll = await products.get()
        res.render('admin', { products: prodAll })
    })
})

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const emailToFind = email;
    const userExists = await users.findEmail({ email: emailToFind });
    if (!userExists) {
      req.logger.error("Error al reestablecer contraseña "+email+" no existe")
      console.error("Error al reestablecer "+email+" no existe")
      res.json("Error al reestablecer contraseña "+email+" no existe" );
      return res.status(401).json({ message: "Error al reestablecer contraseña" });
    }

    const token = setTokenEmail(email)
 
    const resetLink = `http://localhost:8080/reset-password?token=${token}`;
  
    let result = transport.sendMail({
        from:'<cristina.salazar125@gmail.com>',
        to:email,
        subject:'Restablecer contraseña',
        html:`Clickea el siguiente enlace para restablecer tu contraseña: <a href="${resetLink}">Restablecer contraseña</a>`,
        attachments:[]
    })

    if(result)
    {
        req.logger.info("Correo enviado para reestablecer contraseña a " + emailToFind);
        res.json("Correo enviado para reestablecer contraseña a "+email);
    }
    else
    {
        req.logger.error("Error al enviar correo");
        console.error("Error al reestablecer contraseña");
        res.json("Error al reestablecer contraseña");
    }
  })

  app.get('/reset-password', async (req, res) => {
    const {token} = req.query;
    const validate = tokenResetPass(token)
    const emailToken = emailFromToken(token)
    if(validate){
        res.render('resetPassword', { token , email: emailToken});
    }
    else{
        res.sendFile('index.html', { root: app.get('views') });
    }
  });

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
app.get("/mockingproducts", async(req,res)=>{

    const products = [];

    for (let i = 0; i < 50; i++) {
        const product = {
            id: nanoid(),
            description: `Product ${i + 1}`,
            price: getRandomNumber(1, 1000),
            stock: getRandomNumber(1, 100),
        };

        products.push(product);
    }

    res.send(products);
})