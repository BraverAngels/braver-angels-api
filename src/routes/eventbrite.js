const express = require('express')
const fetch = require('node-fetch');
const router = express.Router()
const bodyParser = require('body-parser')
require('dotenv').config()

// create application/json parser
var jsonParser = bodyParser.json()

router.post('/', jsonParser, (req, res, next) => {
  // req.log.info(req.body)

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
    
    if (typeof userDetails.answers === "undefined") {
      throw "No ZIP or RedBlue Info"
    }

    const zip = userDetails.answers.find(answer => 
      answer.question.toLowerCase() === "what is your zip code?" || answer.question.toLowerCase() === "what is your zipcode?"
    )

    const redBlueAnswer = userDetails.answers.find(answer => 
      answer.question.toLowerCase() === "you consider yourself"
    );

    if (!zip || !redBlueAnswer) {
      throw "No ZIP or RedBlue Info"
    }

    // Find the registrant's political affiliation in custom questions
    let politicalOffiliation = null;

    if (redBlueAnswer.answer.includes("blue")) {
      politicalOffiliation = "Blue"
    } else if (redBlueAnswer.answer.includes("red")) {
      politicalOffiliation = "Red"
    } else {
      politicalOffiliation = "Other"
    }

    const personData = {
      email_addresses: [{
        address: userDetails.profile.email,
        status: 'subscribed'
      }],
      family_name: userDetails.profile.last_name,
      given_name: userDetails.profile.first_name,
      postal_addresses: [{
        postal_code: zip.answer
      }],
      country: "US",
      language: "en",
      custom_fields: {
        'Master Partisanship': politicalOffiliation,
        [eventDetails.start.local.split("T")[0] + " " + eventDetails.name.text + "_attendance"]: "registered"
      }
    };

    const data = {
      person: personData,
      add_tags: [politicalOffiliation],
    };

    /*
    * Send the data to Action Network
    * This will trigger the "Record Submission Helper" (https://actionnetwork.org/docs/v2/record_submission_helper)
    * The "Subscribe" form settings can be accessed here: https://actionnetwork.org/forms/subscribe-to-our-newsletter-12/manage
    */
    fetch('https://actionnetwork.org/api/v2/forms/70252a3c-235d-43b2-8761-aa9c559fb6fd/submissions/', {
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
    .catch(err => {
      console.log(err.message)
      res.status(500).send('Action Network request failed')
    });

  })
  .catch(err => res.status(500).send('request failed'));

})

module.exports = router

