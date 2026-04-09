const urlParams = new URLSearchParams(window.location.search);
const clientId = urlParams.get("id");
const API = "http://localhost:3000";

if (localStorage.getItem("loggedIn") !== "true") {
  window.location.href = "index.html";
}

let allInvoices = [];
let editingInvoiceId = null;

loadClient();

async function loadClient() {
  const res = await fetch(`${API}/clients/${clientId}`);
  const data = await res.json();

  document.getElementById("clientName").value = data.client.name;
  document.getElementById("clientPhone").value = data.client.phone;
  document.getElementById("clientNeeded").value = data.client.needed;
  document.getElementById("clientConnection").value = data.client.connection;
  document.getElementById("clientInterest").value = data.client.interest;
  document.getElementById("usedPoints").value = data.client.usedPoints;

  allInvoices = data.invoices;
  renderInvoices(allInvoices);

  // حساب مجموع الفواتير
  const totalAmount = allInvoices.reduce(
    (sum, inv) => sum + Number(inv.amount || 0),
    0,
  );

  document.getElementById("totalAmount").value = totalAmount;

  const calcBonus = calculateBonus(totalAmount);
  const usedPoints = Number(document.getElementById("usedPoints").value || 0);

  document.getElementById("avilaPoints").value = calcBonus - usedPoints;
  document.getElementById("totalPoints").value = calcBonus;
}

/////////////////////////
// 🔥 تحديث البونص في السيرفر
/////////////////////////
async function updateBonusOnServer() {
  const bonus = Number(document.getElementById("avilaPoints").value || 0);
  const usedPoints = Number(document.getElementById("usedPoints").value || 0);

  await fetch(`${API}/clients/${clientId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bonus, usedPoints }),
  });
}

// تعديل بيانات العميل
async function updateClient() {
  const name = document.getElementById("clientName").value;
  const phone = document.getElementById("clientPhone").value;
  const needed = document.getElementById("clientNeeded").value || "Not_Found";
  const connection = document.getElementById("clientConnection").value;
  const interest = document.getElementById("clientInterest").value;
  const totalPoints = Number(document.getElementById("totalPoints").value || 0);
  const usedPoints = Number(document.getElementById("usedPoints").value || 0);
  const bonus = totalPoints - usedPoints;

  try {
    const res = await fetch(`${API}/clients/${clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        needed,
        connection,
        interest,
        bonus,
        usedPoints,
      }),
    });

    if (!res.ok) throw new Error("حدث خطأ أثناء التحديث");

    alert("تم تحديث البيانات بنجاح!");
    loadClient();
  } catch (error) {
    console.error(error);
    alert("فشل تحديث البيانات");
  }
}

// حذف العميل
async function deleteClient() {
  if (confirm("تاكيد حذف العميل؟")) {
    await fetch(`${API}/clients/${clientId}`, {
      method: "DELETE",
    });
    window.location.href = "clients.html";
  }
}

// عرض الفواتير
function renderInvoices(invoices) {
  let html = "";

  invoices.forEach((inv, index) => {
    html += `
    <tr>
      <td>${inv.invoiceNumber || index + 1}</td>
      <td>${inv.date ? new Date(inv.date).toLocaleDateString() : ""}</td>
      <td>${inv.amount}</td>
      <td>
        <button onclick="editInvoice('${inv._id}')">✏ تعديل</button>
        <button onclick="deleteInvoice('${inv._id}')">🗑 حذف</button>
      </td>
    </tr>
    `;
  });

  document.getElementById("invoiceTable").innerHTML = html;
}

// فتح الفورم
function showInvoiceForm(inv = {}) {
  document.getElementById("invoiceForm").style.display = "block";
  document.getElementById("invoiceNumber").value = inv.invoiceNumber || "";
  document.getElementById("invoiceAmount").value = inv.amount || "";
  document.getElementById("invoiceDate").value = inv.date
    ? new Date(inv.date).toISOString().split("T")[0]
    : "";

  editingInvoiceId = inv._id || null;
}

function hideInvoiceForm() {
  document.getElementById("invoiceForm").style.display = "none";
  editingInvoiceId = null;
}

// حفظ الفاتورة
async function saveInvoice() {
  const number = document.getElementById("invoiceNumber").value;
  const amount = document.getElementById("invoiceAmount").value;
  const date = document.getElementById("invoiceDate").value;

  if (!number || !amount || !date) {
    alert("من فضلك املا كل الحقول");
    return;
  }

  const numberNum = Number(number);
  const amountNum = Number(amount);

  if (isNaN(numberNum) || isNaN(amountNum)) {
    alert("القيم يجب أن تكون أرقام");
    return;
  }

  if (editingInvoiceId) {
    await fetch(`${API}/invoices/${editingInvoiceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoiceNumber: numberNum,
        amount: amountNum,
        date,
      }),
    });
  } else {
    await fetch(`${API}/invoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoiceNumber: numberNum,
        amount: amountNum,
        date,
        clientId: String(clientId),
      }),
    });
  }

  hideInvoiceForm();

  await loadClient(); // تحديث البيانات
  await updateBonusOnServer(); // تحديث البونص في السيرفر
}

// حذف فاتورة
async function deleteInvoice(id) {
  if (confirm("هل أنت متأكد من حذف الفاتورة؟")) {
    await fetch(`${API}/invoices/${id}`, { method: "DELETE" });

    await loadClient();
    await updateBonusOnServer();
  }
}

// تعديل فاتورة
function editInvoice(id) {
  const inv = allInvoices.find((i) => i._id === id);
  showInvoiceForm(inv);
}

// تنسيق التاريخ
function normalizeDateForInput(date) {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

// البحث
function filterInvoices() {
  const value = document
    .getElementById("searchInvoice")
    .value.toLowerCase()
    .trim();

  const filtered = allInvoices.filter((i) => {
    const dateISO = normalizeDateForInput(i.date);
    const dateLocal = i.date
      ? new Date(i.date).toLocaleDateString().toLowerCase()
      : "";

    return (
      dateISO.includes(value) ||
      dateLocal.includes(value) 
    );
  });

  renderInvoices(filtered);
}
