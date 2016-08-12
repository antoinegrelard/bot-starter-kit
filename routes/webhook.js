var dotenv = require('dotenv').load();
var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');
var yaml = require('js-yaml');
var _ = require('lodash');

var verifyToken = process.env.FACEBOOK_VERIFY_TOKEN;
var accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

if (!accessToken) throw new Error('FACEBOOK_PAGE_ACCESS_TOKEN is required but missing')
if (!verifyToken) throw new Error('FACEBOOK_VERIFY_TOKEN is required but missing')

try {
  var config = yaml.safeLoad(fs.readFileSync('./config/config.yaml', 'utf8'));
} catch (e) {
  console.log(e);
}

// Global variables

/* GET webhook */

router.get('/', function(req, res) {
  if (req.query['hub.verify_token'] === verifyToken) {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

router.post('/', function (req, res) {
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;

    // KEYWORDS
    if (event.message && event.message.text) {
      text = event.message.text;
      if (text.toLowerCase() === 'hello' || text.toLowerCase() === 'hi' || text.toLowerCase() === 'hey') {
        handleWelcomeMessage(sender);
      }

      // QUICKREPLIES
      if( event.message.quick_reply ) {
        var quickreply = event.message.quick_reply.payload;
      }

    }

    // POSTBACKS
    if (event.postback) {
      
      if( event.postback.payload.indexOf('welcome-message') > -1 ) {
        handleWelcomeMessage(sender);
      }

    }
  }
  res.sendStatus(200);
});

var handleWelcomeMessage = function(sender) {

  var messageData = {
    "text":"Fill with data",
  };

  sendMessage(messageData, sender);

};

var sendMessage = function(message, sender, callback) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:acessToken},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: message,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
    else if( callback ){
      callback();
    }
  });
}

module.exports = router;
