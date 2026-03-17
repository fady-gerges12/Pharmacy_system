const API = "http://localhost:3000";

window.addEventListener("focus", function(){
loadClients();
});

if (localStorage.getItem("loggedIn") !== "true"){
  window.location.href="logIn.html";
}

let allClients = [];

//  توليد دكود العميل
function generateClientCode() {
  const random = Math.floor(1000 + Math.random() * 9000);

  return random.toString();

}

function loadClients() {
  fetch(API + "/clients")
    .then((res) => res.json())

    .then((data) => {
      allClients = data;

      renderClients(data);
    });
}

loadClients();

function renderClients(clients) {
  let html = "";

  clients.forEach((c) => {
    html += `

<tr>

<td>${c.code || ""}</td>

<td>${c.type || ""}</td>

<td>${c.name}</td>

<td>
<a href="https://wa.me/20${c.phone}" target="_blank" class="text-decoration-none">${c.phone}</a>
</td>

<td>${c.bonus || 0}</td>

<td>${c.usedPoints || 0}</td>

<td>${c.interest || 0}</td>

<td>

<button onclick="viewClient('${c._id}')">👁</button>

<button onclick="deleteClient('${c._id}')">🗑</button>

</td>

</tr>

`;
  });

  document.getElementById("clientsTable").innerHTML = html;
}


// إضافة عميل
function addClient() {
  const name = prompt("Client Name");
  if (!isNaN(name)) {
  alert("القيمة يجب أن تكون احرف");
  return;
}

  const phone = prompt("Phone");
  if (isNaN(phone)) {
  alert("القيمة يجب أن تكون رقم");
  return;
}
  if (phone.length !== 10) {
  alert("الرقم به خطا");
  return;
}
let type = prompt("Client Type");
if (!type){
  type = "Pharmacy C";

}
  const interest = "temp";

    // البحث عن العميل الموجود بالفعل
  const existingClient = allClients.find(
    (c) => c.name.toLowerCase() === name.toLowerCase() || c.phone === phone
  );

  if (existingClient) {
    alert(` ${existingClient.name} العميل الذى قمت باضافته موجود بالفعل باسم `);
    return; // يوقف تنفيذ الدالة
  }

  const code = generateClientCode();
  const bonus = 0;
  const usedPoints = 0;

  fetch(API + "/clients", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      name,
      phone,
      code,
      type,
      usedPoints,
      bonus,
      interest,
    }),
  }).then(() => loadClients());
}

// حذف عميل
function deleteClient(id) {
  fetch(API + "/clients/" + id, {
    method: "DELETE",
  }).then(() => loadClients());
}

// رؤية عميل
function viewClient(id) {
  window.location = "client-view.html?id=" + id;
}

// البحث
function filterClients() {

  const value = document.getElementById("search").value.toLowerCase();

  const filtered = allClients.filter((c) => {

    const name = (c.name || "").toLowerCase();
    const phone = (c.phone || "");
    const code = (c.code || "").toLowerCase();
    const inter = (c.interest || "").toLowerCase();
    const type = (c.type || "").toLowerCase();

    return (
      name.includes(value) ||
      phone.includes(value) ||
      code.includes(value) ||
      inter.includes(value) ||
      type.includes(value)
    );

  });

  renderClients(filtered);
}