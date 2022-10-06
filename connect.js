const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        let db = "mongodb://localhost"
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })

        console.log('database has connected')
    } catch (error) {
        console.log(error.message)
        process.exit(1)
    }
}

module.exports = connectDB;