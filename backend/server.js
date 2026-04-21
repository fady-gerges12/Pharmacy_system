const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("❌ MONGO_URI is not defined in environment variables");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

// دالة مركزية للاتصال بقاعدة البيانات لضمان عدم حدوث undefined
async function getDb() {
  if (!db) {
    await client.connect();
    db = client.db("Pharmacy_DB");
    console.log("✅ Connected to MongoDB");
  }
  return db;
}

/////////////////////////
// 🔥 Recalculate last invoice
/////////////////////////
async function recalcLastInvoice(clientId) {
  const database = await getDb();
  const lastInvoice = await database
    .collection("invoices")
    .find({ clientId })
    .sort({ date: -1 })
    .limit(1)
    .toArray();

  const lastDate = lastInvoice.length ? lastInvoice[0].date : null;

  await database.collection("clients").updateOne(
    { _id: new ObjectId(clientId) },
    { $set: { lastInvoiceDate: lastDate } }
  );
}

/////////////////////////
// ROUTES
/////////////////////////

app.get("/", (req, res) => {
  res.send("Pharmacy System API is running...");
});

/////////////////////////
// CLIENTS
/////////////////////////

app.get("/clients", async (req, res) => {
  try {
    const database = await getDb();
    const clients = await database.collection("clients").find().toArray();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

app.post("/clients", async (req, res) => {
  try {
    const database = await getDb();
    const result = await database.collection("clients").insertOne(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to add client" });
  }
});

app.put("/clients/:id", async (req, res) => {
  try {
    const database = await getDb();
    const id = req.params.id;
    const result = await database.collection("clients").updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

app.delete("/clients/:id", async (req, res) => {
  try {
    const database = await getDb();
    const id = req.params.id;
    const deleteInvoices = await database.collection("invoices").deleteMany({ clientId: id });
    const deleteClient = await database.collection("clients").deleteOne({ _id: new ObjectId(id) });
    res.json({ invoicesDeleted: deleteInvoices.deletedCount, clientDeleted: deleteClient.deletedCount });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

app.get("/clients/:id", async (req, res) => {
  try {
    const database = await getDb();
    const id = req.params.id;
    const clientData = await database.collection("clients").findOne({ _id: new ObjectId(id) });
    const invoices = await database.collection("invoices").find({ clientId: id }).toArray();
    res.json({ client: clientData, invoices });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch client data" });
  }
});

/////////////////////////
// INVOICES
/////////////////////////

app.get("/invoices/:clientId", async (req, res) => {
  try {
    const database = await getDb();
    const clientId = req.params.clientId;
    const invoices = await database.collection("invoices").find({ clientId }).toArray();
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

app.post("/invoices", async (req, res) => {
try {
    const database = await getDb();
    const newInvoice = {
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : new Date(),
    };
    const result = await database.collection("invoices").insertOne(newInvoice);
    await recalcLastInvoice(req.body.clientId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to add invoice" });
  }
});

app.put("/invoices/:id", async (req, res) => {
  try {
    const database = await getDb();
    const id = req.params.id;
    const invoice = await database.collection("invoices").findOne({ _id: new ObjectId(id) });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const updatedData = {
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : invoice.date,
    };
    await database.collection("invoices").updateOne({ _id: new ObjectId(id) }, { $set: updatedData });
    await recalcLastInvoice(invoice.clientId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

app.delete("/invoices/:id", async (req, res) => {
  try {
    const database = await getDb();
    const id = req.params.id;
    const invoice = await database.collection("invoices").findOne({ _id: new ObjectId(id) });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    await database.collection("invoices").deleteOne({ _id: new ObjectId(id) });
    await recalcLastInvoice(invoice.clientId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// Start server for local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
}

module.exports = app;