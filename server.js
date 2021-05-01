require('dotenv').config();
require('cors')({});
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// curl -X GET "localhost:3000/webhook?hub.verify_toke=<VERIFY_TOKEN>&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe"

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app
    .get('/privacy-policy', (req, res) => res.sendFile(path.resolve('./terms_and_privacy/privacy-policy.html')))

    .get('/terms', (req, res) => res.sendFile(path.resolve('./terms_and_privacy/terms.html')))

    .get('/', (req, res, next) => res.send("HELLO WORLD !"))

    .get('/webhook', (req, res) => {
        // Parse the query params
        let mode = req.query['hub.mode'];
        let token = req.query['hub.verify_token'];
        let challenge = req.query['hub.challenge'];

        // Checks if a token and mode is in the query string of the request
        if (mode && token && (mode === 'subscribe' && token === VERIFY_TOKEN)) {
            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            return res.status(200).send(challenge);
        }
        return res.sendStatus(403);
    })

    .post('/webhook', (req, res) => {

    });

app.listen(PORT, (err) => {
    if (err) throw err;
    console.info(`Server listen on port ${PORT}`);
});