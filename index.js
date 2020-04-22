const express = require("express");
const app = express();
const zoomWebhook = require('./src/zoom')

const port = 5000;

// Body parser
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to a basic express App");
});

// Mock API
// app.get("/users", (req, res) => {
//   res.json([
//     { name: "William", location: "Abu Dhabi" },
//     { name: "Chris", location: "Vegas" }
//   ]);
// });

// app.post("/zoom", (req, res) => {
//   // const { name, location } = req.body;
//
//   res.send({ status: "User created"});
// });

app.use('/zoom', zoomWebhook)

// Listen on port 5000
app.listen(port, () => {
  console.log(`Server is booming on port 5000
Visit http://localhost:5000`);
});
