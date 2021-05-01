require('dotenv').config();
require('cors')({});

console.log(process.env.PORT);
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.port || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/privacy-policy', (req, res) => res.sendFile(path.resolve('./privacy-policy.html')));


app.get('/', (req, res, next) =>{
    console.log("GET HOME !");
    return res.send('<h1>Hello world from Crush bit<h1>');
});

app.get('/webhook', (req, res) => {

});

app.post('/webhook', (req, res) => {

});

app.listen(PORT, (err) => {
    if (err) throw err;
    console.info(`Server listen on port ${PORT}`);
});