const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(bodyParser.json());

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

// دالة حاسمة لضمان الاتصال قبل أي طلب
async function ensureDb() {
  if (!db) {
    await client.connect();
    db = client.db("Pharmacy_DB");
    console.log("✅ Connected to MongoDB!");
  }
  return db;
}

/////////////////////////
// 🔥 Recalculate last invoice
/////////////////////////
async function recalcLastInvoice(clientId) {
  const database = await ensureDb();
  const lastInvoice = await database
    .collection("invoices")
    .find({ clientId })
    .sort({ date: -1 })
    .limit(1)
    .toArray();

  const lastDate = lastInvoice.length ? lastInvoice[0].date : null;

  await database
    .collection("clients")
    .updateOne(
      { _id: new ObjectId(clientId) },
      { $set: { lastInvoiceDate: lastDate } }
    );
}

/////////////////////////
// ROUTES
/////////////////////////

app.get("/", (req, res) => {
  res.send("Hello World! Pharmacy Server is Running.");
});

// GET ALL CLIENTS
app.get("/clients", async (req, res) => {
  try {
    const database = await ensureDb();
    const clients = await database.collection("clients").find().toArray();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ADD CLIENT
app.post("/clients", async (req, res) => {
  try {
    const database = await ensureDb();
    const result = await database.collection("clients").insertOne(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to add client" });
  }
});

// UPDATE CLIENT
app.put("/clients/:id", async (req, res) => {
  try {
    const database = await ensureDb();
    const id = req.params.id;
    const result = await database
      .collection("clients")
      .updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// DELETE CLIENT
app.delete("/clients/:id", async (req, res) => {
  try {
    const database = await ensureDb();
    const id = req.params.id;

    await database.collection("invoices").deleteMany({ clientId: id });
    const deleteClient = await database.collection("clients").deleteOne({
      _id: new ObjectId(id),
    });

    res.json({ clientDeleted: deleteClient.deletedCount });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// GET SINGLE CLIENT + INVOICES
app.get("/clients/:id", async (req, res) => {
  try {
    const database = await ensureDb();
    const id = req.params.id;

    const clientData = await database.collection("clients").findOne({
      _id: new ObjectId(id),
    });

    const invoices = await database
      .collection("invoices")
      .find({ clientId: id })
      .toArray();

    res.json({ client: clientData, invoices });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/////////////////////////
// INVOICES ROUTES
/////////////////////////

app.get("/invoices/:clientId", async (req, res) => {
  try {
    const database = await ensureDb();
    const clientId = req.params.clientId;
    const invoices = await database.collection("invoices").find({ clientId }).toArray();
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/invoices", async (req, res) => {
  try {
    const database = await ensureDb();
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

// START SERVER (For Local testing)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

module.exports = app;