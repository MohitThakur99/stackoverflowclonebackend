import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: { type: String},
    email: { type: String},
    password: { type: String},
    about: { type: String },
    tags: { type: [String] },
    joinedOn: { type: Date, default: Date.now },
    phoneNumber: { type: String },
    otp: { type: String }
})

export default mongoose.model("User", userSchema)