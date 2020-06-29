const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commandSchema = new Schema({
    _id: Number,
    command: Array
}, {timestamps: true, versionKey: false})

const commandModel = mongoose.model('command', commandSchema ,'command')

module.exports = commandModel