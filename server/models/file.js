const mongoose = require('mongoose')
const Schema = mongoose.Schema

const fileSchema = new Schema({
    _id: String,
    fileType: String,
    pid: Number,
    fileLength: Number,
    pauseAt: Number
}, {timestamps: true, versionKey: false})

const fileModel = mongoose.model('file', fileSchema ,'file')

module.exports = fileModel