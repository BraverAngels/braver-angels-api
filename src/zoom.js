const express = require('express')
const fetch = require('node-fetch');
const router = express.Router()
const logger = require('pino-http')()
var bodyParser = require('body-parser')
require('dotenv').config()

// create application/json parser
var jsonParser = bodyParser.json()

router.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.ZOOM_API_TOKEN
  const authToken = req.get('Authorization')

  if (!authToken || authToken !== apiToken) {
    return res.status(401).send('Unauthorized request')
  }

  // move to the next middleware if authenticated
  next()
})


router.post('/', jsonParser, (req, res, next) => {



  // meeting registration created
  const topic = req.body.payload.object.topic;
  const registrant = req.body.payload.object.registrant;

  // find the registrant's "color" (political affiliation)
  const colorAnswer = registrant.custom_questions.find((question) => {
    const questionTitle = question.title.toLowerCase();
    return questionTitle === "you consider yourself" || questionTitle === "i consider myself";
  });

  if (!colorAnswer) {
    res.status(204).send('Not a debate/workshop registrant');
    return next();
  }

  let registrantColor = null

  if (colorAnswer.value.toLowerCase().includes("other")) {
    registrantColor = "Other"
  } else if (colorAnswer.value.toLowerCase().includes("blue")) {
    registrantColor = "Blue"
  } else if (colorAnswer.value.toLowerCase().includes("red")) {
    registrantColor = "Red"
  }

  // set up request data
  const personData = {
    email_addresses: [{
      address: registrant.email,
      status: 'subscribed'
    }],
    family_name: registrant.last_name,
    given_name: registrant.first_name,
    postal_addresses: [{
      postal_code: registrant.zip
    }],
    country: "US",
    language: "en",
    custom_fields: {
      'Master Partisanship': registrantColor,
      [topic + "_attendance"]: "registered"
    }
  };

  const data = {
    person: personData,
    add_tags: [registrantColor],
  };

  fetch('https://actionnetwork.org/api/v2/people/', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'OSDI-API-Token': process.env.AN_KEY
        },
    })
    .then(res => {
      if (!res.ok) {
        throw "Request error"
      }
      return res.text()
    })
    .then(() => res.status(200).send('Successfully submitted to Action Network'))
    .catch(err => res.status(500).send('Action Network request failed'));

})

module.exports = router
