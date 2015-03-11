'use strict';

var koa = require('koa');
var compress = require('koa-compress');
var logger = require('koa-logger');
var cors = require('koa-cors');


function *handleErrors(next) {
  try {
    yield next;
  } catch (err) {
    this.status = err.status;
    this.body = {message: err.message};
  }
}


var app = koa();
app.use(logger());
app.use(handleErrors);
app.use(cors({
  headers: ['Authorization', 'Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
}));
app.use(require('./routes').routes());
app.use(compress());

app.on('error', function(error) {
  console.error(error.message);
});



module.exports = app;
if (!module.parent) {
  var port = process.env.PORT || 3002;
  app.listen(port);
  console.log('listening on port', port);
}
