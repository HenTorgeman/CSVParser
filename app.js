const http = require('http');
const https = require('https');

const express = require("express");
const Calc = require('./Routes/Calc');
const Parts = require('./Routes/Parts');


const app = express();
const hostname = '127.0.0.1';
const port = 3000;

const mongoose = require('mongoose');
const mongoDB = 'mongodb://127.0.0.1:27017/parserDB';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once("open", () => console.log("Connected to mongo"));
app.listen(port, () => console.log(`Example app listening at http://${hostname}:${port}/`))
app.use("/Calc", Calc);
app.use("/Parts",Parts);


module.exports = app;



