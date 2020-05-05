const express = require("express");
const request = require('supertest')
const zoomWebhook = require('./zoom')

//set up basic Express app
const app = express();
require('dotenv').config()
app.use('/zoom', zoomWebhook)

// Example webhook payload from Zoom docs
let requestData = {
  event: 'meeting.registration_created',
  payload: {
    account_id: 'lAAAAAAAAAAAAA',
    object: {
      uuid: 'dj12vck6sdTn6yy7qdy3dQg==',
      id: 150000008,
      host_id: 'uLobbbbbbbbbb_qQsQ',
      topic: 'A test meeting',
      type: 2,
      start_time: '2019-07-11T20:00:00Z',
      duration: 120,
      timezone: 'America/Los_Angeles',
      registrant: {
        id: 'U0BBBBBBBBBBfrUz1Q',
        first_name: 'Braver',
        last_name: 'Angels',
        email: 'test_subscriber@braverangels.org',
        address: '',
        city: '',
        country: '',
        zip: '98119',
        state: '',
        phone: '',
        industry: '',
        org: '',
        job_title: '',
        purchasing_time_frame: '',
        role_in_purchase_process: '',
        no_of_employees: '',
        comments: '',
        status: 'approved',
        join_url: 'https://zoom.us/w/someendpointhere',
        custom_questions: [
          {
            title: 'How do you view yourself with respect to this debate\'s resolution? Resolved: Market based solutions are more efficient and effective than direct regulation to tackle the threat of climate change.',
            value: 'Pro, or affirmative, I agree with it'
          },
          {
            title: 'How willing are you to speak in this debate?',
            value: '5. Strongly willing'
          },
          {
            title: 'You consider Yourself',
            value: 'Lean Blue (you lean liberal philosophically, or tend to vote for Democrats).'
          }
        ]
      }
    }
  }
}


describe('API Routes', () => {

  describe('POST /zoom', () => {
    it('Responds with a 401 if not given auth token', () => {
      return request(app).post("/zoom")
        .then(response => {
          expect(response.status).toEqual(401);
        })
    })

    it('Responds with a 500 if person data if invalid', () => {
      return request(app).post("/zoom")
        .type('json')
        .send({bad_key: 'bad_value'})
        .set("Authorization", process.env.ZOOM_API_TOKEN)
        .then(response => {
          expect(response.status).toEqual(500);
        })
    })

    it('Responds with a 200 if person data is included', () => {
      return request(app).post("/zoom")
        .send(requestData)
        .type('json')
        .set("Authorization", process.env.ZOOM_API_TOKEN)
        .then(response => {
          expect(response.status).toEqual(200);
        })
    })

    it('Responds with a 204 if person data is included but no red/blue custom question exists', () => {
      requestData.payload.object.registrant.custom_questions = [];
      return request(app).post("/zoom")
        .send(requestData)
        .type('json')
        .set("Authorization", process.env.ZOOM_API_TOKEN)
        .then(response => {
          expect(response.status).toEqual(204);
        })
    })
  })

})
