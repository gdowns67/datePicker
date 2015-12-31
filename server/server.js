var logger = require('morgan');
var express = require('express');
var url = require('url');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');

app.listen('8082');

var defaultPaths = {
    '/datepickr': '../datepickr',
    '/': '../datepicker',
    '/server': './'
};

var map = function (resource, localPath) {
    app.use(resource, express.static(localPath));
};

for (var p in defaultPaths) {
    map(p, defaultPaths[p]);
}