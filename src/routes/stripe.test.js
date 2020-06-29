const express = require("express");
const request = require('supertest')
const stripeWebhook = require('./stripe')

//set up basic Express app
const app = express();
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
app.use('/stripe', stripeWebhook)


// Example webhook payload from Zoom docs
let requestData = {
  id: 'evt_test_webhook',
  object: 'event',
  api_version: '2017-08-15',
  created: 1588779610,
  data: {
    object: {
      id: 'ch_1GfpLxChac06VqLYH2JYSk44',
      object: 'charge',
      amount: 100,
      receipt_email: 'test_subscriber@braverangels.org',
    }
  },
  type: 'charge.succeeded'
}

const payloadString = JSON.stringify(requestData, null, 2);
const secret = process.env.STRIPE_SECRET_KEY;

const headerString = stripe.webhooks.generateTestHeaderString({
  payload: payloadString,
  secret,
});


describe('API Routes', () => {

  describe('POST /stripe', () => {
    it('Responds with a 401 if not given auth token', () => {
      return request(app).post("/stripe")
        .then(response => {
          expect(response.status).toEqual(401);
        })
    })

    it('Responds with a 400 if event data if invalid', () => {
      return request(app).post("/stripe")
        .type('json')
        .send({bad_key: 'bad_value'})
        .set("stripe-signature", headerString)
        .then(response => {
          expect(response.status).toEqual(400);
        })
    })

    it.skip('Responds with a 200 if event data is included', () => {
      return request(app).post("/stripe")
        .type('json')
        .send(requestData)
        .set("stripe-signature", headerString)
        .then(response => {
          expect(response.status).toEqual(200);
        })
    })

    it('Responds with a 400 event type is incorrect', () => {
      requestData.type = "charge.rejected";
      return request(app).post("/stripe")
        .type('json')
        .send(requestData)
        .set("stripe-signature", headerString)
        .then(response => {
          expect(response.status).toEqual(400);
        })
    })
  })

})
