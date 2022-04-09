// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204

const hasDashRegExp = /\-/gi;
const UTCformatRegExp = /^([0-9]{4,})-(0[1-9]{1}|1[012]{1})-((0[1-9]{1}|(1|2)[0-9]{1})|(3[01]))$/;

function validatorMiddleware(request, response, next) {
   const { time } = request.params;

   if (time === undefined) {
      request.time = undefined;
      next();
   };

   if (hasDashRegExp.test(time)) {
      if (time.length !== 10) {
         return response
            .status(400)
            .json({ error: "Invalid Date" });
      };

      if (!UTCformatRegExp.test(time)) {
         return response
            .status(400)
            .json({ error: "Invalid Date" });
      }
   };

   request.time = time;
   next();
}

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
   res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
   res.json({ greeting: 'hello API' });
});

app.get('/api/:time?', validatorMiddleware, (request, response) => {
   const { time } = request;

   let result = {
      unix: "",
      utc: ""
   };

   if (time === undefined) {
      result.unix = new Date().getTime();
      result.utc = new Date().toUTCString();
      return response.json(result);
   }

   if (time.length === 10 && time.indexOf('-') !== -1) {
      result.unix = new Date(time).getTime();
      result.utc = new Date(time).toUTCString();

   } else if (time.includes(" ")) {
      result.unix = new Date(time).getTime();
      result.utc = new Date(time).toUTCString();

   } else {
      result.unix = new Date(Number(time)).getTime();
      result.utc = new Date(Number(time)).toUTCString();
   }

   return response.json(result);
});



// listen for requests :)
const PORT = process.env.PORT || 3333;

var listener = app.listen(PORT, function () {
   console.log('Your app is listening on port ' + listener.address().port);
});
