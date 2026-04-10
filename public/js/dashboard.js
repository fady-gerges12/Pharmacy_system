const API = "https://pharmacysystem-production.up.railway.app";

if (localStorage.getItem("loggedIn") !== "true") {
  window.location.href = "index.html";
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
