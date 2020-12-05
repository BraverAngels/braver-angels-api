//This project gets deployed on Google Cloud Run
//gcloud builds submit --tag gcr.io/braverangels/ba-api
//gcloud run deploy --image gcr.io/braverangels/ba-api --platform managed
//Don't forget to set environment variables using gcloud run services update ba-api --update-env-vars - see local .env-commands file
//Required ENV variables:
// SUBSCRIBE_TOKEN - use 'my_secret_token' value... passed only to avoid anonymous requests.
// AN_KEY - secret key from Action Network
// STRIPE_SIGNING_SECRET - temporarily deprecated due to issues with rawBody methods
// STRIPE_SECRET_KEY

const express = require("express");
const app = express();
const port = 8080;
const pino = require('express-pino-logger')()
const zoomWebhook = require('./src/routes/zoom')
const stripeWebhook = require('./src/routes/stripe')
const eventbriteWebhook = require('./src/routes/eventbrite')
const subscribeWebhook = require('./src/routes/subscribe')
const hatWebhook = require('./src/routes/subscribeHat')

app.use(express.json());

// Logging
// app.use(pino)

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to a basic express App");
});

app.use('/zoom', zoomWebhook)
app.use('/stripe', stripeWebhook)
app.use('/subscribe', subscribeWebhook)
app.use('/subscribeHat', hatWebhook)
app.use('/eventbrite', eventbriteWebhook)

app.listen(port, () => {
  console.log(`handleZoomRequest: listening on port ${port}`);
});
