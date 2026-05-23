import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Patient from "./src/models/tv_Patient.js";
import Trial from "./src/models/tv_Trial.js";
import License from "./src/models/tv_License.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5175;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Patient Routes
app.post("/api/patients", async (req, res) => {
  try {
    const newPatient = new Patient(req.body);
    const savedPatient = await newPatient.save();
    res.status(201).json(savedPatient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/patients/:wallet", async (req, res) => {
  try {
    const patient = await Patient.findOne({ walletAddress: req.params.wallet });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trial Routes
app.post("/api/trials", async (req, res) => {
  try {
    const newTrial = new Trial(req.body);
    const savedTrial = await newTrial.save();
    res.status(201).json(savedTrial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/trials", async (req, res) => {
  try {
    const trials = await Trial.find().sort({ createdAt: -1 });
    res.json(trials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// License Routes
app.post("/api/licenses", async (req, res) => {
  try {
    const newLicense = new License(req.body);
    const savedLicense = await newLicense.save();
    res.status(201).json(savedLicense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/licenses/:wallet", async (req, res) => {
  try {
    const licenses = await License.find({ patientAddress: req.params.wallet });
    res.json(licenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`TrialVault API listening on ${PORT}`);
});
