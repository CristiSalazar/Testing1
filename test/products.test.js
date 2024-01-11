import mongoose from 'mongoose'
import Product from '../src/dao/mongo/products.mongo.js'
import Assert from 'assert'
import chai from 'chai'
import supertest from 'supertest'
import config from '../src/config/config.js' 

mongoose.connect(config.mongo_url)

const assert = Assert.strict
const expect = chai.expect
const requester = supertest("http://localhost:8080")

describe('Testing Product DAO', () => {
    before(function () {
        this.productsDao = new Product()
    })
    it("Debería devolver los productos de la DB", async function () {
        this.timeout(5000)
        try
        {
            const result = await this.productsDao.get()
            assert.strictEqual(Array.isArray(result), true) 
            expect(Array.isArray(result)).to.be.equals(true) 
        }
        catch(error)
        {
            console.error("Error durante el test: ", error)
            assert.fail("Test get con error")
        }
    })
    
    it("El DAO debe agregar un producto en la DB", async function () {
        let mockProduct = {
            description: "Descripcion Test",
            price: 2500,
            stock: 55
        }
        const result = await this.productsDao.addProduct(mockProduct)
        assert.ok(result._id) 
        expect(result).to.have.property('_id') 
    })

    it("El DAO debería actualizar un producto", async function () {
        let prodId = "212345464"
        let mockProductUpd = {
            description: "Descripción Test Upd",
            price: 2000,
            stock: 10
        }
        const result = await this.productsDao.updateProduct(prodId, mockProductUpd )
        assert.strictEqual(typeof result, "object") 
        expect(result).to.be.an('object') 
    })
    it("El DAO debería eliminar un producto", async function () {
        let prodId = "212345464" 
        const result = await this.productsDao.deleteProduct(prodId)
        assert.strictEqual(typeof result, "object") 
        expect(result).to.be.an('object') 
    })
    
    it("El endpoint GET /products debe devolver todos los productos", async function() {
        const response = await requester.get('/products')
        assert.strictEqual(response.status, 200);
        expect(response.type).to.equal('application/json');
        expect(response.body).to.have.property('status', 'success');
    })
    it("El endpoint POST /products debe crear un producto", async function() {
        let mockProduct = {
            description: "Test Post",
            price: 2000,
            stock: 10
        }
        
        const response = await requester.post('/products').send(mockProduct)
        assert.strictEqual(response.status, 200)
        expect(response.ok).to.equal(true)
        expect(response.body).to.have.property('status', 'success');
    })
    after(function(done) {
        this.timeout(5000);
        console.log("Fin de las pruebas");
        done();
    });
})