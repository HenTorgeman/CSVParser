const http = require('http');
const https = require('https');

const express = require("express");
const FileAnalysis = require('./Routes/FileAnalysis');
const MachiningPart = require('./Routes/MachiningPart');


const app = express();
const hostname = '127.0.0.1';
const port = 3000;

const mongoose = require('mongoose');
const mongoDB = 'mongodb://127.0.0.1:27017/parserDB';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once("open", () => console.log("## You are connected to mongooseDB....📡"));
app.listen(port, () => console.log(`## The program listening at http://${hostname}:${port}/`))
app.use("/FileAnalysis", FileAnalysis);
app.use("/MachiningPart",MachiningPart);


module.exports = app;



