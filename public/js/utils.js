// حساب البونص 
function calculateBonus(totalAmount) {
  // كل 50 جنيه = 4% بونص
  const bonusPerThousand = 2; // 4% من 50
  const thousands = Math.floor(totalAmount / 50);
  return thousands * bonusPerThousand;
}

// فانكشن تسجيل الخروج
function logout() {
  if (confirm("هل تريد تسجيل الخروج؟")) {
    localStorage.setItem("loggedIn","false");
    window.location.href = "index.html";
  }
}
