const Note = require('../models/Note')
const User = require('../models/User')
const asynchandler = require('express-async-handler')



//@desc Get all notes
//@route GET /notes
//@access Private
const getAllNotes = asynchandler(async (req, res) => {
    const notes = await Note.find().lean();
    if (!notes?.length) {
        return res.status(400).json({ message: "no notes found" })
    }
    res.json(notes)
})


//@desc Create new user
//@route POST /users
//@access Private

const createNewNote = asynchandler(async (req, res) => {
    const { user, title, text, completed } = req.body
    //confirm data
    if (!title || !text || !user) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    //check duplicate
    const duplicate = await Note.findOne({ title }).lean().exec()
    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate title.' })
    }
    const noteObject = { user, title, text, completed }

    //create and store new user
    const note = await Note.create(noteObject)
    if (note) {
        //201 created
        res.status(201).json({ message: `New note ${title} created.` })
    } else {
        res.status(400).json({ message: 'Invalid user data recieved.' })
    }
})


//@desc update note
//@route PATCH /notes
//@access Private

const updateNote = asynchandler(async (req, res) => {
    const { id, title, text, user, completed } = req.body
    //confirm data
    if (!id || !title || !text || !user) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    const note = await Note.findById(id).exec()
    if (!note) {
        return res.status(400).json({ message: 'note not found' })
    }
    //check for duplicate
    const duplicate = await Note.findOne({ title }).lean().exec()
    //Allow update to original user
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate title' })
    }
    note.title = title
    note.text = text
    note.user = user
    note.completed = completed

    const updatedNote = await note.save()
    res.json({ message: `${updatedNote.title} updated` })
})


//@desc delete note
//@route DELETE /notes
//@access Private

const deleteNote = asynchandler(async (req, res) => {
    const { id } = req.body
    if (!id) {
        res.status(400).json({ message: 'note id required.' })
    }

    // const user = await Note.findOne({ user: id }).lean().exec()
    // if (user) {
    //     return res.status(400).json({ message: 'Note has assigned user' })
    // }
    const note = await Note.findById(id).exec()

    if (!note) {
        res.status(400).json({ message: 'Note not found.' })
    }


    const result = await note.deleteOne()
    console.log(result);

    const reply = `Username ${note.title} with ID ${note.id} deleted.`

    res.json(reply)
})



module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
}