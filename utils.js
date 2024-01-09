import path from "path"
import { fileURLToPath } from "url"
import passport from "passport"
import nodemailer from 'nodemailer'
import {faker} from "@faker-js/faker"

export const passportCall = (strategy) => {
    return async(req, res, next)=>{
        passport.authenticate(strategy, function(err, user, info){
            if(err) return next(err)
            if(!user){
                return res.status(401).send({error:info.messages?info.messages:info.toString()})
            }
            req.user = user
            next()
        })(req, res, next)
    }
}
export const authorization= (role) => {
    return async(req, res, next)=>{
        if(!req.user) return res.status(401).send({error: "Sin autorizacion"})
        if(req.user.role!= role) return res.status(403).send({error:"Sin permisos"})
        next()
    }
}
export const transport= nodemailer.createTransport({
    service:'gmail',
    port:587,
    auth:{
        user:'cristina.salazar125@gmail.com',
        pass:'shlw wfif moal jpzv'
    }
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

//Mock

faker.location = "es"

export const generateProduct = () => {
    let numOfProducts = 100
    let products = []
    for (let i = 0; i < numOfProducts; i++){
        products.push(generateProducts)
    }
    return {
        description:faker.commerce.productDescription(),
        price: faker.commerce.price({ min: 100, max: 200 }),
    }
}

export default __dirname