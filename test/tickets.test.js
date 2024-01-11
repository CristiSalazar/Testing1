import mongoose from 'mongoose'
import Ticket from '../src/dao/mongo/tickets.mongo.js'
import Assert from 'assert'
import chai from 'chai'
import supertest from 'supertest'
import config from '../src/config/config.js' 

mongoose.connect(config.mongo_url)

const assert = Assert.strict
const expect = chai.expect
const requester = supertest("http://localhost:8080")

describe('Testing Ticket', () => {
    before(function () {
        this.ticketsDao = new Ticket()
    })
    it("Debería devolver los tickets de la DB", async function () {
        this.timeout(5000)
        try
        {
            const result = await this.ticketsDao.get()
            assert.strictEqual(Array.isArray(result), true) 
            expect(Array.isArray(result)).to.be.equals(true) 
        }
        catch(error)
        {
            console.error("Error durante el test: ", error)
            assert.fail("Test get con error")
        }
    })

    //
    it("El DAO debe agregar un Ticket en la DB", async function () {
        let mockTicket = {
            amount: 456,
            purchaser: "testing@gmail.com",
        }
        const result = await this.ticketsDao.addTicket(mockTicket)
        assert.ok(result._id) 
        expect(result).to.have.property('_id') 
    })


    it("El endpoint GET /tickets debe devolver todos los tickets", async function() {
        const response = await requester.get('/tickets')
        assert.strictEqual(response.status, 200);
        expect(response.type).to.equal('application/json');
        expect(response.body).to.have.property('status', 'success');
    })
    it("El endpoint POST /tickets debe crear un ticket", async function() {
        let mockTicket = {
            amount: 2344,
            purchaser: "test@gmail.com",
        }
        
        const response = await requester.post('/tickets').send(mockTicket)
        assert.strictEqual(response.status, 200);
        expect(response.ok).to.equal(true);
        expect(response.body).to.have.property('status', 'success');
    })
    after(function(done) {
        this.timeout(5000);
        console.log("Fin de las pruebas");
        done();
    });
})