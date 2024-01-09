export const generateProductErrorInfo = (product) => {
    return `Propiedad incompleta.
    *description : debe ser un String, se recibió ${product.description}
    *price       : debe ser un número, se recibió ${product.price}
    *stock       : debe ser un número, se recibió  ${product.stock}`
}

export const deleteProductErrorInfo = (product) => {
    return `Error al eliminar el Producto.
    *El producto que no se pudo eliminar tiene el id ${id}`
}
export const updateProductErrorInfo = (id, product) => {
    return `Error al actualizar el producto.
    El producto que no se pudo actualizar tiene el id ${id}
    La información ingresada fue la siguiente:
    *description : debe ser un String, se recibió ${product.description}
    *price       : debe ser un número, se recibió ${product.price}
    *stock       : debe ser un número, se recibió ${product.stock}`
}