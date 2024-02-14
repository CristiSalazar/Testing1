import productsModel from './models/products.model.js'
import mongoose from 'mongoose'

export default class Products {
    constructor() {

    }

    get = async () => {
        let products = await productsModel.find().lean()
        return products
    }
    addProduct = async (prodData) => {
        try
        {
            let prodCreate = await productsModel.create(prodData);
            return prodCreate
        }catch(error){
            console.error('Error al crear producto:', error);
            return Error
        }      
    }
    updateProduct = async (prodId, prodData) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(prodId)) {
                return 'ID de producto no válido';
            }
            let updatedProduct = await productsModel.updateOne({ _id: new mongoose.Types.ObjectId(prodId) }, { $set: prodData });

        } catch (error) {
            console.error('Error al actualizar producto:', error);
            return "Error al actualizar"
        }
    }
    deleteProduct = async (productId) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return 'ID de producto inválido';
            }
            let deletedProduct = await productsModel.deleteOne({ _id: new mongoose.Types.ObjectId(productId) });
            if (deletedProduct.deletedCount > 0) {
                return 'Producto eliminado exitosamente';
            } else {
                return 'No se encontró producto con el ID proporcionado';
            }
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            return "Error eliminando producto"
        }
    };

    getProductById = async (id) => { 
        try 
        {
          const prod = await productsModel.findById(id).lean();    
          if (!prod) 
          {
            return 'Usuario no encontrado';
          }   
          return prod;
        } catch (error) {
          console.error('Error al obtener el usuario:', error);
          return 'Error obteniendo usuario';
        }
    }
}