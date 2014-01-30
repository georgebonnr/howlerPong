var express = require('express');
var app = express();
var fs = require('fs');

app.configure(function(){
  app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res){
  console.log('hi');
  fs.readFile('index.html', function (err, data) {
    if (err) throw err;
    res.setHeader('Content-Type', 'text/html');
    res.end(data);
  });
});

app.listen(3000);
