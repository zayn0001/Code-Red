"use strict";
const token = process.env.WHATSAPP_TOKEN;

const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  axios = require("axios").default,
  app = express().use(body_parser.json()); 
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

function sendWhatsAppMessage(phone_number_id, to, text) {
  axios({
    method: "POST",
    url:
      "https://graph.facebook.com/v12.0/" +
      phone_number_id +
      "/messages?access_token=" +
      token,
    data: {
      messaging_product: "whatsapp",
      to: to,
      text: { body: text },
    },
    headers: { "Content-Type": "application/json" },
  });
}

function handleLocationSharing(phone_number_id, from, location) {
  // Process the location data and provide alerts or services based on the user's location
  // You can access the latitude and longitude from the 'location' parameter
   const latitude = location.latitude;
   const longitude = location.longitude;

  // Here, you can implement your logic to provide location-based alerts or services
  // You can send relevant messages or interact with external services based on the user's location.

  // Example:
  // Send a "thank you" message for sharing location
  sendWhatsAppMessage(phone_number_id, from, "Thank you for sharing your location. We appreciate it!");

  // Implement your alert logic or interact with external APIs here based on the user's location.
}

app.post("/webhook", (req, res) => {
  let body = req.body;

  //console.log(JSON.stringify(req.body, null, 2));

  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = req.body.entry[0].changes[0].value.messages[0].from;
      let msg_body = req.body.entry[0].changes[0].value.messages[0].text ? req.body.entry[0].changes[0].value.messages[0].text.body : ""
      let location = req.body.entry[0].changes[0].value.messages[0].location;
      
      if (msg_body.toLowerCase() === "hi") {
        sendWhatsAppMessage(phone_number_id, from, "Hello! Please share your location with me so that I can provide you with location-based alerts.");
      }else if(location) {
        console.log(location)
        handleLocationSharing(phone_number_id, from, location);
      } else {
        // Implement your geographical alert functionality here
        // You can guide the user to share their location by responding to other messages
        
      }
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  }
});

app.get("/webhook", (req, res) => {
  const verify_token = process.env.VERIFY_TOKEN;
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];
  if (mode && token) {
    if (mode === "subscribe" && token === verify_token) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});