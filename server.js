const express  = require("express");
const cors     = require("cors");
const Database = require("better-sqlite3");
const path     = require("path");

const app    = express();
const isProd = process.env.NODE_ENV === "production";
const db     = new Database(path.join(__dirname, "vendors.db"));

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

// ─── Helper: parse JSON columns on the way out ────────────────
function parseVendor(v) {
  if (!v) return v;
  return {
    ...v,
    languages:  JSON.parse(v.languages  || "[]"),
    services:   JSON.parse(v.services   || "[]"),
    iso17100:   Boolean(v.iso17100),
    iso18587:   Boolean(v.iso18587),
    iso27001:   Boolean(v.iso27001),
    nda_signed: Boolean(v.nda_signed),
  };
}

// ─── Schema ───────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS vendors (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    name           TEXT    NOT NULL,
    email          TEXT    NOT NULL,
    phone          TEXT,
    location       TEXT,
    type           TEXT,
    languages      TEXT,
    services       TEXT,
    experience     INTEGER,
    education      TEXT,
    specialization TEXT,
    iso17100       INTEGER DEFAULT 0,
    iso18587       INTEGER DEFAULT 0,
    iso27001       INTEGER DEFAULT 0,
    nda_signed     INTEGER DEFAULT 0,
    rate           TEXT,
    rate_unit      TEXT,
    availability   TEXT,
    rating         REAL    DEFAULT 0,
    projects       INTEGER DEFAULT 0,
    joined         TEXT,
    status         TEXT    DEFAULT 'Pending'
  )
`);

// ─── Seed ─────────────────────────────────────────────────────
const count = db.prepare("SELECT COUNT(*) AS n FROM vendors").get().n;

if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO vendors
      (name, email, phone, location, type, languages, services, experience,
       education, specialization, iso17100, iso18587, iso27001, nda_signed,
       rate, rate_unit, availability, rating, projects, joined, status)
    VALUES
      (@name, @email, @phone, @location, @type, @languages, @services, @experience,
       @education, @specialization, @iso17100, @iso18587, @iso27001, @nda_signed,
       @rate, @rate_unit, @availability, @rating, @projects, @joined, @status)
  `);

  const seedMany = db.transaction((vendors) => {
    for (const v of vendors) insert.run(v);
  });

  seedMany([
    {
      name: "Priya Sharma", email: "priya.sharma@email.com",
      phone: "+91 98765 43210", location: "Mumbai, India", type: "Translator",
      languages: JSON.stringify(["Hindi","English","Marathi","Gujarati"]),
      services:  JSON.stringify(["Translation","Proofreading","MTPE"]),
      experience: 8, education: "MA in Linguistics, Mumbai University",
      specialization: "Legal, Medical",
      iso17100: 1, iso18587: 0, iso27001: 1, nda_signed: 1,
      rate: "1.5", rate_unit: "per word", availability: "Full-time",
      rating: 4.9, projects: 234, joined: "15 Mar 2021", status: "Active",
    },
    {
      name: "Rahul Mehta", email: "rahul.m@email.com",
      phone: "+91 87654 32109", location: "Delhi, India", type: "Transcriptionist",
      languages: JSON.stringify(["Hindi","English","Punjabi"]),
      services:  JSON.stringify(["Transcription","Translation"]),
      experience: 5, education: "BA in English, Delhi University",
      specialization: "Finance, Corporate",
      iso17100: 0, iso18587: 0, iso27001: 1, nda_signed: 1,
      rate: "120", rate_unit: "per hour", availability: "Full-time",
      rating: 4.7, projects: 156, joined: "02 Jul 2022", status: "Active",
    },
    {
      name: "Sofia Mendes", email: "sofia.mendes@email.com",
      phone: "+55 11 98765-4321", location: "São Paulo, Brazil", type: "Voice Artist",
      languages: JSON.stringify(["Portuguese","Spanish","English"]),
      services:  JSON.stringify(["Voice Over","Dubbing","Subtitling"]),
      experience: 12, education: "BA in Communication Arts",
      specialization: "Commercial, Animation, E-Learning",
      iso17100: 0, iso18587: 0, iso27001: 1, nda_signed: 1,
      rate: "45", rate_unit: "per hour", availability: "Project-based",
      rating: 5.0, projects: 89, joined: "18 Jan 2020", status: "Active",
    },
    {
      name: "Akira Tanaka", email: "akira.t@email.com",
      phone: "+81 90-1234-5678", location: "Tokyo, Japan", type: "Translator",
      languages: JSON.stringify(["Japanese","English","Korean"]),
      services:  JSON.stringify(["Translation","Localization","Post Editing"]),
      experience: 15, education: "MA Japanese Studies, Waseda University",
      specialization: "Technology, Gaming, Software",
      iso17100: 1, iso18587: 1, iso27001: 1, nda_signed: 0,
      rate: "0.15", rate_unit: "per word", availability: "Part-time",
      rating: 4.8, projects: 312, joined: "07 Nov 2023", status: "Pending",
    },
    {
      name: "DataMind Solutions", email: "contact@datamind.io",
      phone: "+1 415 555-0199", location: "San Francisco, USA", type: "Agency",
      languages: JSON.stringify(["English","Spanish","French","German","Chinese"]),
      services:  JSON.stringify(["Data Annotation","Data Labeling","Sentiment Analysis","Pre-processing"]),
      experience: 7, education: "N/A (Agency)",
      specialization: "AI/ML, Computer Vision, NLP",
      iso17100: 0, iso18587: 0, iso27001: 1, nda_signed: 1,
      rate: "Custom", rate_unit: "custom", availability: "On-demand",
      rating: 4.6, projects: 67, joined: "14 Apr 2022", status: "Active",
    },
    {
      name: "Amara Diallo", email: "amara.d@email.com",
      phone: "+33 6 12 34 56 78", location: "Paris, France", type: "Interpreter",
      languages: JSON.stringify(["French","English","Arabic","Wolof"]),
      services:  JSON.stringify(["Interpretation","Translation"]),
      experience: 10, education: "MA Conference Interpreting, ESIT Paris",
      specialization: "Legal, Government, Medical",
      iso17100: 1, iso18587: 0, iso27001: 0, nda_signed: 1,
      rate: "60", rate_unit: "per hour", availability: "Project-based",
      rating: 4.5, projects: 178, joined: "23 Aug 2019", status: "Inactive",
    },
    {
      name: "Chen Wei", email: "chen.wei@email.com",
      phone: "+86 138 0013 8000", location: "Shanghai, China", type: "Data Annotator",
      languages: JSON.stringify(["Chinese","English","Japanese"]),
      services:  JSON.stringify(["Data Annotation","Data Labeling","Data Pre-processing","Semantic Annotation"]),
      experience: 4, education: "BSc Computer Science, Shanghai Jiao Tong University",
      specialization: "NLP, Computer Vision, Healthcare AI",
      iso17100: 0, iso18587: 0, iso27001: 1, nda_signed: 1,
      rate: "22", rate_unit: "per hour", availability: "Full-time",
      rating: 4.4, projects: 203, joined: "11 Sep 2023", status: "Active",
    },
  ]);

  console.log("✔ Seeded 7 vendors");
}

// ─── Routes ───────────────────────────────────────────────────

// GET /api/vendors
app.get("/api/vendors", (req, res) => {
  const vendors = db.prepare("SELECT * FROM vendors ORDER BY id").all();
  res.json(vendors.map(parseVendor));
});

// GET /api/vendors/:id
app.get("/api/vendors/:id", (req, res) => {
  const vendor = db.prepare("SELECT * FROM vendors WHERE id = ?").get(req.params.id);
  if (!vendor) return res.status(404).json({ error: "Vendor not found" });
  res.json(parseVendor(vendor));
});

// POST /api/vendors
app.post("/api/vendors", (req, res) => {
  const b = req.body;
  const stmt = db.prepare(`
    INSERT INTO vendors
      (name, email, phone, location, type, languages, services, experience,
       education, specialization, iso17100, iso18587, iso27001, nda_signed,
       rate, rate_unit, availability, rating, projects, joined, status)
    VALUES
      (@name, @email, @phone, @location, @type, @languages, @services, @experience,
       @education, @specialization, @iso17100, @iso18587, @iso27001, @nda_signed,
       @rate, @rate_unit, @availability, @rating, @projects, @joined, @status)
  `);

  const result = stmt.run({
    name:           b.name           ?? "",
    email:          b.email          ?? "",
    phone:          b.phone          ?? "",
    location:       b.location       ?? "",
    type:           b.type           ?? "",
    languages:      JSON.stringify(b.languages ?? []),
    services:       JSON.stringify(b.services  ?? []),
    experience:     b.experience     ?? 0,
    education:      b.education      ?? "",
    specialization: b.specialization ?? "",
    iso17100:       b.iso17100  ? 1 : 0,
    iso18587:       b.iso18587  ? 1 : 0,
    iso27001:       b.iso27001  ? 1 : 0,
    nda_signed:     b.nda_signed ? 1 : 0,
    rate:           b.rate           ?? "",
    rate_unit:      b.rate_unit      ?? "",
    availability:   b.availability   ?? "",
    rating:         b.rating         ?? 0,
    projects:       b.projects       ?? 0,
    joined:         b.joined         ?? new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }),
    status:         b.status         ?? "Pending",
  });

  const created = db.prepare("SELECT * FROM vendors WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(parseVendor(created));
});

// PUT /api/vendors/:id
app.put("/api/vendors/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM vendors WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Vendor not found" });

  const b = req.body;
  db.prepare(`
    UPDATE vendors SET
      name = @name, email = @email, phone = @phone, location = @location,
      type = @type, languages = @languages, services = @services,
      experience = @experience, education = @education,
      specialization = @specialization, iso17100 = @iso17100,
      iso18587 = @iso18587, iso27001 = @iso27001, nda_signed = @nda_signed,
      rate = @rate, rate_unit = @rate_unit, availability = @availability,
      rating = @rating, projects = @projects, joined = @joined, status = @status
    WHERE id = @id
  `).run({
    id:             req.params.id,
    name:           b.name           ?? existing.name,
    email:          b.email          ?? existing.email,
    phone:          b.phone          ?? existing.phone,
    location:       b.location       ?? existing.location,
    type:           b.type           ?? existing.type,
    languages:      Array.isArray(b.languages) ? JSON.stringify(b.languages) : existing.languages,
    services:       Array.isArray(b.services)  ? JSON.stringify(b.services)  : existing.services,
    experience:     b.experience     ?? existing.experience,
    education:      b.education      ?? existing.education,
    specialization: b.specialization ?? existing.specialization,
    iso17100:       b.iso17100  !== undefined ? (b.iso17100  ? 1 : 0) : existing.iso17100,
    iso18587:       b.iso18587  !== undefined ? (b.iso18587  ? 1 : 0) : existing.iso18587,
    iso27001:       b.iso27001  !== undefined ? (b.iso27001  ? 1 : 0) : existing.iso27001,
    nda_signed:     b.nda_signed !== undefined ? (b.nda_signed ? 1 : 0) : existing.nda_signed,
    rate:           b.rate           ?? existing.rate,
    rate_unit:      b.rate_unit      ?? existing.rate_unit,
    availability:   b.availability   ?? existing.availability,
    rating:         b.rating         ?? existing.rating,
    projects:       b.projects       ?? existing.projects,
    joined:         b.joined         ?? existing.joined,
    status:         b.status         ?? existing.status,
  });

  const updated = db.prepare("SELECT * FROM vendors WHERE id = ?").get(req.params.id);
  res.json(parseVendor(updated));
});

// DELETE /api/vendors/:id
app.delete("/api/vendors/:id", (req, res) => {
  const existing = db.prepare("SELECT id FROM vendors WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Vendor not found" });
  db.prepare("DELETE FROM vendors WHERE id = ?").run(req.params.id);
  res.json({ message: "Vendor deleted", id: Number(req.params.id) });
});

// ─── SPA fallback (production only) ──────────────────────────
if (isProd) {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
  });
}

// ─── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
