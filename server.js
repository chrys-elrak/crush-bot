const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();
const PORT = process.env.port || 3000;

dotenv.config();

cors({ origin: true });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res, next) =>{
    return res.send('<h1>Hello world from Crush bit<h1>');
});

app.get('/webhook', (req, res) => {

});

app.post('/webhook', (req, res) => {

});

app.listen(PORT, "localhost", (err) => {
    if (err) throw err;
    console.info(`Server listen on port ${PORT}`);
});