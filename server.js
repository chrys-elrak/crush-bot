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
        const webhook_event = entry.messaging[0];
        if (webhook_event.message) {
          handleMessage(sender_psid, webhook_event.message);
        } else if (webhook_event.postback) {
          handlePostback(sender_psid, webhook_event.postback);
        }
      });
      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.sendStatus(404);
    }
  });

function handlePostback(sender_psid, received_postback) {
  let response;

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { "text": "Thanks!" }
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." }
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}


function callSendAPI(sender_psid, response) {
  let request_body = {
    "recipient": {
      "id": sender_psid
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

function handleMessage(sender_psid, received_message) {

  let response;

  if (received_message.text) {
    response = {
      "text": `You sent the message: "${received_message.text}". Now send me an attachment!`
    }
  } else if (received_message.attachments) {

    let attachment_url = received_message.attachments[0].payload.url;
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
  callSendAPI(sender_psid, response);
}

app.listen(PORT, (err) => {
  if (err) throw err;
  console.info(`Server listen on port ${PORT}`);
});