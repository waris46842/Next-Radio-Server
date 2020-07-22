const mongoose = require('mongoose')
const Schema = mongoose.Schema

const groupSchema = new Schema({
    _id: String,
    member: Array
}, {timestamps: true, versionKey: false})

const groupModel = mongoose.model('group', groupSchema ,'group')

module.exports = groupModel