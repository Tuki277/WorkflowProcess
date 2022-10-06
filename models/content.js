const mongoose = require('mongoose')
const Schema = mongoose.Schema

const contentSchema = new Schema({
    content: {
        type: String,
        require: true
    },
    step: {
        type: String
    }
})

const Content = mongoose.model('Content', contentSchema)
module.exports = Content