const express = require('express')
const fetch = require('node-fetch');
const router = express.Router()
const logger = require('pino-http')()
const removeMember = require('./removeMember')
require('dotenv').config()

router.post('/', async (req, res) => {
  logger(req, res)

  // const success = await removeMember('lundqub@outlook.com');
  //
  // if (!success) {
  //   res.send("Request failed")
  // }
  //
  // res.send("Success")

  res.status(200).send('working')

})

module.exports = router
