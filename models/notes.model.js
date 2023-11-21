const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    
    title:{
        type: String,
        required: true,
        trim: true,
    },
    category:{
        type: String,
        required: true,
        trim: true,
    },
    status:{
        type: String,
        required: true,
        trim: true,
    },
    
    description:{
        type: String,
        required: true,
        trim: true,
    },
    userId:{
        type:String,
        required:true,
        trim:true,
    },

}, 
{timestamps: true}
);

module.exports = mongoose.model('Notes', noteSchema);