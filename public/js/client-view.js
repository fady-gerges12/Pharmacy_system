const urlParams = new URLSearchParams(window.location.search);
const clientId = urlParams.get("id");
const API = "http://localhost:3000";

if (localStorage.getItem("loggedIn") !== "true"){
  window.location.href="logIn.html";
}

let allInvoices = [];
let editingInvoiceId = null;

loadClient();

async function loadClient() {
  const res = await fetch(`${API}/clients/${clientId}`);
  const data = await res.json();

  console.log(data.client);

  document.getElementById("clientName").value = data.client.name;
  document.getElementById("clientPhone").value = data.client.phone;
  document.getElementById("clientType").value = data.client.type;
  document.getElementById("clientInterest").value = data.client.interest;
  document.getElementById("usedPoints").value = data.client.usedPoints;

  allInvoices = data.invoices;
  renderInvoices(allInvoices);

  // حساب مجموع الفواتير
  const totalAmount = allInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);

  document.getElementById("totalAmount").value = totalAmount;

  
  const calcBonus = calculateBonus(totalAmount);
  // حساب البونص
  const usedPoints = document.getElementById("usedPoints").value;
  
  document.getElementById("clientBonus").value = calcBonus - usedPoints;
  const bonus = document.getElementById("clientBonus").value;
  document.getElementById("totalPoints").value = calcBonus;

  // تحديث البونص في قاعدة البيانات
  await fetch(`${API}/clients/${clientId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bonus , usedPoints }),
  });


}

// تعديل بيانات العميل (الاسم والهاتف)
async function updateClient() {
  const name = document.getElementById("clientName").value;
  const phone = document.getElementById("clientPhone").value;
  const interest = document.getElementById("clientInterest").value;
  const bonus = document.getElementById("clientBonus").value;
  const usedPoints = document.getElementById("usedPoints").value;

  try {
    const res = await fetch(`${API}/clients/${clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, interest, bonus, usedPoints })
    });

    if (!res.ok) throw new Error("حدث خطأ أثناء تحديث بيانات العميل");

    alert("تم تحديث البيانات بنجاح!");
    loadClient(); // إعادة تحميل البيانات بعد التعديل
  } catch (error) {
    console.error(error);
    alert("فشل تحديث البيانات. تحقق من الاتصال بالسيرفر.");
  }
}

function renderInvoices(invoices) {
  let html = "";
  invoices.forEach((inv, index) => {
    html += `
    <tr>
      <td>${inv.invoiceNumber || index + 1}</td>
      <td>${inv.date}</td>
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

// إضافة / تعديل فاتورة
function showInvoiceForm(inv = {}) {
  document.getElementById("invoiceForm").style.display = "block";
  document.getElementById("invoiceNumber").value = inv.invoiceNumber || "";
  document.getElementById("invoiceAmount").value = inv.amount || "";
  document.getElementById("invoiceDate").value = inv.date || "";
  editingInvoiceId = inv._id || null;
}

function hideInvoiceForm() {
  document.getElementById("invoiceForm").style.display = "none";
  editingInvoiceId = null;
}

async function saveInvoice() {
  const number = document.getElementById("invoiceNumber").value;
  const amount = document.getElementById("invoiceAmount").value;
  const date = document.getElementById("invoiceDate").value;

  if (!number || !amount || !date){
    alert("من فضلك املا كل الحقول قبل حفظ الفاتورة");
    return;
  }
  if (isNaN(amount)) {
  alert("القيمة يجب أن تكون رقم");
  return;
}
  if (isNaN(number)) {
  alert("القيمة يجب أن تكون رقم");
  return;
}
    if (editingInvoiceId) {
    // تعديل
    await fetch(`${API}/invoices/${editingInvoiceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceNumber: number, amount, date }),
    });
  }
  else {
    // إضافة
    await fetch(`${API}/invoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceNumber: number, amount, date, clientId }),
      
    });
  }

  hideInvoiceForm();
  loadClient();
}

// حذف فاتورة
async function deleteInvoice(id) {
  if (confirm("هل أنت متأكد من حذف الفاتورة؟")) {
    await fetch(`${API}/invoices/${id}`, { method: "DELETE" });
    loadClient();
  }
}

// تعديل فاتورة
function editInvoice(id) {
  const inv = allInvoices.find((i) => i._id === id);
  showInvoiceForm(inv);
}

// فلترة الفواتير حسب التاريخ
function filterInvoices() {
  const date = document.getElementById("searchInvoice").value;
  const number = document.getElementById("searchInvoice").value;
  const filtered = allInvoices.filter((i) => i.date === date || i.number === number );
  renderInvoices(filtered);
}
