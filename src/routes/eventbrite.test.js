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

// contains data will result in a user with unanswered questions
let noAnswersData = {
  api_url: "https://www.eventbriteapi.com/v3/events/115530369445/attendees/1973587171/",
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

    it('Responds with a 204 if data invalid', () => {
      return request(app).post("/eventbrite")
        .type('json')
        .send({bad_key: 'bad_value'})
        .then(response => {
          expect(response.status).toEqual(204);
        })
    })

    it('Responds with a 204 if user has not answered questions', () => {
      return request(app).post("/eventbrite")
        .type('json')
        .send(noAnswersData)
        .then(response => {
          expect(response.status).toEqual(204);
        })
    })

  })

})
