import mongoose from "mongoose"

const productsCollection = "products";

const productsSchema = new mongoose.Schema({
    description: { type: String},
    price: { type: Number},
    stock: { type: Number}
})

const productsModel = mongoose.model(productsCollection, productsSchema)

export default productsModel;