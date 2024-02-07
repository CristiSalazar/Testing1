// Finalizado

import mongoose from "mongoose"

const usersCollection = "users";

const userSchema = new mongoose.Schema({
    first_name: String, 
    last_name: String, 
    email: String, 
    age: Number,
    password: String, 
    rol: String, 
    documents:
    [
        {
          name: { type: String},
          reference: { type: String},
        }
    ]
})

const usersModel = mongoose.model(usersCollection, userSchema)

export default usersModel