const Notes = require("../models/notes.model");
const mongoose = require("mongoose");


exports.getNotes = (req, res) => {

    try {
        const userId = req.params.userId;
        Notes.find({userId:userId})
        .then((data) => {
            return res.status(200).send({
                message:"Notes have been retrieved successfully.",
                data: data,
            });
        })
        .catch((error) => {
            return res.status(400).send({
                message: "Error while retrieving notes.",
                error: error,
            });
        })
        
    } catch (error) {
        res.status(500).send({
            message:"Internal Server Error",
            error: error,
        });
    }
}



exports.addNote = (req, res) => {
    try {
        const payload = req.body;
        const newNote = new Notes(payload);
        newNote
        .save()
        .then((data) =>{
            res.status(200).send({
                message:"Note has been added successfully.",
                data: data,
            })
        })
        .catch((error) =>{
            return res.status(400).send({
                message:"Error while adding new note.",
                error: error,
            })
        })
        
    } catch (error) {
        res.status(500).send({
            message:"Internal Server Error",
            error: error,
        });
    }
};

exports.updateNote = (req, res) => {
    try {
        const noteId = req.params.noteId;
        const payload = req.body;
        Notes.updateOne({_id: noteId}, {$set: { ...payload}})
        .then((data) =>{
            res.status(200).send({
                message:"Note has been updated successfully.",
                data: data,
            })
        })
        .catch((error) =>{
            return res.status(400).send({
                message:"Error while updating note.",
                error: error,
            })
        })
        
    } catch (error) {
        
        return res.status(500).send({
            message:"Internal Server Error",
            error: error,
        });
    }
}

exports.deleteNote = (req, res) => {
  
    try {
      const noteId = req.params.noteId;
      Notes.deleteOne({_id: noteId})
        .then((data) => {
          res.status(200).send({
            message: "Note have been deleted successfully.",
            data: data,
          });
        })
        .catch((error) => {
          return res.status(400).send({
            message: "Error while deleting note data.",
            erroe: error,
          });
        });
    } catch (error) {
        
      res.status(500).send({
        message: "Internal server error",
        error:error,
      });
    }
  };