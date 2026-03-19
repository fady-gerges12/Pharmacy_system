if (localStorage.getItem("loggedIn") !== "true") {
  window.location.href = "index.html";
}

function changePassword() {
  const oldPass = document.getElementById("oldPass").value.trim();
  const newPass = document.getElementById("newPass").value.trim();
  const confirmPass = document.getElementById("confirmPass").value.trim();

  const savedPassword = localStorage.getItem("password");

  if (!oldPass || !newPass || !confirmPass) {
    document.getElementById("msg").innerText = "من فضلك املأ كل الحقول";
    document.getElementById("msg").className =
      "text-danger text-center mt-3 fs-4";
    return;
  }

  if (oldPass !== savedPassword) {
    document.getElementById("msg").innerText = "كلمة المرور القديمة غير صحيحة";
    document.getElementById("msg").className =
      "text-danger text-center mt-3 fs-4";
    return;
  }

  if (newPass !== confirmPass) {
    document.getElementById("msg").innerText = "كلمتا المرور غير متطابقتين";
    document.getElementById("msg").className =
      "text-danger text-center mt-3 fs-4";
    return;
  }

  localStorage.setItem("password", newPass);
  alert("تم تغيير كلمة المرور بنجاح");
  window.location.href = "logIn.html";
}

function togglePasswordOld() {
  const pass = document.getElementById("oldPass");

  if (pass.type === "password") {
    pass.type = "text";
  } else {
    pass.type = "password";
  }
}
function togglePasswordNew() {
  const pass = document.getElementById("newPass");

  if (pass.type === "password") {
    pass.type = "text";
  } else {
    pass.type = "password";
  }
}
function togglePasswordConfirm() {
  const pass = document.getElementById("confirmPass");

  if (pass.type === "password") {
    pass.type = "text";
  } else {
    pass.type = "password";
  }
}