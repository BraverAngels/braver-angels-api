const express = require('express')
const fetch = require('node-fetch');
const router = express.Router()
const bodyParser = require('body-parser')
require('dotenv').config()

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


router.use(bodyParser.json({
  // gives this endpoint access to raw body in req.rawBody
  verify: function (req, res, buf) {
    req.rawBody = buf;
  }
}), function validateStripeSignature(req, res, next) {

  const sig = req.headers['stripe-signature'];

  const endpointSecret = process.env.STRIPE_SIGNING_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  }
  catch (err) {
    console.log(err.message)
    res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // move to the next middleware if authenticated
  next()
})


router.post('/', (req, res, next) => {

  const AN_FUNDRAISING_ID = "4b5466f8-885f-432c-8b18-b491aa3ec4ab";


  // Bail if this doesn't look like a Stripe webhook request body
  if (
    typeof req.body.type === "undefined" ||
    typeof req.body.data === "undefined" ||
    typeof req.body.data.object === "undefined"
  ) {
    res.status(400).send("Required data not present");
    return next();
  }

  // Bail if this is not a "Charge Succeeded" event type
  if(req.body.type !== "charge.succeeded") {
    res.status(400).send("Unexpected event type: " + req.body.type);
    return next();
  }

  // Set up Action Network request data
  const eventData = req.body.data.object;

  const personData = {
    email_addresses: [{
      address: eventData.receipt_email,
    }],
  };

  const data = {
    identifiers: [eventData.id],
    recipients: [{
      display_name: 'Braver Angels',
      amount: eventData.amount * .01
    }],
    person: personData
  };

  /*
  * Send the data to Action Network
  * This will create a new Donation: https://actionnetwork.org/docs/v2/donations
  */
  fetch('https://actionnetwork.org/api/v2/fundraising_pages/' + AN_FUNDRAISING_ID + '/donations', {
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
  .catch((err) => {
    console.log(err.message)
    res.status(500).send('Action Network request failed')
  });

})

module.exports = router
