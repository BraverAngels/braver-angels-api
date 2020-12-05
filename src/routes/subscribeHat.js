const express = require('express')
const fetch = require('node-fetch');
const router = express.Router()
const bodyParser = require('body-parser');

require('dotenv').config()


router.use(function validateBearerToken(req, res, next) {

    const apiToken = process.env.SUBSCRIBE_TOKEN

    let authToken = '';

    if (req.get('Authorization')) {
        authToken = req.get('Authorization').split(" ")[1];
    }

    if (!authToken || authToken !== apiToken) {
        return res.status(401).send('Unauthorized request')
    }

    // move to the next middleware if authenticated
    next()
})


// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

router.post('/', urlencodedParser, async (req, res, next) => {

    try {


        const subscriber = req.body;

        // Bail if the required data isn't present
        if (
            !subscriber.email ||
            !subscriber.zip ||
            !subscriber.first_name ||
            !subscriber.last_name
        ) {
            res.status(400).send("Required fields not present");
            return next();
        }

        let leaning = subscriber.leans ? subscriber.leans : 'Declined to say political affiliation';

        let mappings = {
            'Red (Lean Conservative)': 'Red',
            'Blue (Lean Liberal)': 'Blue',
            'Other': 'Other',
            'Prefer not to say': 'Declined to say political affiliation'
        }

        leaning = mappings[leaning];

        // Set up data to be sent to Action Network
        const personData = {
            email_addresses: [{
                address: subscriber.email,
                status: 'subscribed'
            }],
            family_name: subscriber.last_name,
            given_name: subscriber.first_name,
            postal_addresses: [{
                postal_code: subscriber.zip
            }],
            country: "US",
            language: "en",
            custom_fields: {"Master Partisanship": leaning }
        };

        if (subscriber.org) {
            personData.custom_fields['Organization'] = subscriber.org;
        }

        const data = {
            person: personData,
            add_tags: ['2020 Hold America Together Signatory']
        };

        console.log("Action network payload: " + JSON.stringify(data));

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
        let anResp = await fetch('https://actionnetwork.org/api/v2/forms/184c3e48-5c0d-4193-9ef1-cf4715f43ca2/submissions/', options);
        let anPayload = await anResp.json();
        res.status(200).send('Successfully submitted to Action Network: ' + JSON.stringify(anPayload));
    } catch(err) {
        res.status(500).send(JSON.stringify(err));
    }

})

module.exports = router
