'use strict';

var SECRET = process.env.JWT_SECRET || 'sshh-secret';

var _ = require('lodash');
var koaBody = require('koa-body');
var compose = require('koa-compose');
var koaJwt = require('koa-jwt')({ secret: SECRET, key: 'jwtData' });

var assert = require('http-assert');

var router = require('koa-router')();
var User = require('./users');

var motivationalQuotes = require('motivate/quotes.json');
var starwars = require('starwars');

var authenticate = compose([
  koaJwt,
  function *f_loadUser(next) {
    this.user = User.find(this.jwtData.username);

    yield next;
  }
]);

function *hasUsernameAndPassword(next) {
  /*jshint validthis: true */
  let username = this.request.body.username;
  let password = this.request.body.password;

  assert(username, 400, 'Please include a username');
  assert(password, 400, 'Please include a password');

  this.username = username;
  this.password = password;

  yield next;
}

router.get('/', function *f_home(next) {
  this.type = 'html';
  this.body = 'Welcome to the <a href="https://thinkster.io">Thinkster.io</a> Test server! Checkout the code at <a href="https://github.com/GoThinkster/test-routes">Github!</a>';
  yield next;
});

router.get('/test/hello', function *f_hello(next) {
  this.body = {message: 'Thanks for using Thinkster, you\'re awesome ;)'};

  yield next;
});

router.post('/test/uppercase', koaBody(), function *f_uppercase(next) {
  let msg = this.request.body.message;
  assert(msg, 200, 'PLZ SPECIFY A MESSAGE!');

  this.body = {message: msg.toUpperCase()};

  yield next;
});

router.post('/auth/register', koaBody(), hasUsernameAndPassword, function *f_register(next) {

  var user = User.find(this.username);
  assert(!user, 422, 'User already exists!');

  user = User.add(this.username, this.password);

  var token = user.generateToken(SECRET);

  this.body = {
    message: 'registration successful!',
    token: token
  };

  yield next;
});

router.post('/auth/login', koaBody(), hasUsernameAndPassword, function *f_login(next) {

  var user = User.find(this.username);
  assert(!!user, 422, 'No user found');
  assert(user.validPassword(this.password), 401, 'Invalid password');

  var token = user.generateToken(SECRET);

  this.body = {
    message: 'login successful!',
    token: token
  };

  yield next;
});

router.get('/auth/quote', authenticate, function *f_getQuote(next) {
  let num = _.random(0,1000);
  this.body = {};
  this.body.token = this.user.generateToken(SECRET);

  if(num < 500) {
    this.body.message = starwars();
  } else {
    let quote = _.sample(motivationalQuotes);
    this.body.message = quote.body + '  --' + quote.source;
  }

  yield next;
});

module.exports = router;
