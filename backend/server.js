import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 5175;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "data");
const logFile = path.join(dataDir, "requests.jsonl");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/cohort-requests", (req, res) => {
  const payload = req.body || {};
  const entry = {
    id: `req_${Date.now()}`,
    receivedAt: new Date().toISOString(),
    ...payload,
  };

  fs.appendFileSync(logFile, `${JSON.stringify(entry)}\n`, "utf8");
  res.json({ ok: true, entry });
});

app.get("/cohort-requests", (req, res) => {
  const limit = Number(req.query.limit || 10);
  if (!fs.existsSync(logFile)) {
    return res.json([]);
  }
  const lines = fs.readFileSync(logFile, "utf8").trim().split("\n").filter(Boolean);
  const slice = lines.slice(-limit).map((line) => JSON.parse(line));
  return res.json(slice);
});

app.listen(PORT, () => {
  console.log(`TrialVault API listening on ${PORT}`);
});
