const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const fs = require('fs')
const app = express();

// const log = require('../log/route.log.txt')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

function logger(req, res, next) {
    // Date.now
    const log = `Date:- ${new Date().toLocaleString()}, Method:- ${req.method}, URL:- ${req.url}\n`
    fs.appendFile('../log/route.log.txt', log, (err) => {
        if (err) {
            console.log(err);

        }
    })
    // console.log(log);
    next();
}
app.use(logger);



const StudentSchema = require("./models/student.model")
const StudentRoutes = require("./routes/student.route")
const AuthRoutes = require("./routes/auth.route")

app.use('/student', StudentRoutes)
app.use('/auth', AuthRoutes)

module.exports = app;