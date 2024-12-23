const User = require('../models/User')
const Note = require('../models/Note')
const asynchandler = require('express-async-handler')
const bcrypt = require('bcrypt')

//@desc Get all users
//@route GET /users
//@access Private

const getAllUsers = asynchandler(async (req, res) => {
    const users = await User.find().select('-password').lean();
    if (!users?.length) {
        return res.status(400).json({ message: "no users found" })
    }
    res.json(users)
})

//@desc Create new user
//@route POST /users
//@access Private

const createNewUser = asynchandler(async (req, res) => {
    const { username, password, roles } = req.body
    //confirm data
    if (!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    //check duplicate
    const duplicate = await User.findOne({ username }).lean().exec()
    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username.' })
    }
    //Hash password
    const hashedPassword = await bcrypt.hash(password, 10) // salt rounds
    const userObject = { username, "password": hashedPassword, roles }

    //create and store new user
    const user = await User.create(userObject)
    if (user) {
        //201 created
        res.status(201).json({ message: `New user ${username} created.` })
    } else {
        res.status(400).json({ message: 'Invalid user data recieved.' })
    }
})

//@desc update user
//@route PATCH /users
//@access Private

const updateUser = asynchandler(async (req, res) => {
    const { id, username, password, roles, active } = req.body
    //confirm data
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }
    const user = await User.findById(id).exec()
    if (!user) {
        return res.status(400).json({ message: 'user not found' })
    }
    //check for duplicate
    const duplicate = await User.findOne({ username }).lean().exec()
    //Allow update to original user
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate username' })
    }
    user.username = username
    user.roles = roles
    user.active = active

    if (password) {
        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10) // salt rounds
        user.password = hashedPassword
    }
    const updatedUser = await user.save()
    res.json({ message: `${updatedUser.username} updated` })
})

//@desc delete user
//@route DELETE /users
//@access Private

const deleteUser = asynchandler(async (req, res) => {
    const { id } = req.body
    if (!id) {
        res.status(400).json({ message: 'User id required.' })
    }

    const note = await Note.findOne({ user: id }).lean().exec()
    if (note) {
        return res.status(400).json({ message: 'User has assigned notes' })
    }
    const user = await User.findById(id).exec()

    if (!user) {
        res.status(400).json({ message: 'User not found.' })
    }


    const result = await user.deleteOne()
    console.log(result);

    const reply = `Username ${user.username} with ID ${user.id} deleted.`

    res.json(reply)
})


module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}