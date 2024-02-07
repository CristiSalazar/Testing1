import { Router } from "express";
import ProductDTO from "../dao/DTOs/product.dto.js";
import { productService } from "../repositories/index.js";
import Products from "../dao/mongo/products.mongo.js"
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enum.js";
import { generateProductErrorInfo } from "../services/errors/info.js";

const router = Router()

const productMongo = new Products()

router.get("/", async (req, res) => {
    let result = await productMongo.get()
    res.send({ status: "success", payload: result })
})

router.post("/", async (req, res) => {
    let { description, price, stock, quantity} = req.body
    const product = { description, price, stock, quantity}
    if (!description || !price || !stock || !quantity) {
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

export default router