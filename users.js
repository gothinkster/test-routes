'use strict';

var jwt = require('jsonwebtoken');

function User(username, password, id) {
  this.username = username;
  this.password = password;
  this.id = id;
}

User.prototype.generateToken = function(secret) {
  // set expiration to 1 day
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 1);

  return jwt.sign({
    username: this.username,
    id: this.id,
    exp: parseInt(exp.getTime() / 1000)
  }, secret);
};

User.prototype.validPassword = function(password) {
  return this.password === password;
};

var users = [];

// users.push(new User('matt', 'test', 0));

exports.find = function(username) {
  return users.find(function(u, i) {
    return u.username === username;
  });
};

exports.add = function(username, password) {
  var user = new User(username, password, users.length);

  users.push(user);

  return user;
};

