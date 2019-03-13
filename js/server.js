const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const fs = require('fs-extra');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  res.writeHead( 200, { 'Content-Type': 'text/html' });
  res.end('<h1><a href="/sms">you should be here</a></h1>');
});

app.post('/sms', (req, res) => {

  var sender_num = req.body.From;
  var sender_body = req.body.Body;
  var users = ["+15033389275"];
  var verbs = ["add","got","place","places","list","new"]
  var verbs_regex = [/add\s/i,/got\s/i,/place\s/i,/places\s?/i,/list\s?/i,/new\s?/i]
  var regex;
  var result = false;
  var crud_cmd = "";
  var message = "";

  const twiml = new MessagingResponse();

  /*
  FUNCTIONS
  */

  function putS(arg, data) {
    var props = [arg, "list"]
    var str = data;
    var ex = "";
    var regex;
    for (let i = 0; i < props.length; i++) {
      ex = props[i] + "\s";
      regex = new RegExp(ex,"i");
      str = str.replace(regex, "");
    }
    var clean_str = str.replace(/(\s)+/g, " ");
    var input_arr = clean_str.split(" ");
    var list = { "list" : input_arr };
    return list;
  }

  function getS(data) {
    var props = []
    fs.readFile('./api.json', (err, data) => {
      var message = "";
      var data_obj = JSON.parse(data);
      if (err) { throw err }
      for (let i = 0; i < props.length; i++) {
        message += (data.length) ?
          props[i] + "\r\n\t" + data_obj[props[i]].join("\r\t") + "\r\n" :
          "(empty)";
      }
      httpResponse(message,false);
    })
  }

  function httpResponse(message, save) {
    twiml.message(message);
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
    if (save) {
      commit(JSON.stringify(result));
    }
  }

  function commit(data) {
    var path = "./api.json";
    fs.writeFile(path, data, function(err) {
      if(err) {
        return console.log(err);
      }
      console.log("saved " + path);
    });
  }
  /*
  MAIN
  */
  if (users.indexOf(sender_num) === -1) {
    twiml.message('we don\'t know you');
  } else {
    for (let i = 0; i < verbs.length; i++) {
      regex = new RegExp(verbs_regex[i]);
      if (regex.test(sender_body)) {
        crud_cmd = verbs[i];
        break;
      }
    }
    switch (crud_cmd) {
      case "new" :
        message = "got new";
        break;
      case "list" :
        getS(sender_body);
        break;
      case "add" :
        result = putS(crud_cmd, sender_body);
        message = "got add\r\n";
        message += result.list.join("\r\n");
        httpResponse(message,true);
        break;
      case "got" :
        result = putS(crud_cmd, sender_body);
        message = "got got\r\n";
        message += result.list.join("\r\n");
        httpResponse(message,true);
        break;
      default:
        message = "This is sweetList - at your service.";
      }
    }
  });//ends sms post

app.get('/sms', (req, res) => {
  res.writeHead( 200, { 'Content-Type': 'text/html' });
  res.end('<h1>text me at +17066682484</h1>');
});

http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});
