// const url = "http://localhost:5000";
const url = "https://login-signup-jwt.herokuapp.com";
const socket = io(url);

const signup = () => {
  let userName = document.getElementById("name").value;
  let userEmail = document.getElementById("email").value;
  let userPassword = document.getElementById("password").value;
  // console.log(userEmail, userName, userPassword);
  axios({
    method: "post",
    url: url + "/auth/signup",
    data: {
      userName: userName,
      userEmail: userEmail,
      userPassword: userPassword,
    },
  })
    .then((res) => {
      console.log(res.data.message);
      alert(res.data.message);
      window.location.href = "login.html";
    })
    .catch((err) => {
      console.log(err);
    });

  return false;
};

const login = () => {
  let currentEmail = document.getElementById("currentEmail").value;
  let currentPassword = document.getElementById("currentPassword").value;
  console.log(currentEmail, currentPassword);

  axios({
    method: "post",
    url: url + "/auth/login",
    data: {
      currentEmail: currentEmail,
      currentPassword: currentPassword,
    },
  })
    .then((res) => {
      console.log(res.data.message);
      alert(res.data.message);
      window.location.href = "./dashboard/tweets.html";
    })
    .catch((err) => {
      console.log("error=>", err);
    });

  return false;
};

const getData = () => {
  let welcomeUser = document.getElementById("welcomeUser");
  let currentUserId = document.getElementById("currentUserId");
  let currentUserName = document.getElementById("currentUserName");
  let currentUserEmail = document.getElementById("currentUserEmail");

  axios({
    method: "get",
    url: `${url}/userData`,
  })
    .then((res) => {
      // console.log("current user data", res);
      welcomeUser.innerHTML = res.data.userData.name;
      currentUserId.innerHTML = res.data.userData.id;
      currentUserName.innerHTML = res.data.userData.name;
      currentUserEmail.innerHTML = res.data.userData.email;
      let tweets = res.data.userData.tweets;
      sessionStorage.setItem("userEmail", res.data.userData.email);
      if (tweets === false) {
        console.log("no tweets");
        let noTweet = document.createElement("div");
        noTweet.innerHTML = `<h2>you have not posted any tweet yet</h2>`;
        document.getElementById("userTweets").appendChild(noTweet);
      } else {
        // console.log("tweets");
        for (let i = 0; i < tweets.length; i++) {
          // console.log(res.data.userData.tweets[i]);
          let eachTweet = document.createElement("div");
          eachTweet.innerHTML = `<h3>${res.data.userData.name}<br /><span class="tweet">${tweets[i].tweet}</span></h3>`;
          document.getElementById("userTweets").appendChild(eachTweet);
          // console.log(tweets[i]);
          // let userName = document.createElement(p);
        }
      }
    })
    .catch((err) => console.log("error=>", err));
};

// const getAllTweets = () => {
//   axios({
//     method: "get",
//     url: url + "/allTweets",
//   })
//     .then((res) => {
//       console.log("all tweets ==>", res.data);
//       // let allUserTweets = res.data;
//       // console.log("all users=>", allUserTweets);
//       // for (let i = 0; i < allUserTweets.length; i++) {
//       //   // console.log(allUserTweets[i].tweets);

//       //   for (let j = 0; j < allUserTweets[i].tweets.length; j++) {
//       //     let allTweets = document.createElement("div");
//       //     allTweets.innerHTML = `<h3>${allUserTweets[i].name}<br /><span class="tweet">${allUserTweets[i].tweets[j].tweet}</span></h3>`;
//       //     document.getElementById("allTweets").appendChild(allTweets);
//       //     // console.log(allUserTweets[i].tweets[j]);
//       //   }
//       // }
//     })
//     .catch((err) => console.log("error==>", err));
// };

const postTweet = () => {
  // get user email with session storage
  var email = sessionStorage.getItem("userEmail");
  var userTweet = document.getElementById("tweet").value;
  console.log(userTweet);
  axios({
    method: "post",
    url: url + "/postTweet",
    data: {
      email: email,
      tweet: userTweet,
    },
  })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => console.log(err));
  document.getElementById("tweet").value = "";
  return false;
};

socket.on("NEW_TWEET", (newTweet) => {
  let allTweets = document.createElement("div");
  allTweets.innerHTML = `<h3>${newTweet.name}<br /><span class="tweet">${newTweet.tweet}</span></h3>`;
  document.getElementById("allTweets").appendChild(allTweets);
  console.log(newTweet.tweet);
});

const forgotPassword = () => {
  let email = document.getElementById("forgetPassword").value;

  axios({
    method: "post",
    url: url + "/auth/forget-password",
    data: {
      email: email,
    },
  })
    .then((res) => {
      console.log(res);
      alert(res.data);
      window.location.href = "resetPassword.html";
    })
    .catch((err) => {
      console.log("error=>", err);
    });
  return false;
};

const resetPassword = () => {
  let otpEmail = document.getElementById("otpEmail").value;
  let otpCode = document.getElementById("otpCode").value;
  let newPassword = document.getElementById("newPassword").value;
  // console.log(otpEmail, otpCode, newPassword);

  axios({
    method: "post",
    url: url + "/auth/forget-password-step-2",
    data: {
      email: otpEmail,
      otp: otpCode,
      newPassword: newPassword,
    },
  })
    .then((res) => {
      console.log(res);
      alert(res.data);
      window.location.href = "./login.html";
    })
    .catch((err) => {
      console.log(err);
    });

  return false;
};
