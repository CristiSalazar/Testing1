import mongoose from 'mongoose'
import Cart from '../src/dao/mongo/carts.mongo.js'
import Assert from 'assert'
import chai from 'chai'
import supertest from 'supertest'
import config from '../src/config/config.js' 

mongoose.connect(config.mongo_url)

const assert = Assert.strict
const expect = chai.expect
const requester = supertest("http://localhost:8080")

describe('Testing Cart DAO', () => {
    before(function () {
        this.cartsDao = new Cart()
    })
    it("Debería devolver los carritos de la DB", async function () {
        this.timeout(5000)
        try
        {
            const result = await this.cartsDao.get()
            assert.strictEqual(Array.isArray(result), true) 
            expect(Array.isArray(result)).to.be.equals(true) 
        }
        catch(error)
        {
            console.error("Error durante el test: ", error)
            assert.fail("Test get con error")
        }
    })
    
    it("El DAO debe agregar un carrito en la DB", async function () {
        let mockCart = {
            products: [
                {
                    productId: '9988765435',
                    quantity: 20
                }
            ]
        }
        const result = await this.cartsDao.save(mockCart)
        assert.ok(result._id) 
        expect(result).to.have.property('_id') 
    })

    it("Devolver un carrito por el id desde la DB", async function () {
        this.timeout(5000)
        try
        {
            let idCart = '111234567'
            const result = await this.cartsDao.getCart(idCart)
            assert.strictEqual(result.hasOwnProperty("cart"), true); 
            expect(result.hasOwnProperty("cart")).to.be.equals(true); 
        }
        catch(error)
        {
            console.error("Error durante el test: ", error)
            assert.fail("Test get con error")
        }
    })

    it("Debería devolver el total por la cantidad de productos", async function () {
        try 
        {
            let products = [
                {
                    description: 'algo 3',
                    price: 500,
                    stock: 1
                },
                {
                    description: 'algo2',
                    price: 1000,
                    stock: 2
                },

            ];
            const result = await this.cartsDao.getAmount({ productos: products })
            expect(result).to.be.a('number') 
            expect(result).to.equal(2500)
            assert.strictEqual(typeof result, 'number')
        } catch (error) {
            console.error("Error durante el test: ", error);
            assert.fail("Test con error");
        }
    });

    it("El endpoint GET /carts debe devolver todos los carritos", async function() {
        const response = await requester.get('/carts')
        assert.strictEqual(response.status, 200);
        expect(response.type).to.equal('application/json');
        expect(response.body).to.have.property('status', 'success');
    })

    after(function(done) {
        this.timeout(5000);
        console.log("Fin de las pruebas");
        done();
    });
})