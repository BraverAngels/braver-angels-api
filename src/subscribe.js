const express = require('express')
const fetch = require('node-fetch');
const router = express.Router()
const bodyParser = require('body-parser');

require('dotenv').config()

// router.use(function validateBearerToken(req, res, next) {
//   const apiToken = process.env.ZOOM_API_TOKEN
//   const authToken = req.get('Authorization')
//
//   if (!authToken || authToken !== apiToken) {
//     return res.status(401).send('Unauthorized request')
//   }
//
//   // move to the next middleware if authenticated
//   next()
// })

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

router.post('/', urlencodedParser, (req, res) => {
  req.log.info(req.body)

  const subscriber = req.body

  const personData = {
    email_addresses: [{
      address: subscriber.email,
      status: 'subscribed'
    }],
    family_name: subscriber.last_name,
    given_name: subscriber.first_name,
    postal_addresses: [{
      postal_code: subscriber.zip
    }],
    country: "US",
    language: "en",
    customFields: []
  };

  const data = {
    person: personData,
  };

  fetch('https://actionnetwork.org/api/v2/forms/70252a3c-235d-43b2-8761-aa9c559fb6fd/submissions/', {
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
