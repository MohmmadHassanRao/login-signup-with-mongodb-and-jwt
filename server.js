const express = require("express");
// const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const http = require("http");
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { SERVER_SECRET } = require("./core/");
const authRoutes = require("./routes/auth");
var { userModel, tweetModel } = require("./dbrepo/models");
const { resolveSoa } = require("dns");
var app = express();
const server = http.createServer(app);
console.log("tweets==>", tweetModel);
// console.log("userModel==>", userModel);
// console.log("server secret==>>", SERVER_SECRET);

app.use("/", express.static(path.resolve(path.join(__dirname, "public"))));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(morgan("dev"));

app.post("/tweets", (req, res) => {
  if (!req.body.tweet || !req.body.email) {
    res.status(403).send(`
              please send tweet in json body.
              e.g:
              {
                email:"hassan@gmail.com"
                  tweet:'Something'
              }`);
    return;
  }

  userModel.findOneAndUpdate(
    { email: req.body.email },
    { $push: { tweets: { tweet: req.body.tweet } } },
    function (err, data) {
      if (!err) {
        // userModel.tweets.push({ tweet: req.body.tweet });
        console.log(data);
        res.send(data);
      } else {
        res.status(500).send(JSON.stringify(err));
      }
    }
  );
});

// from routes
app.use("/auth", authRoutes);

// middleware
app.use(function (req, res, next) {
  console.log("req.cookies: ", req.cookies);
  if (!req.cookies.jToken) {
    res.status(401).send("include http-only credentials with every request");
    return;
  }
  jwt.verify(req.cookies.jToken, SERVER_SECRET, function (err, decodedData) {
    if (!err) {
      const issueDate = decodedData.iat * 1000; //it converts milliseconds to seconds
      const nowDate = new Date().getTime();
      const diff = nowDate - issueDate; // 86,400,00 milliseconds = 24 hrs

      // token will expire after 1 min
      if (diff > 3000000) {
        res.status(401).send("token expired");
      } else {
        // issue new token
        var token = jwt.sign(
          {
            id: decodedData.id,
            name: decodedData.name,
            email: decodedData.email,
          },
          SERVER_SECRET
        );
        res.cookie("jToken", token, {
          maxAge: 86_400_000,
          httpOnly: true,
        });
        req.body.jToken = decodedData;
        next();
      }
    } else {
      res.status(401).send("invalid token");
    }
  });
});

app.get("/userData", (req, res, next) => {
  console.log(req.body);

  userModel.findById(
    req.body.jToken.id,
    "name email tweets",
    function (err, data) {
      if (!err) {
        res.send({
          userData: {
            id: data._id,
            name: data.name,
            email: data.email,
            tweets: data.tweets,
          },
          // userData: data,
        });
      } else {
        res.status(500).send({
          message: "server error",
        });
      }
    }
  );
});
app.get("/allTweets", (req, res) => {
  userModel.find((err, data) => {
    if (!err) {
      console.log(data);
      res.send(data);
    } else {
      res.status(500).send("db erro");
    }
  });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("server is running on: ", PORT);
});
