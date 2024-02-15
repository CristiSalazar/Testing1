import cartsModel from './models/carts.model.js'
import productsModel from './models/products.model.js'
import mongoose from 'mongoose'

export default class Carts {
    constructor() {

    }

    get = async () => {
        let carts = await cartsModel.find()
        return carts
    }

    getCartById = async (id_cart) => {
        try {
            const cart = await cartsModel.findById(id_cart);
            if (!cart) {
                return { error: "El carrito no existe" };
            }
            return { cart };
        } catch (error) {
            console.error(error);
            return null
        }
    }
    getStock = async ({ productos }) => {
        try {
            const stockInfo = {};
            const errors = [];
    
            for (const producto of productos) {
                const productInCollection = await productsModel.findOne({ description: producto.description });
    
                if (!productInCollection) {
                    errors.push({ description: producto.description, error: `El producto no existe` });
                    stockInfo[producto.description] = { status: 'No fue posible encontrar' };
                    continue;
                }
    
                if (productInCollection.stock >= producto.stock) {
                    await productsModel.updateOne(
                        { description: productInCollection.description },
                        { $inc: { stock: -producto.stock } }
                    )
                } else {
                    errors.push({ description: producto.description, error: 'Insuficiente' });
                    stockInfo[producto.description] = { status: 'Insuficiente' };
                }
            }
    
            if (errors.length > 0) {
                return { errors, stockInfo };
            }
    
            return stockInfo;
        } catch (error) {
            console.error("Error al obtener el stock:", error);
            return { error: "Error al obtener stock" };
        }
    };
    getAmount = async ({ productos }) => {
        try {
            let totalAmount = 0;
    
            if (!productos || !Array.isArray(productos)) {
                console.error('La propiedad "productos" es inválido.');
                return totalAmount;
            }
    
            for (const producto of productos) {
                totalAmount += producto.price * producto.stock;
            }
    
            return totalAmount;
        } catch (error) {
            console.error("Error de cálculo", error);
            return null; 
        }
    };
    
    addCart = async (cart) => {
        let result = await cartsModel.create(cart)
        console.log("Carro creado correctamente")
        return result
    }
    addToCart = async (cartId, productId, quantity) => {
        try {
            const cartObjectId = new mongoose.Types.ObjectId(cartId)
            let cart = await cartsModel.findById(cartObjectId)           
            const alreadyProduct = cart.products.find(product => product.productId.equals(productId));
            if (alreadyProduct) {
                alreadyProduct.quantity += quantity;
            } else {
                cart.products.push({
                    productId: productId,
                    quantity: quantity,
                });
            }
            await cart.save();
            console.log("Producto agregado de forma correcta");
            return cart;
        } catch (error) {
            console.error('Error al agregar producto', error);
            throw new Error('Error al agregar producto');
        }
    };
    getCartAndProducts = async (cartId) =>
      {
        try
        {
          const cart = await cartsModel.findById(cartId).populate('products.productId').lean();
          if (!cart) {
            return 'No se encontró carrito';
          }
          return cart;
        } catch (error) {
          console.error('Error al obtener productos del carrito:', error);
          return 'Error al obtener productos del carrito';
        }
      }     
}