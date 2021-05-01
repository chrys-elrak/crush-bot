require('dotenv').config();
require('cors')({});
const express = require('express');
const path = require('path');
const app = express();
const request = require('request');
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
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token && (mode === 'subscribe' && token === VERIFY_TOKEN)) {
      console.log('WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  })

  .post('/webhook', (req, res) => {
    const body = req.body;
    if (body.object === 'page') {
      body.entry.forEach(function (entry) {
        const webhookEvent = entry.messaging[0];
        const senderPsid = webhookEvent.sender.id;
        console.log('SENDER ID: ' + senderPsid);
        if (webhookEvent.message) {
          console.log("MESSAGE");
          handleMessage(senderPsid, webhookEvent.message);
        } else if (webhookEvent.postback) {
          console.log("POST BACK");
          handlePostback(senderPsid, webhookEvent.postback);
        }
        console.log("IDK");
      });
      return res.status(200).send('EVENT_RECEIVED');
    }
    return res.sendStatus(404);
  });

function handlePostback(senderPsid, received_postback) {
  let response;

  let payload = received_postback.payload;
  if (payload === 'yes') {
    response = { "text": "Thanks!" }
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." }
  }
  callSendAPI(senderPsid, response);
}


function callSendAPI(senderPsid, response) {
  let request_body = {
    "recipient": {
      "id": senderPsid
    },
    "message": response
  }

  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

function handleMessage(senderPsid, receivedMessage) {

  let response;

  if (receivedMessage.text) {
    response = {
      "text": `You sent the message: "${receivedMessage.text}". Now send me an attachment!`
    }
  } else if (receivedMessage.attachments) {

    let attachment_url = receivedMessage.attachments[0].payload.url;
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this the right picture?",
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no",
              }
            ],
          }]
        }
      }
    }
  }
  callSendAPI(senderPsid, response);
}

app.listen(PORT, (err) => {
  if (err) throw err;
  console.info(`Server listen on port ${PORT}`);
});