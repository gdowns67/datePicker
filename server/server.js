var express = require('express');
var app = express();

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