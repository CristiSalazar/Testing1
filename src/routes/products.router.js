import { Router } from "express";
import ProductDTO from "../dao/DTOs/product.dto.js";
import { productService, userService } from "../repositories/index.js";
import Products from "../dao/mongo/products.mongo.js"
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enum.js";
import { generateProductErrorInfo } from "../services/errors/info.js";
import {transport} from "../../utils.js"

const router = Router()

const productMongo = new Products()

router.get("/", async (req, res) => {
    try
    {
        req.logger.info('Productos cargados');
        let result = await productMongo.get()
        res.status(200).send({ status: "success", payload: result });
    } 
    catch (error) 
    {
        res.status(500).send({ status: "error", message: "Error interno del servidor" });
    }
})

router.post("/", async (req, res) => {
    let { description, price, stock, quantity, owner} = req.body
    const product = { description, price, stock, quantity, owner}
    if (!description || !price || !stock || !quantity || !owner) {
        CustomError.createError({
            name:"Error de creación del producto",
            cause:generateProductErrorInfo({description,price,stock, quantity}),
            message:"Error al intentar crear producto",
            code: EErrors.INVALID_TYPES_ERROR 
        })
    }
    let prod = new ProductDTO({ description, price, stock, quantity})
    let result = await productService.createProduct(prod)
})

router.get("/:id", async (req, res) => {
    try{
        const prodId = req.params.id;
        const userEmail = req.query.email
        const productDetails = await productMongo.getProductById(prodId);
        res.render("viewDetails", { product: productDetails, email: userEmail });
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ error: 'Error al obtener el producto' });
    } 
});

export default router