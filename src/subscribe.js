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
