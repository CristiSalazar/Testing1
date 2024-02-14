import { Router } from "express";
import CartDTO from "../dao/DTOs/cart.dto.js";
import TicketDTO from "../dao/DTOs/ticket.dto.js";
import { ticketService, cartService, userService } from "../repositories/index.js";
import Carts from "../dao/mongo/carts.mongo.js";

const router = Router()

const cartMongo = new Carts()

router.get("/", async (req, res) => {
    try
    {
        req.logger.info('Se obtienen carritos');
        let result = await cartMongo.get()
        res.status(200).send({ status: "success", payload: result });
    }
    catch(error)
    {
        req.logger.info('Error al obtener carritos');
        res.status(500).send({ status: "error", message: "Error servidor" });
    } 
})

router.post("/", async (req, res) => {
    try
    {
        let { products } = req.body
        const correo = req.body.email;
        let rolUser = userService.getRolUser(products.owner)
        if(rolUser == 'premium' && correo == products.owner)
        {
            req.logger.error('Error');
            res.status(500).send({ status: "error", message: "Error" });
        }else{
            let cart = new CartDTO({ products })
            let result = await cartService.createCart(cart)
            if(result){
                req.logger.info('Carrito creado de forma correcta');
                res.status(200).send({ status: "success", payload: result });
            }else{
                req.logger.error("Error creando carrito");
                res.status(500).send({ status: "error", message: "Error interno del servidor" });
            }
        }
    }
    catch(error)
    {
        res.status(500).send({ status: "error", message: "Error interno del servidor" });
    }
})


router.post("/:cid/purchase", async (req, res) => {
    try {
        let id_cart = req.params.cid;
        const productos = req.body.productos;
        const correo = req.body.correo;
        let cart = cartService.validateCart(id_cart)
        if (!cart) {
            req.logger.error("No se encontró el carrito con el ID proporcionado");
            return { error: "No se encontró el carrito" };
        }
        let validarStock = cartService.validateStock({productos})

        if (validarStock) {
            let totalAmount = await cartService.getAmount({productos})
            const ticketFormat = new TicketDTO({amount:totalAmount, purchaser:correo});
            const result = await ticketService.createTicket(ticketFormat);
        } else {
            req.logger.error("No hay suficiente stock para realizar la compra");
        }
    } catch (error) {
        req.logger.error("Error:" + error.message);
        return res.status(500).json({ error: "Error" });
    }
})

export default router