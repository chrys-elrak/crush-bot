require('dotenv').config()
require('cors')({})
const express = require('express')
const path = require('path')
const app = express()
const request = require('request')
const PORT = process.env.PORT || 3000

// curl -X GET "localhost:3000/webhook?hub.verify_toke=<VERIFY_TOKEN>&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe"

const VERIFY_TOKEN = process.env.VERIFY_TOKEN

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app
  .get('/privacy-policy', (req, res) => res.sendFile(path.resolve('./terms_and_privacy/privacy-policy.html')))

  .get('/terms', (req, res) => res.sendFile(path.resolve('./terms_and_privacy/terms.html')))

  .get('/', (req, res) => res.send('HELLO WORLD !'))

  .get('/webhook', (req, res) => {
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (mode && token && (mode === 'subscribe' && token === VERIFY_TOKEN)) {
      console.log('WEBHOOK_VERIFIED')
      return res.status(200).send(challenge)
    }
    return res.sendStatus(403)
  })

  .post('/webhook', (req, res) => {
    const body = req.body
    if (body.object === 'page') {
      body.entry.forEach(function (entry) {
        const webhookEvent = entry.messaging[0]
        const userId = webhookEvent.sender.id
        console.log('SENDER ID: ' + userId)
        handleEvent(webhookEvent)
      })
      return res.status(200).send('EVENT_RECEIVED')
    }
    return res.sendStatus(404)
  })

function callSendAPI (userId, response) {
  const requestBody = {
    recipient: {
      id: userId
    },
    message: response
  }

  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: requestBody
  }, (err) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error('Unable to send message:' + err)
    }
  })
}

function handleEvent (event, userId) {
  console.log(event)
  let response
  if (event.message) {
    const { text, attachments } = event.message
    response = {
      text: `You send ${text} !`
    }
    callSendAPI(userId, response)
    return
  }

  if (event.postback) {
    const { payload } = event.postback
    if (payload === 'yes') {
      response = { text: 'Thanks!' }
    } else if (payload === 'no') {
      response = { text: 'Oops, try sending another image.' }
    }
    callSendAPI(userId, response)
  }
}

app.listen(PORT, (err) => {
  if (err) throw err
  console.info(`Server listen on port ${PORT}`)
})
