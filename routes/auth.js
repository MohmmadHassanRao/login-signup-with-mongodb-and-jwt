const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt-inzi");
const { userModel } = require("../dbrepo/models");
const api = express.Router();
const { SERVER_SECRET } = require("../core/");
console.log("userModel=>", userModel);
console.log("server Secret=>", SERVER_SECRET);

// Signup
api.post("/signup", (req, res, next) => {
  // for postman
  if (!req.body.userName || !req.body.userEmail || !req.body.userPassword) {
    res.status(403).send(`
              please send name, email, password, phone and gender in json body.
              e.g:
              {
                  "userName": "h",
                  "userEmail": "h@gmail.com",
                  "userPassword": "abc",
                 
              }`);
    return;
  }
  // it will loop through database
  userModel.findOne({ email: req.body.userEmail }, function (err, doc) {
    if (!err && !doc) {
      bcrypt
        .stringToHash(req.body.userPassword)
        .then(function (hashedPassword) {
          var newUser = new userModel({
            name: req.body.userName,
            email: req.body.userEmail,
            password: hashedPassword,
          });
          newUser.save((err, data) => {
            if (!err) {
              res.send({
                message: "account created successfully",
              });
            } else {
              console.log(err);
              res.status(500).send({
                message: "user create error, " + err,
              });
            }
          });
        });
    } else if (err) {
      res.status(500).send({
        message: "db error",
      });
    } else {
      res.status(403).send({
        message: "user already exist",
      });
    }
  });
});

//   login
api.post("/login", (req, res, next) => {
  if (!req.body.currentEmail || !req.body.currentPassword) {
    res.status(403).send(`
              please send email and password in json body.
              e.g:
              {
                  "currentEmail": "hassan@gmail.com",
                  "currentPassword": "abc",
              }`);
    return;
  }

  userModel.findOne({ email: req.body.currentEmail }, function (err, user) {
    if (err) {
      res.status(500).send({
        message: "an error occurred: " + JSON.stringify(err),
      });
    } else if (user) {
      // verify if current user password and database password is matched
      bcrypt
        .varifyHash(req.body.currentPassword, user.password)
        .then((isMatched) => {
          if (isMatched) {
            console.log("password matched");
            // assign a token to user on successful login
            var token = jwt.sign(
              {
                id: user._id,
                name: user.name,
                email: user.email,
              },
              SERVER_SECRET
            );

            res.cookie("jToken", token, {
              maxAge: 86_400_000,
              httpOnly: true,
            });

            res.send({
              message: "login success",
              user: {
                name: user.name,
                email: user.email,
              },
            });
          } else {
            console.log("not matched");
            res.status(401).send({
              message: "incorrect password",
            });
          }
        })
        .catch((e) => {
          console.log("error: ", e);
        });
    } else {
      res.status(403).send({
        message: "user not found",
      });
    }
  });
});

api.post("/logout", (req, res, next) => {
  res.cookie("jToken", "", {
    maxAge: 86_400_000,
    httpOnly: true,
  });
  res.send("logout success");
});

module.exports = api;
