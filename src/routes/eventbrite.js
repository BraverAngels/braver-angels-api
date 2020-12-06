const express = require('express')
const fetch = require('node-fetch');
const router = express.Router()
const bodyParser = require('body-parser')
require('dotenv').config()

// create application/json parser
var jsonParser = bodyParser.json()

router.post('/', jsonParser, async (req, res, next) => {

  if(!req.body.hasOwnProperty('api_url')) {
    res.status(200).send("No api url provided");
    return next();
  }

  //console.log('Eventbrite payload: ' + JSON.stringify(req.body));

  const attendeeUrl = req.body.api_url + "?token=" + process.env.EVENTBRITE_TOKEN;

  //console.log('Attendee url: ' + attendeeUrl);

  const eventUrl = attendeeUrl.split("/attendees")[0] + "?token=" + process.env.EVENTBRITE_TOKEN;

  //console.log('Event url: ' + eventUrl);

  try {

    let userDetailsResp = await fetch(attendeeUrl);
    let userDetails = await userDetailsResp.json();

    let eventDetailsResp = await fetch(eventUrl);
    let eventDetails = await eventDetailsResp.json();

    let personData = {
      email_addresses: [{
        address: userDetails.profile.email,
        status: 'subscribed'
      }],
      family_name: userDetails.profile.last_name,
      given_name: userDetails.profile.first_name,
      language: "en",
      custom_fields: {
        [eventDetails.start.local.split("T")[0] + " " + eventDetails.name.text + "_attendance"]: "registered"
      }
    };

    let politicalAffiliation = null;

    if (userDetails.answers) {

      const zip = userDetails.answers.find(item =>
          item.question.toLowerCase() === "what is your zip code?"
          && typeof item.answer !== "undefined"
      )
      if (zip) {
        personData.postal_addresses = [{
          postal_code: zip.answer,
          country: "US"
        }]
      }

      const redBlueAnswer = userDetails.answers.find(item =>
          item.question.toLowerCase() === "you consider yourself"
          && typeof item.answer !== "undefined"
      );

      if (redBlueAnswer) {
        // Find the registrant's political affiliation in custom questions
        if (redBlueAnswer.answer.includes("blue")) {
          politicalAffiliation = "Blue"
        } else if (redBlueAnswer.answer.includes("red")) {
          politicalAffiliation = "Red"
        } else if (redBlueAnswer.answer.includes("prefer") && redBlueAnswer.answer.includes("not")) {
          politicalAffiliation = "Declined"
        } else {
          politicalAffiliation = "Other"
        }
        personData.custom_fields['Master Partisanship'] = politicalAffiliation
      }
    }

    const data = {
      person: personData
    };

    if (politicalAffiliation) {
      data.add_tags = [politicalAffiliation]
    }

    /*
    * Send the data to Action Network
    * This will trigger the "Record Submission Helper" (https://actionnetwork.org/docs/v2/record_submission_helper)
    * The "Subscribe" form settings can be accessed here: https://actionnetwork.org/forms/subscribe-to-our-newsletter-12/manage
    */
    let options = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'OSDI-API-Token': process.env.AN_KEY
      }
    }

    await fetch('https://actionnetwork.org/api/v2/forms/70252a3c-235d-43b2-8761-aa9c559fb6fd/submissions/', options);

    res.status(200).send('Successfully submitted to Action Network')

  } catch(err) {

    console.log(err.stack);
    res.status(500).send(JSON.stringify(err))

  }

})

module.exports = router

