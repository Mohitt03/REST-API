require("dotenv").config();
const app = require("./app");
const connect = require('./db/db')

const Port = process.env.PORT || 3000
connect()

app.listen(Port, () => console.log(`Server is running on port ${Port}`))