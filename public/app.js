// const url = "http://localhost:5000";
const url = "https://login-signup-jwt.herokuapp.com";
var socket = io(url);
socket.on("connect", () => {
  console.log("connected");
});

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
  // console.log(currentEmail, currentPassword);

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
  // let currentUserId = document.getElementById("currentUserId");
  // let currentUserName = document.getElementById("currentUserName");
  // let currentUserEmail = document.getElementById("currentUserEmail");

  axios({
    method: "get",
    url: `${url}/userData`,
  })
    .then((res) => {
      // console.log("current user data", res);
      welcomeUser.innerHTML = res.data.userData.name;
      // currentUserId.innerHTML = res.data.userData._id;
      console.log("profile url is==>", res.data.userData);
      // currentUserName.innerHTML = res.data.userData.name;
      // currentUserEmail.innerHTML = res.data.userData.email;
      if (!res.data.userData.profileUrl) {
        document.getElementById("img").innerHTML = "upload profile picture";
      } else if (res.data.userData.profileUrl) {
        document.getElementById(
          "img"
        ).innerHTML = `<img width="150px" src="${res.data.userData.profileUrl}" />`;
      }
      sessionStorage.setItem("userEmail", res.data.userData.email);
      getAllTweets();
    })

    // .catch((err) => (location.href = "../login.html"));
    .catch((err) => err);
};

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
  console.log(newTweet);
  let eachTweet = document.createElement("div");
  eachTweet.setAttribute("class", "myClass");
  eachTweet.innerHTML = `<h3>${newTweet.name}<br /><span class="tweet">${newTweet.tweet}</span></h3>`;
  // document.getElementById("userTweets").appendChild(eachTweet);
  document.getElementById("allTweets").appendChild(eachTweet);
});

socket.on("NEW_TWEET", (newTweet) => {
  console.log(newTweet);
  let eachTweet = document.createElement("div");
  eachTweet.setAttribute("class", "myClass");
  eachTweet.innerHTML = `<h3>${newTweet.name}<br /><span class="tweet">${newTweet.tweet}</span></h3>`;
  document.getElementById("userTweets").appendChild(eachTweet);
  // document.getElementById("allTweets").appendChild(eachTweet);
});

const userTweets = () => {
  document.getElementById("userTweets").innerHTML = "";
  var toggle = document.getElementById("allTweets");
  toggle.style.display = "none";
  document.getElementById("userTweets").style.display = "block";
  axios({
    method: "get",
    url: url + "/userTweets",
  })
    .then((res) => {
      // console.log("all tweets ==>", res.data.tweets);
      let userTweet = res.data.tweets;
      for (let i = 0; i < userTweet.length; i++) {
        let eachCurrentUserTweet = document.createElement("div");
        eachCurrentUserTweet.setAttribute("class", "myClass");

        eachCurrentUserTweet.innerHTML = `<h3>${userTweet[i].name}<br /><span class="tweet">${userTweet[i].tweet}</span></h3>`;
        document.getElementById("userTweets").appendChild(eachCurrentUserTweet);
      }
    })
    .catch((err) => console.log("error==>", err));
};

const getAllTweets = () => {
  document.getElementById("allTweets").innerHTML = "";
  let toggle = document.getElementById("userTweets");
  toggle.style.display = "none";

  document.getElementById("allTweets").style.display = "block";
  // toggle.style.display = toggle.style.display != "none" ? "none" : "block";

  axios({
    method: "get",
    url: url + "/getAllTweets",
  })
    .then((res) => {
      // console.log(res.data.tweets);
      let allTweets = res.data.tweets;
      for (let i = 0; i < allTweets.length; i++) {
        let allUsersTweets = document.createElement("div");
        allUsersTweets.setAttribute("class", "myClass");

        allUsersTweets.innerHTML = `<h3>${allTweets[i].name}<br /><span class="tweet">${allTweets[i].tweet}</span></h3>`;
        document.getElementById("allTweets").appendChild(allUsersTweets);
      }
    })
    .catch((err) => console.log("error==>", err));
};

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
