import { Router } from "express";
import UserDTO from "../dao/DTOs/user.dto.js";
import { userService } from "../repositories/index.js";
import Users from "../dao/mongo/users.mongo.js"
import uploader from "../../utils.js"

const router = Router()

const usersMongo = new Users()

// Get
router.get("/", async (req, res) => {
  try{
    req.logger.info('Usuarios cargados');
    let result = await usersMongo.get()
    res.send({ status: "success", payload: result })
  } catch(error){
    console.log(error)
  }
}) 

// Post
router.post("/", async (req, res) => {
    let { first_name, last_name, email, age, password, rol } = req.body
    let user = new UserDTO({ first_name, last_name, email, age, password, rol })
    let result = await userService.createUser(user)
    if(result){
        req.logger.info('Usuario creado correctamente');
    }else{
        req.logger.error("Error al crear Usuario");
    } 
})

//p
router.post("/premium/:uid", async (req, res) => {
    try {
      const { rol } = req.body;
      const allowedRoles = ['premium', 'admin', 'usuario'];
      const uid = req.params.uid;

      if (!allowedRoles.includes(rol)) {
        req.logger.error('Rol no es válido');
      }

      if (!(await hasRequiredDocuments(uid))) {
        req.logger.error('No cuenta con documentos necesarios para premium');
        return res.status(400).json({ error: "No cuenta con documentos necesarios para premium"});
      }

      let changeRol = await userService.updUserRol({uid, rol});
  
      if (changeRol) {
        req.logger.info('Rol actualizado correctamente');
        res.status(200).json({ message: 'Rol actualizado correctamente' });
      } else {
        req.logger.error('Error al actualizar el rol');
        res.status(500).json({ error: 'Error al actualizar el rol' });
      }
    } catch (error) {
      console.error('Error en la ruta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  const allFiles = [];
router.post("/:uid/documents", uploader.fields([
  { name: 'profiles', maxCount: 3 },    
  { name: 'products', maxCount: 3 },
  { name: 'documents', maxCount: 2 },
  { name: 'identificacion', maxCount: 1 },
  { name: 'comprobanteDomicilio', maxCount: 1 },
  { name: 'comprobanteEstadoCuenta', maxCount: 1 }
]), async(req, res) => {
  const files = req.files;
  const userId = req.params.uid
  let user = await usersMongo.getUserById(userId)
  if (!user) {
    return res.status(404).json({ status: 'error', error: 'Usuario no encontrado' });
  }

  if (files['profiles']) {
    const profiles = files['profiles'].map(file => ({ name: 'profiles', path: file.path }));
    usersMongo.updateDocuments(userId, ...profiles)
    allFiles.push(...profiles);
  }

  if (files['products']) {
    const productFiles = files['products'].map(file => ({ name: 'products', path: file.path }));
    usersMongo.updateDocuments(userId, ...productFiles)
    allFiles.push(...productFiles);
  }

  if (files['documents']) {
    const documentFiles = files['documents'].map(file => ({ name: 'documents', reference: file.path }));
    usersMongo.updateDocuments(userId, ...documentFiles)
    allFiles.push(...documentFiles);
  }
  if (files['identificacion']) {
    const identificacion = files['identificacion'].map(file => ({ name: 'identificacion', reference: file.path }));
    usersMongo.updateDocuments(userId, ...identificacion)
    allFiles.push(...identificacion);
  }
  if (files['comprobanteDomicilio']) {
    const comprobanteDomicilio = files['comprobanteDomicilio'].map(file => ({ name: 'comprobanteDomicilio', reference: file.path }));
    usersMongo.updateDocuments(userId, ...comprobanteDomicilio)
    allFiles.push(...comprobanteDomicilio);
  }
  if (files['comprobantEstadoCuenta']) {
    const comprobanteEstadoCuenta = files['comprobanteEstadoCuenta'].map(file => ({ name: 'comprobanteEstadoCuenta', reference: file.path }));
    usersMongo.updateDocuments(userId, ...comprobanteEstadoCuenta)
    allFiles.push(...comprobanteEstadoCuenta);
  }

  res.send({ status: "success", message: "Archivos Guardados" });
});

export default router