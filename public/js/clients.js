const API = "https://pharmacysystem-production.up.railway.app";

window.addEventListener("pageshow", function (event) {
  loadClients();
});

if (localStorage.getItem("loggedIn") !== "true") {
  window.location.href = "index.html";
}

let allClients = [];

function loadClients() {
  const tableBody = document.getElementById("clientsTable");

  // رسالة تحميل احترافية مع Spinner وحجم كبير
  tableBody.innerHTML = 
`   <tr>
      <td
        colspan="9"
        style="height: 300px; text-align: center; vertical-align: middle;"
      >
        <div
          class="spinner-border text-primary"
          role="status"
          style="width: 3rem; height: 3rem;"
        >
          <span class="visually-hidden">Loading...</span>
        </div>
        <h3 class="mt-3 text-secondary">جاري جلب بيانات العملاء...</h3>
        <p class="text-muted">يرجى الانتظار قليلاً، يتم فحص السجلات</p>
      </td>
    </tr>`
  ;

  fetch(API + "/clients")
    .then((res) => res.json())

    .then((data) => {
      allClients = data;

      renderClients(data);
    })
    .catch((err) => {
      console.error(err);
      tableBody.innerHTML = `
        <tr>
          <td colspan="9" class="text-danger">
            حدث خطأ أثناء تحميل البيانات
          </td>
        </tr>
      `;
    });
}

function renderClients(clients) {
  let html = "";

  clients.forEach((c) => {
    html += `

<tr>

<td>${c.connection || ""}</td>

<td>${c.name}</td>

<td>
<a href="https://wa.me/2${c.phone}" target="_blank" class="text-decoration-none">${c.phone}</a>
</td>

<td>${c.bonus || 0}</td>

<td>${c.usedPoints || 0}</td>

<td>${c.lastInvoiceDate ? new Date(c.lastInvoiceDate).toLocaleDateString() : ""}</td>

<td>${c.needed || ""}</td>

<td>${c.interest || 0}</td>


<td> <button onclick="viewClient('${c._id}')">view</button> </td>

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

  const phone = prompt("Phone ");
  if (isNaN(phone)) {
    alert("القيمة يجب أن تكون رقم");
    return;
  }
  if (phone.length !== 11) {
    alert("الرقم به خطا");
    return;
  }
  const needed = "Not_Found";

  const connection = "WhatsApp";

  const interest = "Cosmetics";

  // البحث عن العميل الموجود بالفعل
  const existingClient = allClients.find(
    (c) => c.name.toLowerCase() === name.toLowerCase() || c.phone === phone,
  );

  if (existingClient) {
    alert(
      ` ${existingClient.name} and ${existingClient.phone} العميل الذى قمت باضافته موجود بالفعل `,
    );
    return; // يوقف تنفيذ الدالة
  }

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
      connection,
      usedPoints,
      bonus,
      needed,
      interest,
    }),
  }).then(() => loadClients());
}

// رؤية عميل
function viewClient(id) {
  window.location = `client-view.html?id=${encodeURIComponent(id)}`;
}

// البحث
function filterClients() {
  const type = document.getElementById("searchType").value;
  const input = document.getElementById("searchValue").value.toLowerCase();

  const filtered = allClients.filter((c) => {
    const name = (c.name || "").toLowerCase();
    const phone = c.phone || "";
    const needed = c.needed || "";
    const interests = (c.interest || "").toLowerCase();

    if (type === "name") {
      return name.includes(input);
    }

    if (type === "phone") {
      return phone.includes(input);
    }

    if (type === "needed") {
      return needed.includes(input);
    }

    if (type === "interests") {
      return interests.includes(input);
    }

    return true;
  });

  renderClients(filtered);
}
function filterPoints() {
  const minBonusValue = document.getElementById("minBonus").value;
  const maxBonusValue = document.getElementById("maxBonus").value;

  const minUsedValue = document.getElementById("minUsed").value;
  const maxUsedValue = document.getElementById("maxUsed").value;

  const minBonus = minBonusValue === "" ? null : Number(minBonusValue);
  const maxBonus = maxBonusValue === "" ? null : Number(maxBonusValue);

  const minUsed = minUsedValue === "" ? null : Number(minUsedValue);
  const maxUsed = maxUsedValue === "" ? null : Number(maxUsedValue);

  const filtered = allClients.filter((c) => {
    const bonus = Number(c.bonus || 0);
    const used = Number(c.usedPoints || 0);

    // فلترة البوينت المتاحة (اختياري)
    if (minBonus !== null && bonus < minBonus) return false;
    if (maxBonus !== null && bonus > maxBonus) return false;

    // فلترة البوينت المستخدمة (اختياري)
    if (minUsed !== null && used < minUsed) return false;
    if (maxUsed !== null && used > maxUsed) return false;

    return true;
  });

  renderClients(filtered);
}
function searchPoints(Type) {
  if (Type === "point") {
    document.querySelector(".search-point").classList.toggle("d-hidden");
  }
  if (Type === "date") {
    document.querySelector(".search-date").classList.toggle("d-hidden");
  }
}
function reset(Type) {
  if (Type === 'points') {
  document.getElementById("minBonus").value = "";
  document.getElementById("maxBonus").value = "";
  document.getElementById("minUsed").value = "";
  document.getElementById("maxUsed").value = "";
  }
  if (Type === 'date') {
    document.getElementById("fromDate").value = "";
    document.getElementById("toDate").value = "";
  }

  renderClients(allClients);
}

function filterClientsByDate() {
  const from = document.getElementById("fromDate").value;
  const to = document.getElementById("toDate").value;

  if (!from || !to) {
    alert("اختار التاريخ");
    return;
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  toDate.setHours(23, 59, 59, 999);

  const filtered = allClients.filter((c) => {
    if (!c.lastInvoiceDate) return false;

    const clientDate = c.lastInvoiceDate ? new Date(c.lastInvoiceDate) : null;

    if (!clientDate) return false;

    return clientDate >= fromDate && clientDate <= toDate;
  });

  renderClients(filtered);
}
