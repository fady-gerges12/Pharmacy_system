function calculateBonus(totalAmount) {
  // كل 1000 جنيه = 2% بونص
  const bonusPerThousand = 20; // 20% من 1000
  const thousands = Math.floor(totalAmount / 1000);
  return thousands * bonusPerThousand;
}

function logout() {
  if (confirm("هل تريد تسجيل الخروج؟")) {
    localStorage.setItem("loggedIn","false");
    window.location.href = "login.html";
  }
}