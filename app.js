const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const fs = require('fs')
const app = express();
const connect = require('./db')

connect()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

function logger(req, res, next) {
    Date.now
    const log = `Date:- ${new Date().toLocaleString()}, Method:- ${req.method}, URL:- ${req.url}\n`
    fs.appendFile('./Log.txt', log, (err) => {
        if (err) {
            console.log(err);

        }
    })
    // console.log(log);
    next();
}
app.use(logger);


const StudentSchema = require("./models/Student")
const StudentRoutes = require("./routes/student")

app.use('/student', StudentRoutes)

module.exports = app;