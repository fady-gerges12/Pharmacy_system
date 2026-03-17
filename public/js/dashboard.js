const API = "http://localhost:3000";

if (localStorage.getItem("loggedIn") !== "true"){
  window.location.href="logIn.html";
}

// تحميل عدد العملاء
async function loadClientCount() {
  try {
    const res = await fetch(API + "/clients");
    const clients = await res.json();

    // عرض عدد العملاء في الداشبورد
    document.getElementById("totalClients").innerText = clients.length;
  } catch (err) {
    console.error("حدث خطأ في جلب العملاء:", err);
  }
}

// تشغيل الفانكشن بعد تحميل الصفحة
document.addEventListener("DOMContentLoaded", loadClientCount);