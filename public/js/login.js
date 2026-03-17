// إنشاء باسورد افتراضي أول مرة
if (!localStorage.getItem("password")) {
  localStorage.setItem("password", "1234");
}

const USERNAME = "admin";

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const savedPassword = localStorage.getItem("password");

  if (!username || !password) {
    document.getElementById("error").innerText = "من فضلك ادخل البيانات";
    return;
  }

  if (username === USERNAME && password === savedPassword) {
    localStorage.setItem("loggedIn", "true");

    window.location.href = "index.html";
  } else {
    document.getElementById("error").innerText ="اسم المستخدم او كلمة المرور غير صحيحة";
  }
}

function togglePassword() {
  const pass = document.getElementById("password");

  if (pass.type === "password") {
    pass.type = "text";
  } else {
    pass.type = "password";
  }
}
