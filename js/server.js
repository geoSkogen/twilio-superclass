'use strict'

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const fs = require('fs-extra');
const mkdirp = require('mkdirp');

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
  function putS(arg, input) {

    function getListDiffs(got_arr, added_arr) {
      var new_arr = [];
      var ex = "";
      var regex;
      for (let i = 0; i < added_arr.length; i++) {
        if (added_arr.indexOf(got_arr[i]) === -1 ) {
          new_arr.push(added_arr[i]);
        }
      }
      return new_arr;
    }

    var props = []
    var str = "";
    var data_obj = {}
    var regex;
    var resp_log = "";

    fs.readFile('./api.json', (err, data) => {
      if (err) { throw err }
      if (data.length) {
        data_obj = JSON.parse(data);
        props = Object.keys(data_obj);
      } else {
        props.push("list");
      }
      props.push(arg);
      for (let i = 0; i < props.length; i++) {
        regex = new RegExp(props[i],"i");
        console.log("regex for " + props[i] + ":" + regex)
        console.log("test result: " + regex.test(input))
        str = input.replace(regex, "");
      }
      var clean_str = str.replace(/(\s)+/g, " ");
      var clean_str = clean_str.replace(/^(\s)+/,"");
      var input_arr = clean_str.split(" ");
      switch (arg) {
        case "add" :
          console.log("got add")
          result = { "list" : (data_obj.list + "," + input_arr).split(",") };
          resp_log = "SimpleList added: " + clean_str + " to " + "list.";
          break;
        case "got" :
          result = { "list" : getListDiffs(input_arr, data_obj.list)};
          resp_log = "SimpleList removed: " + clean_str + " from " + "list.";
          break;
        default :
          result = { "list" : ["error"] }
          resp_log = "SimpleList noticed: " + clean_str + " was " + "wack.";
        }
        httpResponse(resp_log, result, true);
    })
  }

  function getS(data) {
    fs.readFile('./api.json', (err, data) => {
      if (err) { throw err }
      if (data.length) {
        var data_obj = JSON.parse(data);
        var props = Object.keys(data_obj);
        var message = "";
        for (let i = 0; i < props.length; i++) {
          message += props[i] + "\r\n\t" + data_obj[props[i]].join("\r\n\t") + "\r\n";
        }
      } else {
        message = "list\r\n\t(empty)";
      }
      httpResponse(message, result, false);
    })
  }

  function httpResponse(message, result, save) {
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
        putS(crud_cmd, sender_body);
        break;
      case "got" :
        putS(crud_cmd, sender_body);
        break;
      default :
        message = "This is SimpleList \r\n - at your service.";
        httpResponse(message, result, false);
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
