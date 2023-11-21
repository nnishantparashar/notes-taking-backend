const mongoose = require("mongoose");

const tempUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    mobileNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    hashedPassword: {
        type: String,
        required: true,
        trim: true,
    },
   
}, 
{timestamps: true}
);

module.exports = mongoose.model('TempUsers', tempUserSchema);