const express  = require("express");
const cors     = require("cors");
const path     = require("path");
const low      = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync(path.join(__dirname, "db.json"));
const db      = low(adapter);

const app    = express();
const isProd = process.env.NODE_ENV === "production";

// ─── Middleware ───────────────────────────────────────────────
if (!isProd) {
  app.use(cors({ origin: "http://localhost:5173" }));
}
app.use(express.json());

// ─── Static frontend (production only) ───────────────────────
if (isProd) {
  const distPath = path.join(__dirname, "client", "dist");
  app.use(express.static(distPath));
}

// ─── Seed default data ────────────────────────────────────────
db.defaults({ vendors: [] }).write();

if (db.get("vendors").value().length === 0) {
  db.get("vendors").push(
    {
      id: "1", name: "Priya Sharma", type: "Translator",
      email: "priya.sharma@email.com", phone: "+91 98765 43210",
      location: "Mumbai, India", status: "Active",
      languages: ["Hindi", "English", "Marathi", "Gujarati"],
      services: ["Translation", "Proofreading", "MTPE"],
      experience: 8, education: "MA in Linguistics, Mumbai University",
      specialization: "Legal, Medical",
      iso17100: true, iso18587: false, iso27001: true, nda_signed: true,
      rate: "1.5", rate_unit: "per word", availability: "Full-time",
      rating: 4.9, projects: 234, joined: "15 Mar 2021",
    },
    {
      id: "2", name: "Rahul Mehta", type: "Transcriptionist",
      email: "rahul.m@email.com", phone: "+91 87654 32109",
      location: "Delhi, India", status: "Active",
      languages: ["Hindi", "English", "Punjabi"],
      services: ["Transcription", "Translation"],
      experience: 5, education: "BA in English, Delhi University",
      specialization: "Finance, Corporate",
      iso17100: false, iso18587: false, iso27001: true, nda_signed: true,
      rate: "120", rate_unit: "per hour", availability: "Full-time",
      rating: 4.7, projects: 156, joined: "02 Jul 2022",
    },
    {
      id: "3", name: "Sofia Mendes", type: "Voice Artist",
      email: "sofia.mendes@email.com", phone: "+55 11 98765-4321",
      location: "São Paulo, Brazil", status: "Active",
      languages: ["Portuguese", "Spanish", "English"],
      services: ["Voice Over", "Dubbing", "Subtitling"],
      experience: 12, education: "BA in Communication Arts",
      specialization: "Commercial, Animation, E-Learning",
      iso17100: false, iso18587: false, iso27001: true, nda_signed: true,
      rate: "45", rate_unit: "per hour", availability: "Project-based",
      rating: 5.0, projects: 89, joined: "18 Jan 2020",
    },
    {
      id: "4", name: "Akira Tanaka", type: "Translator",
      email: "akira.t@email.com", phone: "+81 90-1234-5678",
      location: "Tokyo, Japan", status: "Pending",
      languages: ["Japanese", "English", "Korean"],
      services: ["Translation", "Localization", "Post Editing"],
      experience: 15, education: "MA Japanese Studies, Waseda University",
      specialization: "Technology, Gaming, Software",
      iso17100: true, iso18587: true, iso27001: true, nda_signed: false,
      rate: "0.15", rate_unit: "per word", availability: "Part-time",
      rating: 4.8, projects: 312, joined: "07 Nov 2023",
    },
    {
      id: "5", name: "DataMind Solutions", type: "Agency",
      email: "contact@datamind.io", phone: "+1 415 555-0199",
      location: "San Francisco, USA", status: "Active",
      languages: ["English", "Spanish", "French", "German", "Chinese"],
      services: ["Data Annotation", "Data Labeling", "Sentiment Analysis", "Pre-processing"],
      experience: 7, education: "N/A (Agency)",
      specialization: "AI/ML, Computer Vision, NLP",
      iso17100: false, iso18587: false, iso27001: true, nda_signed: true,
      rate: "Custom", rate_unit: "custom", availability: "On-demand",
      rating: 4.6, projects: 67, joined: "14 Apr 2022",
    },
    {
      id: "6", name: "Amara Diallo", type: "Interpreter",
      email: "amara.d@email.com", phone: "+33 6 12 34 56 78",
      location: "Paris, France", status: "Inactive",
      languages: ["French", "English", "Arabic", "Wolof"],
      services: ["Interpretation", "Translation"],
      experience: 10, education: "MA Conference Interpreting, ESIT Paris",
      specialization: "Legal, Government, Medical",
      iso17100: true, iso18587: false, iso27001: false, nda_signed: true,
      rate: "60", rate_unit: "per hour", availability: "Project-based",
      rating: 4.5, projects: 178, joined: "23 Aug 2019",
    },
    {
      id: "7", name: "Chen Wei", type: "Data Annotator",
      email: "chen.wei@email.com", phone: "+86 138 0013 8000",
      location: "Shanghai, China", status: "Active",
      languages: ["Chinese", "English", "Japanese"],
      services: ["Data Annotation", "Data Labeling", "Data Pre-processing", "Semantic Annotation"],
      experience: 4, education: "BSc Computer Science, Shanghai Jiao Tong University",
      specialization: "NLP, Computer Vision, Healthcare AI",
      iso17100: false, iso18587: false, iso27001: true, nda_signed: true,
      rate: "22", rate_unit: "per hour", availability: "Full-time",
      rating: 4.4, projects: 203, joined: "11 Sep 2023",
    }
  ).write();
  console.log("✔ Seeded 7 vendors");
}

// ─── Routes ───────────────────────────────────────────────────

// GET /api/vendors
app.get("/api/vendors", (req, res) => {
  res.json(db.get("vendors").value());
});

// GET /api/vendors/:id
app.get("/api/vendors/:id", (req, res) => {
  const vendor = db.get("vendors").find({ id: req.params.id }).value();
  if (!vendor) return res.status(404).json({ error: "Vendor not found" });
  res.json(vendor);
});

// POST /api/vendors
app.post("/api/vendors", (req, res) => {
  const newVendor = {
    id:             Date.now().toString(),
    name:           req.body.name           ?? "",
    email:          req.body.email          ?? "",
    phone:          req.body.phone          ?? "",
    location:       req.body.location       ?? "",
    type:           req.body.type           ?? "",
    languages:      req.body.languages      ?? [],
    services:       req.body.services       ?? [],
    experience:     req.body.experience     ?? 0,
    education:      req.body.education      ?? "",
    specialization: req.body.specialization ?? "",
    iso17100:       req.body.iso17100       ?? false,
    iso18587:       req.body.iso18587       ?? false,
    iso27001:       req.body.iso27001       ?? false,
    nda_signed:     req.body.nda_signed     ?? false,
    rate:           req.body.rate           ?? "",
    rate_unit:      req.body.rate_unit      ?? "",
    availability:   req.body.availability   ?? "",
    rating:         req.body.rating         ?? 0,
    projects:       req.body.projects       ?? 0,
    joined:         req.body.joined         ?? new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    status:         req.body.status         ?? "Pending",
  };
  db.get("vendors").push(newVendor).write();
  res.status(201).json(newVendor);
});

// PUT /api/vendors/:id
app.put("/api/vendors/:id", (req, res) => {
  const vendor = db.get("vendors").find({ id: req.params.id }).value();
  if (!vendor) return res.status(404).json({ error: "Vendor not found" });

  const updated = {
    ...vendor,
    ...req.body,
    id: req.params.id, // prevent id from being overwritten
  };
  db.get("vendors").find({ id: req.params.id }).assign(updated).write();
  res.json(updated);
});

// DELETE /api/vendors/:id
app.delete("/api/vendors/:id", (req, res) => {
  const vendor = db.get("vendors").find({ id: req.params.id }).value();
  if (!vendor) return res.status(404).json({ error: "Vendor not found" });
  db.get("vendors").remove({ id: req.params.id }).write();
  res.json({ message: "Vendor deleted", id: req.params.id });
});

// ─── SPA fallback (production only) ──────────────────────────
if (isProd) {
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
  });
}

// ─── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
