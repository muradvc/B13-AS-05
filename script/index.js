document.getElementById("login-btn").addEventListener("click", function () {
  //  get name
  const userName = document.getElementById("username");
  const userValue = userName.value;
  
  // get pass
  const pass=document.getElementById("pass");
  const passValue=pass.value;
  
  // match
  if(userValue==='admin' && passValue==="admin123"){
    // true:logined
    alert("login success")
    window.location.assign("./home.html")
  }
  // false:alert & return
  else{
    alert("invalid username & password")
    return;
  }
  
})