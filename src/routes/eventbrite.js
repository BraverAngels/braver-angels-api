const express = require('express')
const fetch = require('node-fetch');
const router = express.Router()
const bodyParser = require('body-parser')
require('dotenv').config()

// create application/json parser
var jsonParser = bodyParser.json()

router.post('/', jsonParser, (req, res, next) => {
  req.log.info(req.body)

  const attendeeUrl = req.body.api_url + "?token=" + process.env.EVENTBRITE_TOKEN;
  const eventUrl = attendeeUrl.split("/attendees")[0] + "?token=" + process.env.EVENTBRITE_TOKEN;
  let foundData;

  function getUserDetails() {
    return fetch(attendeeUrl)
      .then(res => {
        if (!res.ok) {
          throw "Request error"
        }
        return res.json()
      })
      .then(data => data)
      .catch(err => res.status(500).send('request failed'));
  }

  function getEventDetails() {
    return fetch(eventUrl)
      .then(res => {
        if (!res.ok) {
          throw "Request error"
        }
        return res.json()
      })
      .then(data => data)
      .catch(err => res.status(500).send('request failed'));
  }


  Promise.all([getEventDetails(), getUserDetails()]).then(([eventDetails, userDetails]) => {
    
    const zip = userDetails.answers.find(answer => 
      answer.question.toLowerCase() === "what is your zip code?"
    ).answer;

    const redBlueAnswer = userDetails.answers.find(answer => 
      answer.question.toLowerCase() === "you consider yourself"
    ).answer;

    // Find the registrant's political affiliation in custom questions
    let politicalOffiliation = null;

    if (redBlueAnswer.includes("blue")) {
      politicalOffiliation = "Blue"
    } else if (redBlueAnswer.includes("red")) {
      politicalOffiliation = "Red"
    } else {
      politicalOffiliation = "Other"
    }

    foundData = {
      eventName: eventDetails.name.text,
      eventDate: eventDetails.start.local.split("T")[0],
      firstName: userDetails.profile.first_name,
      lastName: userDetails.profile.last_name,
      email: userDetails.profile.email,
      zip,
      politicalOffiliation
    }

    const personData = {
      email_addresses: [{
        address: userDetails.profile.email,
        status: 'subscribed'
      }],
      family_name: userDetails.profile.last_name,
      given_name: userDetails.profile.first_name,
      postal_addresses: [{
        postal_code: zip
      }],
      country: "US",
      language: "en",
      custom_fields: {
        'Master Partisanship': politicalOffiliation,
        [eventDetails.name.text + "_attendance"]: "registered"
      }
    };

    const data = {
      person: personData,
      add_tags: [politicalOffiliation],
    };

    /*
    * Send the data to Action Network
    * This will trigger the "Person Signup Helper" (https://actionnetwork.org/docs/v2/person_signup_helper)
    */
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

  });

})

module.exports = router

