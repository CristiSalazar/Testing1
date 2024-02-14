export const generateProductErrorInfo = (product) => {
    return `Propiedad incompleta.
    *description : debe ser un String, se recibió ${product.description}
    *price       : debe ser un número, se recibió ${product.price}
    *stock       : debe ser un número, se recibió  ${product.stock}
    *quantity: debe ser un String, se recibió ${product.availability}`
}

export const deleteProductErrorInfo = (product) => {
    return `Error al eliminar el Producto.
    *El producto que no se pudo eliminar tiene el id ${id}`
}
export const updateProductErrorInfo = (id, product) => {
    return `Error al actualizar el producto.
    El producto que no se pudo actualizar tiene el id ${id}:
    *description : debe ser un String, se recibió ${product.description}
    *price       : debe ser un número, se recibió ${product.price}
    *stock       : debe ser un número, se recibió ${product.stock}
    *quantity: debe ser un String, se recibió ${product.availability}`
}