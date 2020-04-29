const express = require('express')
const fetch = require('node-fetch');
const router = express.Router()
const logger = require('pino-http')()
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


router.post('/', (req, res) => {
  logger(req, res)

  // meeting registration created
  // const registrant = req.body.payload.object.registrant;
  //
  // const personData = {
  //   email_addresses: [{
  //     address: registrant.email,
  //     status: 'subscribed'
  //   }],
  //   family_name: registrant.last_name,
  //   given_name: registrant.first_name,
  //   postal_addresses: [{
  //     postal_code: registrant.zip
  //   }],
  //   country: "US",
  //   language: "en",
  //   customFields: []
  // };
  //
  // const data = {
  //   person: personData,
  //   addTags: [],
  // };
  console.log(req)
  res.status(200).send('working')

  // fetch('https://actionnetwork.org/api/v2/people/', {
  //       method: 'POST',
  //       body: JSON.stringify(data),
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'OSDI-API-Token': process.env.AN_KEY
  //       },
  //   })
  //   .then(res => {
  //     if (!res.ok) {
  //       throw "Request error"
  //     }
  //     return res.text()
  //   })
  //   .then(() => res.status(200).send('Successfully submitted to Action Network'))
  //   .catch(err => res.status(500).send('Action Network request failed'));


})

module.exports = router
