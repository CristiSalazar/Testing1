import User from "../src/dao/mongo/users.mongo.js"
import config from "../src/config/config.js"
import mongoose from "mongoose"
import Assert from "assert"
import chai from "chai"
import supertest from 'supertest'

mongoose.connect(config.mongo_url);

const assert = Assert.strict
const expect = chai.expect
const requester = supertest("http://localhost:8080")

describe('Testing User DAO get method', () => {
    before(function () {
        this.usersDao = new User()
    })

    it("Debería devolver los usuarios de la DB", async function () {
        this.timeout(5000)
        try
        {
            const result = await this.usersDao.get()
            assert.strictEqual(Array.isArray(result), true) 
            expect(Array.isArray(result)).to.be.equals(true) 
        }
        catch(error){
            console.error("Error durante el test: ", error)
            assert.fail("Test con error")
        }
    })

    it("El DAO debe agregar a un usuario en la DB", async function () {
        let mockUser = {
            first_name: "Javier",
            last_name: "Perez",
            email: "jperez@gmail.com",
            age: 22,
            password: "123456",
            rol: "Test Rol"
        }
        const result = await this.usersDao.save(mockUser)
        assert.ok(result._id) 
        expect(result).to.have.property('_id') 
    })

    it("El DAO debe obtener un usuario por correo electrónico", async function () {
        let emailToFind = "cristina.salazar125@gmail.com"
        const result = await this.usersDao.findEmail({ email: emailToFind })
        assert.strictEqual(typeof result, "object") 
        expect(result).to.be.an('object') 
    })

    it("El DAO debe devolver un usuario despues de colocar un parametro", async function () {
        let filterData = { first_name: 'admin'}
        const result = await this.usersDao.findJWT(filterData)
        assert.strictEqual(typeof result, "object") 
        expect(result).to.be.an('array'); 
    })

    it("Post /users debe crear un usuario", async function() {
        let mockUser = {
            first_name: "SuperTest Nombre",
            last_name: "SuperTest Apellido",
            email: "SuperTest Email",
            age: 22,
            password: "SuperTest Contraseña",
            rol: "SuperTest Rol"
        }
        
        const response = await requester.post('/users').send(mockUser)
        assert.strictEqual(response.status, 200);
        expect(response.ok).to.equal(true);
        expect(response.body).to.have.property('status', 'success');
    })
    after(function(done) {
        this.timeout(5000);
        console.log("Fin de las pruebas de User");
        done();
    });
})