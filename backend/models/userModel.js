const e = require("express");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        default: "user",
    },
    favorites: {
        type: Array,
        default: [],
    },
}, 

{ timestamps: true }

);

module.exports = mongoose.model("User", userSchema);