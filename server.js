require('dotenv').config();
require('cors')({});
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app
.get('/privacy-policy', (req, res) => res.sendFile(path.resolve('./terms_and_privacy/privacy-policy.html')))

.get('/terms', (req, res) => res.sendFile(path.resolve('./terms_and_privacy/terms.html')))

.get('/', (req, res, next) => res.send("HELLO WORLD !"));

app.get('/webhook', (req, res) => {

});

app.post('/webhook', (req, res) => {

});

app.listen(PORT, (err) => {
    if (err) throw err;
    console.info(`Server listen on port ${PORT}`);
});