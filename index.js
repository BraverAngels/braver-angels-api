const express = require("express");
const app = express();
const pino = require('pino-http')()
const zoomWebhook = require('./src/zoom')
const stripeWebhook = require('./src/stripe')
const subscribeWebhook = require('./src/subscribe')

const port = 5000;

// Body parser
app.use(express.json());

// Logging
app.use(pino)

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to a basic express App");
});

app.use('/zoom', zoomWebhook)
app.use('/stripe', stripeWebhook)
app.use('/subscribe', subscribeWebhook)

// Listen on port 5000
app.listen(port, () => {
  console.log(`Server is booming on port 5000
Visit http://localhost:5000`);
});
