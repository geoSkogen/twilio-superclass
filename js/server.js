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
  var verbs = ["new","list","add","got","place","places"]
  var result = false;
  var crud_cmd = "";
  var buffer = "";
  var message = "";
  const twiml = new MessagingResponse();

  function putS(arg, data) {
    var props = [arg, "list"]
    var str = data;
    for (let i = 0; i < props.length; i++) {
      str = str.replace(props[i] + " ", "");
    }
    var clean_str = str.replace(/(\s)+/g, " ");
    var input_arr = clean_str.split(" ");
    var list = { "list" : input_arr };
    return list;
  }

  function getS(data) {
    var props = ["list"];
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


    if (users.indexOf(sender_num) === -1) {
      twiml.message('we don\'t know you');
    } else {
      for (let i = 0; i < verbs.length; i++) {
        if (sender_body.indexOf(verbs[i]) != -1) {
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
          message = "got default";
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
