const express = require("express");
// const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const http = require("http");
const path = require("path");
// const bcrypt = require("bcrypt-inzi");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
// const SERVER_SECRET = process.env.SECRET || "1234";
const { SERVER_SECRET } = require("./core/");
const authRoutes = require("./routes/auth");
var { userModel } = require("./dbrepo/models");
var app = express();
const server = http.createServer(app);
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
      if (diff > 10000) {
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

  userModel.findById(req.body.jToken.id, "name email", function (err, data) {
    if (!err) {
      res.send({
        userData: {
          id: data._id,
          name: data.name,
          email: data.email,
        },
        // userData: data,
      });
    } else {
      res.status(500).send({
        message: "server error",
      });
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("server is running on: ", PORT);
});
