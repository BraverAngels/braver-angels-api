//gcloud builds submit --tag gcr.io/braverangels/ba-api
//gcloud run deploy --image gcr.io/braverangels/ba-api --platform managed --set-env-vars "SUBSCRIBE_TOKEN=my_secret_token,AN_KEY=1cca0dc5454611648b705cb59c7bc183"


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
