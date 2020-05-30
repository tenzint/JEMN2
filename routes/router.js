var express = require('express');
var router = express.Router();

const User = require('../model/User.js');

// GET /
router.get('/', function(req, res, next) {
  return res.send("working");
});
// GET profile /
router.get('/profile', function(req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if(error) {
        return next(error);
      } else {
        return res.json({
          name: user.name, email: user.email
        });
      }
    });
});

// GET /logout
router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

// POST /
router.post('/auth/signup', function (req, res, next) {
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {
    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    }
    //use schema.create to insert data into the db
    User.create(userData, function (err, user) {
      if (err) {
        return next(err)
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  }
  else {
    var err = new Error('All fields have to be filled out');
    err.status = 400;
    return next(err);
  }
})
module.exports = router; 