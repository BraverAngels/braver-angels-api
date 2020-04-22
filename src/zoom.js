const express = require('express')
const fetch = require('node-fetch');
const router = express.Router()
require('dotenv').config()

// The POST request will contain several
// headers such as content-type and authorization.
// The content-type header represents the media type of the resource
// The authorization header is unique to your app and confirms the validity of the request.
// To verify if a request is sent by the Zoom Service,
// compare the authorization header with the verification token generated
// in the page of your Marketplace app.


// router.use(function validateBearerToken(req, res, next) {
//   const apiToken = process.env.ZOOM_API_TOKEN
//   const authToken = req.get('Authorization')
//
//   if (!authToken || authToken.split(' ')[1] !== apiToken) {
//     return res.status(401).json({ error: 'Unauthorized request' })
//   }
//   // move to the next middleware
//   next()
// })


router.post('/', (req, res) => {

  // meeting registration created
  const registrant = req.body.payload.object.registrant;

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
    customFields: []
  };

  const data = {
    person: personData,
    addTags: [],
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
