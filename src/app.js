const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const fs = require('fs')
const app = express();
const errorHandler = require('./middlewares/errorHandler.middleware')
// const log = require('../log/route.log.txt')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

function logger(req, res, next) {
    // Date.now
    const log = `Date:- ${new Date().toLocaleString()}, Method:- ${req.method}, URL:- ${req.url}\n`
    fs.appendFile('D:/student-crud/log/route.log.txt', log, (err) => {
        if (err) {
            console.log(err);

        }
    })
    // console.log(log);
    next();
}
app.use(logger);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message
    });
});


const StudentSchema = require("./models/student.model")
const StudentRoutes = require("./routes/student.route")
const AuthRoutes = require("./routes/auth.route")

app.use('/student', StudentRoutes)
app.use('/auth', AuthRoutes)

//Error Handler
app.use(errorHandler);

module.exports = app;