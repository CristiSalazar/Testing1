export default class ProductDTO {
    constructor(product) {
        this.description = product.description
        this.price = product.price
        this.stock = product.stock
        this.quantity = product.quantity
        this.owner = product.owner
    }
}