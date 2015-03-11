'use strict';

var SECRET = process.env.JWT_SECRET || 'sshh-secret';

var koaBody = require('koa-body');
var assert = require('http-assert');
var authenticate = require('koa-jwt')({ secret: SECRET });

var router = require('koa-router')();
var User = require('./users')

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

router.get('/', function *() {
  this.type = 'html';
  this.body = 'Welcome to the <a href="https://thinkster.io">Thinkster.io</a> Test server! Checkout the code at <a href="https://github.com/GoThinkster/test-routes">Github!</a>';
});

router.get('/hello', function *() {
  this.body = {message: 'Thanks for using Thinkster, you\'re awesome ;)'};
});

router.post('/uppercase', koaBody(), function *() {
  let msg = this.request.body.message;
  assert(msg, 200, 'PLZ SPECIFY A MESSAGE!');

  this.body = {message: msg.toUpperCase()};
});

router.post('/register', koaBody(), hasUsernameAndPassword, function *register() {

  var user = User.find(this.username);
  assert(!user, 422, 'User already exists!');

  user = User.add(this.username, this.password);

  var token = user.generateToken(SECRET);

  this.body = {
    message: 'registration successful!',
    token: token
  };
});

router.post('/login', koaBody(), hasUsernameAndPassword, function *login() {

  var user = User.find(this.username);
  assert(!!user, 422, 'No user found');
  assert(user.validPassword(this.password), 401, 'Invalid password');

  var token = user.generateToken(SECRET);

  this.body = {
    message: 'login successful!',
    token: token
  };

});

router.get('/secret', authenticate, function *() {
  this.body = {message: 'Congrats '+this.user.username+', you\'re authed!'};
});

module.exports = router;
