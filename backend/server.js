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

// connect
async function run() {
  try {
    await client.connect();
    db = client.db("Pharmacy_DB");
    await db.command({ ping: 1 });
    console.log("✅ Connected to MongoDB!");
  } catch (error) {
    console.error("❌ Connection error", error);
  }
}

run().catch(console.dir);

/////////////////////////
// 🔥 Recalculate last invoice
/////////////////////////
async function recalcLastInvoice(clientId) {
  const lastInvoice = await db
    .collection("invoices")
    .find({ clientId })
    .sort({ date: -1 })
    .limit(1)
    .toArray();

  const lastDate = lastInvoice.length ? lastInvoice[0].date : null;

  await db
    .collection("clients")
    .updateOne(
      { _id: new ObjectId(clientId) },
      { $set: { lastInvoiceDate: lastDate } },
    );
}

/////////////////////////
// CLIENTS
/////////////////////////

app.get("/clients", async (req, res) => {
  const clients = await db.collection("clients").find().toArray();
  res.json(clients);
});

app.post("/clients", async (req, res) => {
  try {
    const result = await db.collection("clients").insertOne(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to add client" });
  }
});

app.put("/clients/:id", async (req, res) => {
  const id = req.params.id;

  const result = await db
    .collection("clients")
    .updateOne({ _id: new ObjectId(id) }, { $set: req.body });

  res.json(result);
});

app.delete("/clients/:id", async (req, res) => {
  try {
    const id = req.params.id;

    console.log("Deleting client:", id);

    const deleteInvoices = await db.collection("invoices").deleteMany({
      clientId: id,
    });

    const deleteClient = await db.collection("clients").deleteOne({
      _id: new ObjectId(id),
    });

    console.log("Deleted client:", deleteClient.deletedCount);

    res.json({
      invoicesDeleted: deleteInvoices.deletedCount,
      clientDeleted: deleteClient.deletedCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

app.get("/clients/:id", async (req, res) => {
  const id = req.params.id;

  const clientData = await db.collection("clients").findOne({
    _id: new ObjectId(id),
  });

  const invoices = await db
    .collection("invoices")
    .find({ clientId: id })
    .toArray();

  res.json({ client: clientData, invoices });
});

/////////////////////////
// INVOICES
/////////////////////////

app.get("/invoices/:clientId", async (req, res) => {
  const clientId = req.params.clientId;

  const invoices = await db.collection("invoices").find({ clientId }).toArray();

  res.json(invoices);
});

/////////////////////////
// ADD INVOICE
/////////////////////////

app.post("/invoices", async (req, res) => {
  try {
    const newInvoice = {
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : new Date(),
    };

    const result = await db.collection("invoices").insertOne(newInvoice);

    await recalcLastInvoice(req.body.clientId);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to add invoice" });
  }
});

/////////////////////////
// UPDATE INVOICE
/////////////////////////

app.put("/invoices/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const invoice = await db.collection("invoices").findOne({
      _id: new ObjectId(id),
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const updatedData = {
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : invoice.date,
    };

    await db
      .collection("invoices")
      .updateOne({ _id: new ObjectId(id) }, { $set: updatedData });

    await recalcLastInvoice(invoice.clientId);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

/////////////////////////
// DELETE INVOICE
/////////////////////////

app.delete("/invoices/:id", async (req, res) => {
  const id = req.params.id;

  const invoice = await db.collection("invoices").findOne({
    _id: new ObjectId(id),
  });

  if (!invoice) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  await db.collection("invoices").deleteOne({
    _id: new ObjectId(id),
  });

  await recalcLastInvoice(invoice.clientId);

  res.json({ ok: true });
});

/////////////////////////
// START SERVER
/////////////////////////

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
