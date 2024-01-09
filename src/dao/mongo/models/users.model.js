import mongoose from "mongoose"

const usersCollection = "users";

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
})

const usersModel = mongoose.model(usersCollection, userSchema)

export default usersModel