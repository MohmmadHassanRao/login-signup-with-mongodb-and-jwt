const url = "http://localhost:5000";
// const url = "https://login-signup-jwt.herokuapp.com";
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
      if (res.data.status === 403) {
        alert(res.data.message);
      } else {
        console.log(res.data.message);
        alert(res.data.message);
        window.location.href = "login.html";
      }
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
      if (res.data.status === 401) {
        alert(res.data.message);
      } else if (res.data.status === 403) {
        alert(res.data.message);
      } else {
        console.log(res.data.message);
        alert(res.data.message);
        window.location.href = "./dashboard/tweets.html";
      }
    })
    .catch((err) => {
      console.log("error=>", err);
    });

  return false;
};

const getData = () => {
  let welcomeUser = document.getElementById("welcomeUser");
  let currentUserId = document.getElementById("currentUserId");
  // let currentUserName = document.getElementById("currentUserName");
  // let currentUserEmail = document.getElementById("currentUserEmail");

  axios({
    method: "get",
    url: `${url}/userData`,
  })
    .then((res) => {
      console.log(res);
      // console.log("current user data", res);
      welcomeUser.innerHTML = res.data.userData.name;
      // console.log("profile url is==>", res.data.userData);
      // currentUserId.innerHTML = res.data.userData._id;
      // currentUserName.innerHTML = res.data.userData.name;
      currentUserEmail.innerHTML = res.data.userData.email;
      if (!res.data.userData.profileUrl) {
        document.getElementById("userImg").src = "./user.png";
      } else if (res.data.userData.profileUrl) {
        document.getElementById("userImg").src = res.data.userData.profileUrl;
        // document.getElementById("tweetImage").src = res.data.userData.profileUrl;
      }
      sessionStorage.setItem("userEmail", res.data.userData.email);
      getAllTweets();
      document.getElementById("home").style.color = "#52a2f3";
    })

    .catch((err) => (window.location.href = "../login.html"));
  // .catch((err) => err);
};

const postTweet = () => {
  // get user email with session storage
  var email = sessionStorage.getItem("userEmail");
  var userTweet = document.getElementById("tweet").value;
  var userPostImg = document.getElementById("postImg");
  console.log("user tweet image", userPostImg.files[0]);

  if (!userPostImg.value) {
    axios({
      method: "post",
      url: url + "/postTweet",
      data: {
        email: email,
        tweet: userTweet,
      },
    })
      .then((res) => {
        console.log(res.data.postUrl);
        console.log(res.data.profileUrl);
      })
      .catch((err) => console.log(err));
  } else if (userPostImg.value) {
    let formData = new FormData();
    formData.append("email", email);
    formData.append("tweet", userTweet);
    formData.append("myFile", userPostImg.files[0]);

    axios({
      method: "post",
      url: url + "/postTweetWithPic",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data;",
      },
    })
      .then((res) => {
        console.log(res.data.postUrl);
        console.log(res.data.profileUrl);
      })
      .catch((err) => console.log(err));
  }

  // console.log(formData);

  // axios({
  //   method: "post",
  //   url: url + "/postTweet",
  //   data: formData,
  //   headers: {
  //     "Content-Type": "multipart/form-data;",
  //   },
  // })
  //   .then((res) => {
  //     console.log(res.data.postUrl);
  //     console.log(res.data.profileUrl);
  //   })
  //   .catch((err) => console.log(err));
  document.getElementById("tweet").value = "";
  document.getElementById("postImg").value = "";
  return false;
};

socket.on("NEW_TWEET", (newTweet) => {
  console.log(newTweet.postUrl);
  if (!newTweet.profileUrl && !newTweet.postUrl) {
    let eachTweet = document.createElement("div");
    eachTweet.setAttribute("class", "myClass");
    eachTweet.innerHTML = `<div class="onTweet"><img src="./user.png"  class="tweetImg" alt="use profile"/><h3 class="tweetCard">  ${newTweet.name}<span class="tweetEmail">${newTweet.email}</span><br /><span class="tweet">${newTweet.tweet}</span></h3></div><br />`;
    // document.getElementById("userTweets").appendChild(eachTweet);
    document.getElementById("allTweets").appendChild(eachTweet);
  } else if (newTweet.profileUrl && !newTweet.postUrl) {
    let eachTweet = document.createElement("div");
    eachTweet.setAttribute("class", "myClass");
    eachTweet.innerHTML = `<div class="onTweet"><img src="${newTweet.profileUrl}"  class="tweetImg" alt="use profile"/><h3 class="tweetCard">  ${newTweet.name}<span class="tweetEmail">${newTweet.email}</span><br /><span class="tweet">${newTweet.tweet}</span></h3></div>`;
    // document.getElementById("userTweets").appendChild(eachTweet);
    document.getElementById("allTweets").appendChild(eachTweet);
  } else if (!newTweet.profileUrl && newTweet.postUrl) {
    let eachTweet = document.createElement("div");
    eachTweet.setAttribute("class", "myClass");
    eachTweet.innerHTML = `<div class="onTweet"><img src="./user.png"  class="tweetImg" alt="use profile"/><h3 class="tweetCard">  ${newTweet.name}<span class="tweetEmail">${newTweet.email}</span><br /><span class="tweet">${newTweet.tweet}</span></h3><br/><img  src="${newTweet.postUrl}" class='postUrl' width="200px"/> </div>`;
    // document.getElementById("userTweets").appendChild(eachTweet);
    document.getElementById("allTweets").appendChild(eachTweet);
  } else if (newTweet.profileUrl && newTweet.postUrl) {
    let eachTweet = document.createElement("div");
    eachTweet.setAttribute("class", "myClass");
    eachTweet.innerHTML = `<div class="onTweet"><img src="${newTweet.profileUrl}"  class="tweetImg" alt="use profile"/><h3 class="tweetCard">  ${newTweet.name}<span class="tweetEmail">${newTweet.email}</span><br /><span class="tweet">${newTweet.tweet}</span></h3><br/><img  src="${newTweet.postUrl}" class='postUrl' /> </div>`;
    // document.getElementById("userTweets").appendChild(eachTweet);
    document.getElementById("allTweets").appendChild(eachTweet);
  } else {
    console.log("error");
  }
});

socket.on("NEW_TWEET", (newTweet) => {
  // console.log(newTweet);
  if (!newTweet.profileUrl && !newTweet.postUrl) {
    let eachTweet = document.createElement("div");
    eachTweet.setAttribute("class", "myClass");
    eachTweet.innerHTML = `<div class="onTweet"><img src="./user.png"  class="tweetImg" alt="use profile"/><h3 class="tweetCard">  ${newTweet.name}<br /><span class="tweet">${newTweet.tweet}</span></h3></div>`;
    // document.getElementById("userTweets").appendChild(eachTweet);
    document.getElementById("userTweets").appendChild(eachTweet);
  } else if (newTweet.profileUrl && !newTweet.postUrl) {
    let eachTweet = document.createElement("div");
    eachTweet.setAttribute("class", "myClass");
    eachTweet.innerHTML = `<div class="onTweet"><img src="${newTweet.profileUrl}"  class="tweetImg" alt="use profile"/><h3 class="tweetCard">  ${newTweet.name}<br /><span class="tweet">${newTweet.tweet}</span></h3></div>`;
    // document.getElementById("userTweets").appendChild(eachTweet);
    document.getElementById("userTweets").appendChild(eachTweet);
  } else if (newTweet.profileUrl && !newTweet.postUrl) {
    let eachTweet = document.createElement("div");
    eachTweet.setAttribute("class", "myClass");
    eachTweet.innerHTML = `<div class="onTweet"><img src="${newTweet.profileUrl}"  class="tweetImg" alt="use profile"/><h3 class="tweetCard">  ${newTweet.name}<br /><span class="tweet">${newTweet.tweet}</span></h3></div>`;
    // document.getElementById("userTweets").appendChild(eachTweet);
    document.getElementById("userTweets").appendChild(eachTweet);
  }
  // document.getElementById("allTweets").appendChild(eachTweet);
});

const userTweets = () => {
  document.getElementById("userTweets").innerHTML = "";
  var toggle = document.getElementById("allTweets");
  toggle.style.display = "none";
  document.getElementById("userTweets").style.display = "block";
  document.getElementById("home").style.color = "white";
  document.getElementById("prof").style.color = " #52a2f3";
  axios({
    method: "get",
    url: url + "/userTweets",
  })
    .then((res) => {
      console.log("all tweets ==>", res.data.tweets);
      let userTweet = res.data.tweets;
      for (let i = 0; i < userTweet.length; i++) {
        if (!userTweet[i].profileUrl) {
          let eachCurrentUserTweet = document.createElement("div");
          eachCurrentUserTweet.setAttribute("class", "myClass");

          eachCurrentUserTweet.innerHTML = `<div class="onTweet"><img src="./user.png"  class="tweetImg" alt="use profile"/><h3 class="tweetCard">  ${userTweet[i].name}<br /><span class="tweet">${userTweet[i].tweet}</span></h3></div>`;
          document
            .getElementById("userTweets")
            .appendChild(eachCurrentUserTweet);
        } else {
          let eachCurrentUserTweet = document.createElement("div");
          eachCurrentUserTweet.setAttribute("class", "myClass");

          eachCurrentUserTweet.innerHTML = `<div class="onTweet"><img src="${userTweet[i].profileUrl}"  class="tweetImg" alt="use profile"/><h3 class="tweetCard">  ${userTweet[i].name}<br /><span class="tweet">${userTweet[i].tweet}</span></h3></div>`;
          document
            .getElementById("userTweets")
            .appendChild(eachCurrentUserTweet);
        }
      }
    })
    .catch((err) => console.log("error==>", err));
};

const getAllTweets = () => {
  document.getElementById("allTweets").innerHTML = "";
  let toggle = document.getElementById("userTweets");
  toggle.style.display = "none";
  document.getElementById("prof").style.color = "white";
  document.getElementById("home").style.color = " #52a2f3";

  document.getElementById("allTweets").style.display = "block";
  // toggle.style.display = toggle.style.display != "none" ? "none" : "block";

  axios({
    method: "get",
    url: url + "/getAllTweets",
  })
    .then((res) => {
      // console.log(res.data.tweets);
      console.log(res);
      let allTweets = res.data.tweets;
      for (let i = 0; i < allTweets.length; i++) {
        if (!allTweets[i].profileUrl && !allTweets[i].postUrl) {
          let eachTweet = document.createElement("div");
          eachTweet.setAttribute("class", "myClass");
          eachTweet.innerHTML = `<div class="onTweet"><img src="./user.png"  class="tweetImg" alt="use profile"/><h3 class="tweetCard">  ${allTweets[i].name}<span class="tweetEmail">${allTweets[i].email}</span><br /><span class="tweet">${allTweets[i].tweet}</span></h3></div><br />`;
          // document.getElementById("userTweets").appendChild(eachTweet);
          document.getElementById("allTweets").appendChild(eachTweet);
        } else if (allTweets[i].profileUrl && !allTweets[i].postUrl) {
          let eachTweet = document.createElement("div");
          eachTweet.setAttribute("class", "myClass");
          eachTweet.innerHTML = `<div class="onTweet"><img src="${allTweets[i].profileUrl}"  class="tweetImg" alt="use profile"/><h3 class="tweetCard">  ${allTweets[i].name}<span class="tweetEmail">${allTweets[i].email}</span><br /><span class="tweet">${allTweets[i].tweet}</span></h3><br/></div>`;
          // document.getElementById("userTweets").appendChild(eachTweet);
          document.getElementById("allTweets").appendChild(eachTweet);
        } else if (!allTweets[i].profileUrl && allTweets[i].postUrl) {
          let eachTweet = document.createElement("div");
          eachTweet.setAttribute("class", "myClass");
          eachTweet.innerHTML = `<div class="onTweet"><img src="./user.png"  class="tweetImg" alt="use profile"/><h3 class="tweetCard">  ${allTweets[i].name}<span class="tweetEmail">${allTweets[i].email}</span><br /><span class="tweet">${allTweets[i].tweet}</span></h3><br/><img  src="${allTweets[i].postUrl}" class='postUrl' width="200px"/> </div>`;
          // document.getElementById("userTweets").appendChild(eachTweet);
          document.getElementById("allTweets").appendChild(eachTweet);
        } else if (allTweets[i].profileUrl && allTweets[i].postUrl) {
          let eachTweet = document.createElement("div");
          eachTweet.setAttribute("class", "myClass");
          eachTweet.innerHTML = `<div class="onTweet"><img src="${allTweets[i].profileUrl}"  class="tweetImg" alt="use profile"/><h3 class="tweetCard">  ${allTweets[i].name}<span class="tweetEmail">${allTweets[i].email}</span><br /><span class="tweet">${allTweets[i].tweet}</span></h3><br/><img  src="${allTweets[i].postUrl}" class='postUrl' /> </div>`;
          // document.getElementById("userTweets").appendChild(eachTweet);
          document.getElementById("allTweets").appendChild(eachTweet);
        }
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

const upload = () => {
  let fileInp = document.getElementById("fileInp");
  console.log("fileInp", fileInp);
  console.log("fileInp", fileInp.files[0]);

  let formData = new FormData();

  formData.append("myFile", fileInp.files[0]);
  formData.append("myName", "Hassan");
  formData.append(
    "myDetails",
    JSON.stringify({
      email: sessionStorage.getItem("userEmail"),
      class: "web",
    })
  );
  axios({
    method: "post",
    url: url + "/upload",
    // url: "https://login-signup-jwt.herokuapp.com/upload",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  })
    .then((res) => {
      console.log("upload success", res.data);
      console.log("message", res.data.message);
      console.log("photo url", res.data.url);
      document.getElementById("userImg").src = res.data.url;

      document.getElementById("dimg").src = res.data.url;
    })
    .catch((err) => console.log(err));

  return false;
};
// const showProfile = () => {
//   document.getElementById("userImg").src = "./shield.png";
//   document.getElementById("uploadBtn").style.display = "block";
// };

const logout = () => {
  axios({
    method: "post",
    url: url + "/auth/logout",
  })
    .then((res) => {
      alert(res.data);
      sessionStorage.removeItem("userEmail");
      window.location.href = "../login.html";
    })
    .catch((err) => {
      console.log(err);
    });
};
