const express = require("express");
const request = require('supertest')
const subscribeWebhook = require('./subscribe')

//set up basic Express app
const app = express();
require('dotenv').config()
app.use('/subscribe', subscribeWebhook)

// Example webhook payload from Zoom docs
let requestData = {
  first_name: 'Braver',
  last_name: 'Angels',
  email: 'test_subscriber@braverangels.org',
  zip: '10170'
}


describe('API Routes', () => {

  describe('POST /subscribe', () => {
    // it('Responds with a 401 if not given auth token', () => {
    //   return request(app).post("/zoom")
    //     .then(response => {
    //       expect(response.status).toEqual(401);
    //     })
    // })

    it('Responds with a 400 if person data invalid', () => {
      return request(app).post("/subscribe")
        .send({bad_key: 'bad_value'})
        .type('form')
        // .set("Authorization", process.env.ZOOM_API_TOKEN)
        .then(response => {
          expect(response.status).toEqual(400);
        })
    })

    it.skip('Responds with a 200 if person data is included', () => {
      return request(app).post("/subscribe")
        .send(requestData)
        .type('form')
        // .set("Authorization", process.env.ZOOM_API_TOKEN)
        .then(response => {
          expect(response.status).toEqual(200);
        })
    })

  })

})
