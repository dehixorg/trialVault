import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Patient from "./src/models/tv_Patient.js";
import Trial from "./src/models/tv_Trial.js";
import License from "./src/models/tv_License.js";
import CohortRequest from "./src/models/tv_CohortRequest.js";
import PatientProfile from "./src/models/tv_PatientProfile.js";
import Enrollment from "./src/models/tv_Enrollment.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5175;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "*";
const mongoUri = process.env.MONGO_URI;

let mongoReady = false;

if (mongoUri) {
  mongoose
    .connect(mongoUri)
    .then(() => {
      mongoReady = true;
      console.log("MongoDB connected successfully");
    })
    .catch((err) => {
      mongoReady = false;
      console.error("MongoDB connection error:", err.message);
    });
} else {
  console.warn("MONGO_URI is not set. Database-backed routes will return 503.");
}

app.use(cors({
  origin: CLIENT_ORIGIN === "*" ? true : CLIENT_ORIGIN.split(",").map((origin) => origin.trim()),
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));

const requireMongo = (_req, res, next) => {
  if (!mongoReady) {
    return res.status(503).json({
      error: "Database unavailable",
      detail: "Set MONGO_URI in the deployment environment.",
    });
  }
  return next();
};

app.get("/", (_req, res) => {
  res.json({
    name: "TrialVault API",
    status: "ok",
    database: mongoReady ? "connected" : "unavailable",
    docs: "/health",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    database: mongoReady ? "connected" : "unavailable",
    uptime: process.uptime(),
  });
});

// Patient Routes
app.post("/api/patients", requireMongo, async (req, res) => {
  try {
    const newPatient = new Patient(req.body);
    const savedPatient = await newPatient.save();
    res.status(201).json(savedPatient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/patients/:wallet", requireMongo, async (req, res) => {
  try {
    const patients = await Patient.find({ walletAddress: req.params.wallet }).sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/patients", requireMongo, async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Patient Profile Routes
app.post("/api/profiles", requireMongo, async (req, res) => {
  try {
    const { walletAddress } = req.body;
    let profile = await PatientProfile.findOne({ walletAddress });
    if (profile) {
      Object.assign(profile, req.body);
      profile.updatedAt = Date.now();
    } else {
      profile = new PatientProfile(req.body);
    }
    const savedProfile = await profile.save();
    res.status(200).json(savedProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/profiles/:wallet", requireMongo, async (req, res) => {
  try {
    const profile = await PatientProfile.findOne({ walletAddress: req.params.wallet });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/enrollments", requireMongo, async (req, res) => {
  try {
    const enrollment = new Enrollment(req.body);
    const savedEnrollment = await enrollment.save();
    res.status(201).json(savedEnrollment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/enrollments", requireMongo, async (req, res) => {
  try {
    const enrollments = await Enrollment.find().sort({ createdAt: -1 });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/enrollments/:wallet", requireMongo, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ walletAddress: req.params.wallet }).sort({ createdAt: -1 });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trial Routes
app.post("/api/trials", requireMongo, async (req, res) => {
  try {
    const newTrial = new Trial(req.body);
    const savedTrial = await newTrial.save();
    res.status(201).json(savedTrial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/trials", requireMongo, async (req, res) => {
  try {
    const trials = await Trial.find().sort({ createdAt: -1 });
    res.json(trials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// License Routes
app.post("/api/licenses", requireMongo, async (req, res) => {
  try {
    const newLicense = new License(req.body);
    const savedLicense = await newLicense.save();
    res.status(201).json(savedLicense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/licenses/:wallet", requireMongo, async (req, res) => {
  try {
    const licenses = await License.find({ patientAddress: req.params.wallet });
    res.json(licenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cohort request routes used by the frontend demo and grant review artifacts.
app.post("/cohort-requests", requireMongo, async (req, res) => {
  try {
    const request = new CohortRequest(req.body);
    const savedRequest = await request.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/cohort-requests", requireMongo, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 100);
  try {
    const requests = await CohortRequest.find().sort({ createdAt: -1 }).limit(limit);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`TrialVault API listening on ${PORT}`);
});

const shutdown = async () => {
  console.log("Shutting down TrialVault API");
  server.close(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
