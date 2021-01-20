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
var app = express();
const server = http.createServer(app);
console.log("tweets==>", tweetModel);
const socketIo = require("socket.io");
const io = socketIo(server);
const fs = require("fs");
const multer = require("multer");
const storage = multer.diskStorage({
  // https://www.npmjs.com/package/multer#diskstorage
  destination: "./uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      `${new Date().getTime()}-${file.filename}.${file.mimetype.split("/")[1]}`
    );
  },
});
var upload = multer({ storage: storage });

var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://calculator-2a862.firebaseio.com",
});

const bucket = admin.storage().bucket("gs://calculator-2a862.appspot.com");
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
    "name email profileUrl",
    function (err, data) {
      if (!err) {
        res.send({
          userData: data,
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

app.post("/postTweet", (req, res) => {
  console.log(req.body);
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

  // userModel.findOneAndUpdate(
  //   { email: req.body.email },
  //   { $push: { tweets: { tweet: req.body.tweet } } },
  //   function (err, data) {
  //     if (!err) {
  //       // userModel.tweets.push({ tweet: req.body.tweet });
  //       console.log(data);
  //       res.send(data);
  //     } else {
  //       res.status(500).send(JSON.stringify(err));
  //     }
  //   }
  // );
  userModel.findById(req.body.jToken.id, "name email", (err, user) => {
    if (!err) {
      console.log("tweet user", user);
      tweetModel
        .create({
          email: req.body.email,
          name: user.name,
          tweet: req.body.tweet,
        })
        .then((data) => {
          console.log("tweet posted", data);
          res.send({
            message: "tweet posted",
            name: user.name,
            email: user.email,
          });
          io.emit("NEW_TWEET", data);
        })
        .catch((err) => res.status(500).send("an error occurred" + err));
    } else {
      res.status(500).send("db error");
    }
  });
});
app.get("/userTweets", (req, res) => {
  console.log("my tweets user", req.body);
  tweetModel.find({ email: req.body.jToken.email }, (err, data) => {
    if (!err) {
      console.log("tweet Data==>", data);
      res.send({
        tweets: data,
      });
    } else {
      console.log("error: ", err);
      res.status(500).send({});
    }
  });
});
app.get("/getAllTweets", (req, res) => {
  console.log(req.body);
  tweetModel.find((err, data) => {
    if (!err) {
      console.log(data.tweet);
      res.send({
        tweets: data,
      });
    } else {
      res.status(500).send({
        message: "db error" + err,
      });
    }
  });
});
app.post("/upload", upload.any(), (req, res, next) => {
  console.log("req.body: ", JSON.parse(req.body.myDetails).email);
  // console.log("req.email: ", req.body.myDetails);
  console.log("req.files: ", req.files);

  console.log("uploaded file name: ", req.files[0].originalname);
  console.log("file type: ", req.files[0].mimetype);
  console.log("file name in server folders: ", req.files[0].filename);
  console.log("file path in server folders: ", req.files[0].path);

  bucket.upload(
    req.files[0].path,
    // {
    //     destination: `${new Date().getTime()}-new-image.png`, // give destination name if you want to give a certain name to file in bucket, include date to make name unique otherwise it will replace previous file with the same name
    // },
    function (err, file, apiResponse) {
      if (!err) {
        // console.log("api resp: ", apiResponse);

        // https://googleapis.dev/nodejs/storage/latest/Bucket.html#getSignedUrl
        file
          .getSignedUrl({
            action: "read",
            expires: "03-09-2491",
          })
          .then((urlData, err) => {
            if (!err) {
              console.log("public downloadable url: ", urlData[0]); // this is public downloadable url
              userModel.findOne(
                { email: JSON.parse(req.body.myDetails).email },
                (err, data) => {
                  if (!err) {
                    console.log("userFound", data);
                    data.update(
                      { profileUrl: urlData[0] },
                      {},
                      (err, updatedUrl) => {
                        if (!err) {
                          res.status(200).send({
                            message: "profile picture updated succesfully",
                            url: urlData[0],
                          });
                        } else {
                          res.status(500).send({
                            message: "an error occured",
                          });
                        }
                      }
                    );
                  } else {
                    console.log("user not found");
                  }
                }
              );

              // // delete file from folder before sending response back to client (optional but recommended)
              // // optional because it is gonna delete automatically sooner or later
              // // recommended because you may run out of space if you dont do so, and if your files are sensitive it is simply not safe in server folder
              // try {
              //     fs.unlinkSync(req.files[0].path)
              //     //file removed
              // } catch (err) {
              //     console.error(err)
              // }
              // res.send({
              //   message: "ok",
              //   url: urlData[0],
              // });
            }
          });
      } else {
        console.log("err: ", err);
        res.status(500).send();
      }
    }
  );
});

// app.post("/upload", (req, res, next) => {
//   console.log(req.body);

// userModel.findById(
//   req.body.jToken.id,
//   "name email profileUrl",
//   function (err, data) {
//     if (!err) {
//       console.log("data url", data);
//       res.send({
//         userData: data,
//         // userData: data,
//       });
//     } else {
//       res.status(500).send({
//         message: "server error",
//       });
//     }
//   }
// );
// });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("server is running on: ", PORT);
});
