// const url = "http://localhost:5000";
const url = "https://login-signup-jwt.herokuapp.com";

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
      window.location.href = "chat.html";
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
      window.location.href = "welcome.html";
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
    url: url + "/userData",
  })
    .then((res) => {
      console.log(res.data.userData);
      welcomeUser.innerHTML = res.data.userData.name;
      currentUserId.innerHTML = res.data.userData.id;
      currentUserName.innerHTML = res.data.userData.name;
      currentUserEmail.innerHTML = res.data.userData.email;
    })
    .catch((err) => console.log("error=>", err));
};
