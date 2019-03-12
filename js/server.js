const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  res.writeHead( 200, { 'Content-Type': 'text/html' });
  res.end('<h1><a href="/sms">you should be here</a></h1>');
});

app.post('/sms', (req, res) => {
  var sender_num = req.body.From;
  var sender_body = req.body.Body;
  var key_code = "12345";
  var users = ["5033389275"];
  var verbs = ["new","list","add","got"]
  var result = "pocky"
  var loop_break = false;
  const twiml = new MessagingResponse();
    if (users.indexOf("+1" + sender_num) != -1) {
      for (let i = 0; i < verbs.length; i++) {
        if (sender_body.indexOf(verbs[i]) != -1) {
          result = verbs[i];
          loop_break = true;
        }
        if (loop_break) {
          break;
        }
      }
    }
  twiml.message('this message was sent to ' + sender_body);
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

app.get('/sms', (req, res) => {
  res.writeHead( 200, { 'Content-Type': 'text/html' });
  res.end('<h1>text me at +17066682484</h1>');
});

http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});
