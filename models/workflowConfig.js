const mongoose = require('mongoose')
const Schema = mongoose.Schema

const workflowConfigSchema = new Schema({
    data: {
        type: String,
        require: true
    },
})

const WorkflowConfig = mongoose.model('WorkflowConfig', workflowConfigSchema)
module.exports = WorkflowConfig