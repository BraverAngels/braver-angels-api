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

router.post('/:formId', urlencodedParser, (req, res, next) => {

    const formId = req.params.formId;

    //Allow for custom field and tag keys to be passed as queries a in a webhook
    let customFieldKeys = req.query.customFields;
    customFieldKeys = customFieldKeys ? customFieldKeys.split(',') : [];

    let tagKeys = req.query.tagFields;
    tagKeys = tagKeys ? tagKeys.split(',') : [];

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


    let customFields = []
    customFieldKeys.forEach(key => {
        if (subscriber[key]) {
          customFields.push({key: subscriber[key]});
        }
    })

    let tags = [];
    tagKeys.forEach(key => {
        if (subscriber[key]) {
            tags.push(subscriber[key]);
        }
    })


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
        custom_fields: customFields
    };

    const data = {
        person: personData,
        add_tags: tags
    };

    /*
    * Send the data to Action Network
    * This will trigger the "Record Submission Helper" (https://actionnetwork.org/docs/v2/record_submission_helper)
    * The "Subscribe" form settings can be accessed here: https://actionnetwork.org/forms/subscribe-to-our-newsletter-12/manage
    */
    fetch('https://actionnetwork.org/api/v2/forms/' + formId + '/submissions/', {
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

})

module.exports = router
