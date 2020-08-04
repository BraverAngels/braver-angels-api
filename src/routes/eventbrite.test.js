const express = require("express");
const request = require('supertest')
const eventbriteWebhook = require('./eventbrite')

//set up basic Express app
const app = express();
require('dotenv').config()
app.use('/eventbrite', eventbriteWebhook)

// Example webhook payload
let requestData = {
  api_url: "https://www.eventbriteapi.com/v3/events/113414738536/attendees/1946033618/",
  config: {
    action: "attendee.updated",
    endpoint_url: "https://braverangels-api.now.sh/eventbrite",
    user_id: "449599273692",
    webhook_id: "2325190"
  }
}


describe('API Routes', () => {

  describe('POST /eventbrite', () => { 

    it('Responds with a 200 if correct data is included', () => {
      return request(app).post("/eventbrite")
        .type('json')
        .send(requestData)        
        .then(response => {
          expect(response.status).toEqual(200);
        })
    })

    it('Responds with a 500 if data invalid', () => {
      return request(app).post("/eventbrite")
        .type('json')
        .send({bad_key: 'bad_value'})
        .then(response => {
          expect(response.status).toEqual(500);
        })
    })

  })

})
