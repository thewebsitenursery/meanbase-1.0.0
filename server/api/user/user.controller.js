'use strict';

var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var User = require('./user.model');
var Roles = require('../roles/roles.model');
var DAO = require('../../components/DAO');
var collection = new DAO(User);

var validationError = function(res, err) {
  return res.json(422, err);
};

// // Get list of pages
// exports.findAll = function(req, res) {
//   collection.findAll(req, res);
// };

// // Get some pages
// exports.find = function(req, res) {
//   collection.find(req, res);
// };

// // Creates a new pages in the DB.
// exports.create = function(req, res) {
//   collection.create(req, res);
// };

// Updates pages in the database
exports.update = function(req, res) {
  collection.update(req, res);
};

// // Deletes a pages from the DB.
// exports.delete = function(req, res) {
//   collection.delete(req, res);
// };

// // Get a single pages
// exports.findById = function(req, res) {
//   collection.findById(req, res);
// };

// // Updates an existing page in the DB.
// exports.updateById = function(req, res) {
//   collection.updateById(req, res);
// };

// // Deletes a pages from the DB.
// exports.deleteById = function(req, res) {
//   collection.deleteById(req, res);
// };

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.send(500, err);
    res.json(200, users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    user = user.toJSON();
    Roles.findOne({role: user.role}, function(error, found) {
      if(!found) { res.send(401); return false; }
      var permissions = [];
      for (var permission in found.permissions) {
        if (found.permissions.hasOwnProperty(permission)) {
          if(found.permissions[permission] === true) {
            permissions.push(permission);
          }
        }
      }
      user.permissions = permissions;
      res.json(user);
    });
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
