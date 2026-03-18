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

async function start() {
  await client.connect();
  db = client.db("mydb");
  console.log("MongoDB Connected");
  app.listen(3000, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

start();



/////////////////////////
//// CLIENTS API
/////////////////////////

// جلب جميع العملاء
app.get("/clients", async (req, res) => {
  const clients = await db.collection("clients").find().toArray();
  res.json(clients);
});

// إضافة عميل
app.post("/clients", async (req, res) => {
  const result = await db.collection("clients").insertOne(req.body);
  res.json(result);
});

// تعديل عميل
app.put("/clients/:id", async (req, res) => {
  const id = req.params.id;
  const result = await db.collection("clients").updateOne(
    { _id: new ObjectId(id) },
    { $set: req.body }
  );
  res.json(result);
});

// حذف عميل
app.delete("/clients/:id", async (req, res) => {
  const id = req.params.id;
  const result = await db.collection("clients").deleteOne({ _id: new ObjectId(id) });
  res.json(result);
});

// جلب بيانات عميل مع الفواتير
app.get("/clients/:id", async (req, res) => {
  const id = req.params.id;
  const clientData = await db.collection("clients").findOne({ _id: new ObjectId(id) });
  const invoices = await db.collection("invoices").find({ clientId: id }).toArray();
  res.json({ client: clientData, invoices });
});

// عدد العملاء
app.get("/clients/count", async (req,res)=>{
  const count = await db.collection("clients").countDocuments();
  res.json({count});
});


/////////////////////////
//// INVOICES
/////////////////////////

// جلب فواتير عميل
app.get("/invoices/:clientId", async (req,res)=>{
  const clientId = req.params.clientId;
  const invoices = await db.collection("invoices").find({clientId}).toArray();
  res.json(invoices);
});

// إضافة فاتورة
app.post("/invoices", async (req,res)=>{
  const result = await db.collection("invoices").insertOne(req.body);
  res.json(result);
});

// تعديل فاتورة
app.put("/invoices/:id", async (req,res)=>{
  const id = req.params.id;
  await db.collection("invoices").updateOne({_id:new ObjectId(id)}, {$set:req.body});
  res.json({ok:true});
});

// حذف فاتورة
app.delete("/invoices/:id", async (req,res)=>{
  const id = req.params.id;
  await db.collection("invoices").deleteOne({_id:new ObjectId(id)});
  res.json({ok:true});
});



