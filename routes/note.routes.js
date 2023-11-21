const express = require("express");
const { isAuth } = require("../utils/authentication");
const { getNotes, addNote, updateNote, deleteNote} = require("../controllers/note.controller")
const router = express.Router();

//get all notes
router.get("/notes/:userId", isAuth, getNotes);
// add new note
router.post("/addNote", isAuth, addNote);
//update existing note
router.put("/updateNote/:noteId", isAuth, updateNote);
//remove product
router.delete("/deleteNote/:noteId", isAuth, deleteNote)


module.exports = router;