const mongoose = require('mongoose');

const connect = async () => {
    await mongoose.connect(process.env.MONGO_URI).then(a => console.log("Mongodb is connected"))
        .catch((err) => {
            console.log("Not Connected")
        })
}

module.exports = connect;