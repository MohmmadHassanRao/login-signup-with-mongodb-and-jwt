// const express = require("express");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const morgan = require("morgan");
// const cors = require("cors");
// const http = require("http");
// const path = require("path");
// const bcrypt = require("bcrypt-inzi");
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");

// const SERVER_SECRET = process.env.SECRET || "abc";
// const PORT = process.env.PORT || 5000;
// const app = express();
// const server = http.createServer(app);

// app.use("/", express.static(path.join(__dirname, "public")));

// app.use(bodyParser.json());
// app.use(cookieParser());
// app.use(
//   cors({
//     origin: "*",
//     credentials: true,
//   })
// );
// app.use(morgan("dev"));

// let dbURI =
//   "mongodb+srv://hassan:hassan@cluster0.u0q5y.mongodb.net/firstdB?retryWrites=true&w=majority";

// //   for LocalHost
// // let dbURI = 'mongodb://localhost:27017/abc-database';

// mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

// ////////////////mongodb connected disconnected events///////////////////////////////////////////////
// mongoose.connection.on("connected", () => {
//   //connected
//   console.log("Mongoose is connected");
// });

// mongoose.connection.on("disconnected", function () {
//   //disconnected
//   console.log("Mongoose is disconnected");
//   process.exit(1);
// });

// mongoose.connection.on("error", (err) => {
//   //any error
//   console.log("Mongoose connection error: ", err);
//   process.exit(1);
// });

// //This function will run jst before app is closing
// process.on("SIGINT", () => {
//   console.log("app is terminating");
//   mongoose.connection.close(function () {
//     console.log("Mongoose default connection closed");
//     process.exit(0);
//   });
// });
// //mongodb connected disconnected events closes here//

// // app.post('/signup',(req,res)=>{

// // })

// let userSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   password: String,
//   createdOn: { type: Date, default: Date.now },
// });

// // it will create a file of all data in 3t
// let userModel = mongoose.model("users", userSchema);

// app.post("/signup", (req, res, next) => {
//   // for postman request
//   if (!req.body.userName || !req.body.userEmail || !req.body.userPassword) {
//     res.status(403).send(`
//             please send name, email, password, phone and gender in json body.
//             e.g:
//             {
//                 "name": "hassan",
//                 "email": "malikasinger@gmail.com",
//                 "password": "abc",

//             }`);
//     return;
//   }

// var newUser = new userModel({
//   name: req.body.userName,
//   email: req.body.userEmail,
//   password: req.body.userPassword,
// });
// find user in database if exist
//   userModel.findOne({ email: req.body.userEmail }, function (err, data) {
//     if (!data && !err) {
//       bcrypt.stringToHash(req.body.userPassword).then((hashedPassword) => {
//         var newUser = new userModel({
//           name: req.body.userName,
//           email: req.body.userEmail,
//           password: hashedPassword,
//         });
//       });
//       // save user to database
//       newUser.save((err, data) => {
//         // status default is 200. so we don't need to specify the status code
//         if (!err) {
//           res.send({
//             message: "account created successfully",
//           });
//         } else {
//           res.status(500).send({
//             message: "user create error" + err,
//           });
//         }
//       });
//     } else if (err) {
//       res.status(500).send({
//         message: "db error" + err,
//       });
//     } else {
//       res.status(409).send({
//         message: "user already exist",
//       });
//     }
//   });
// });

// app.post("/login", (req, res) => {
//   // for postman
//   if (!req.body.userEmail || !req.body.userPassword) {
//     res.send(`please send data in json body`);
//     return;
//   }
//   userModel.findOne({ email: req.body.userEmail }, function (err, data) {
//     if (err) {
//       res.status(500).send("error");
//     } else if (data) {
//       bcrypt
//         .varifyHash(req.body.userPassword, data.password)
//         .then((isMatched) => {
//           if (isMatched) {
//             console.log("password matched");

//             let token = jwt.sign(
//               {
//                 id: data._id,
//                 name: data.name,
//                 email: data.email,
//               },
//               SERVER_SECRET
//             );

//             res.cookie("jwtToken", token, {
//               maxAge: 86400000,
//               httpOnly: true,
//             });

//             res.send({
//               message: "login success",
//               user: {
//                 name: data.name,
//                 email: data.email,
//               },
//             });
//           } else {
//             console.log("incorrect password");
//             res.status(401).send({
//               message: "incorrect password",
//             });
//           }
//         })
//         .catch((err) => {
//           console.log("error" + err);
//         });
//     } else {
//       console.log("user not found");
//       res.status(403).send({
//         message: "user not found",
//       });
//     }
//   });
// });

// app.listen(PORT, () => {
//   console.log("server is running on: ", PORT);
// });

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const http = require("http");
const path = require("path");
const bcrypt = require("bcrypt-inzi");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const SERVER_SECRET = process.env.SECRET || "1234";

/////////////////////////////////////////////////////////////////////////////////////////////////
let dbURI =
  "mongodb+srv://hassan:hassan@cluster0.u0q5y.mongodb.net/firstdB?retryWrites=true&w=majority";
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

//https://mongoosejs.com/docs/connections.html#connection-events
////////////////mongodb connected disconnected events///////////////////////////////////////////////
mongoose.connection.on("connected", function () {
  //connected
  console.log("Mongoose is connected");
});

mongoose.connection.on("disconnected", function () {
  //disconnected
  console.log("Mongoose is disconnected");
  process.exit(1);
});

mongoose.connection.on("error", function (err) {
  //any error
  console.log("Mongoose connection error: ", err);
  process.exit(1);
});

process.on("SIGINT", function () {
  /////this function will run jst before app is closing
  console.log("app is terminating");
  mongoose.connection.close(function () {
    console.log("Mongoose default connection closed");
    process.exit(0);
  });
});
////////////////mongodb connected disconnected events///////////////////////////////////////////////

// https://mongoosejs.com/docs/schematypes.html#what-is-a-schematype
var userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  createdOn: { type: Date, default: Date.now },
});

// https://mongoosejs.com/docs/models.html
var userModel = mongoose.model("users", userSchema);

var app = express();
const server = http.createServer(app);

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

app.post("/signup", (req, res, next) => {
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
      res.status(402).send({
        message: "user already exist",
      });
    }
  });
});

app.post("/login", (req, res, next) => {
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

app.post("/logout", (req, res, next) => {
  res.cookie("jToken", "", {
    maxAge: 86_400_000,
    httpOnly: true,
  });
  res.send("logout success");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("server is running on: ", PORT);
});
