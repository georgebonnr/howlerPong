var express = require('express');
var app = express();
var fs = require('fs');
var logfmt = require("logfmt");
var port = Number(process.env.PORT || 5000);

app.configure(function(){
  app.use(express.static(__dirname + '/public'));
  app.use(logfmt.requestLogger());
});

app.get('/', function(req, res){
  fs.readFile('index.html', function (err, data) {
    if (err) throw err;
    res.setHeader('Content-Type', 'text/html');
    res.end(data);
  });
});

app.listen(port, function(){
  console.log("Listening on " + port);
});
