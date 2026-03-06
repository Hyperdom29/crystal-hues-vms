const express  = require("express");
const cors     = require("cors");
const sqlite3  = require("sqlite3").verbose();
const path     = require("path");

const app    = express();
const isProd = process.env.NODE_ENV === "production";
const db     = new sqlite3.Database(path.join(__dirname, "vendors.db"));

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

// ─── Schema + Seed ────────────────────────────────────────────
const SEED_VENDORS = [
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
];

const INSERT_SQL = `
  INSERT INTO vendors
    (name, email, phone, location, type, languages, services, experience,
     education, specialization, iso17100, iso18587, iso27001, nda_signed,
     rate, rate_unit, availability, rating, projects, joined, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

function vendorToRow(v) {
  return [
    v.name, v.email, v.phone, v.location, v.type,
    v.languages, v.services, v.experience, v.education, v.specialization,
    v.iso17100, v.iso18587, v.iso27001, v.nda_signed,
    v.rate, v.rate_unit, v.availability, v.rating, v.projects, v.joined, v.status,
  ];
}

db.serialize(() => {
  db.run(`
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
  `, (err) => {
    if (err) return console.error("Schema error:", err.message);

    db.get("SELECT COUNT(*) AS n FROM vendors", [], (err2, row) => {
      if (err2) return console.error("Count error:", err2.message);
      if (row.n > 0) return;

      const stmt = db.prepare(INSERT_SQL);
      SEED_VENDORS.forEach(v => stmt.run(vendorToRow(v)));
      stmt.finalize(() => console.log("✔ Seeded 7 vendors"));
    });
  });
});

// ─── Routes ───────────────────────────────────────────────────

// GET /api/vendors
app.get("/api/vendors", (req, res) => {
  db.all("SELECT * FROM vendors ORDER BY id", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(parseVendor));
  });
});

// GET /api/vendors/:id
app.get("/api/vendors/:id", (req, res) => {
  db.get("SELECT * FROM vendors WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Vendor not found" });
    res.json(parseVendor(row));
  });
});

// POST /api/vendors
app.post("/api/vendors", (req, res) => {
  const b = req.body;
  const joined = b.joined ?? new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
  const row = [
    b.name           ?? "",
    b.email          ?? "",
    b.phone          ?? "",
    b.location       ?? "",
    b.type           ?? "",
    JSON.stringify(b.languages ?? []),
    JSON.stringify(b.services  ?? []),
    b.experience     ?? 0,
    b.education      ?? "",
    b.specialization ?? "",
    b.iso17100  ? 1 : 0,
    b.iso18587  ? 1 : 0,
    b.iso27001  ? 1 : 0,
    b.nda_signed ? 1 : 0,
    b.rate           ?? "",
    b.rate_unit      ?? "",
    b.availability   ?? "",
    b.rating         ?? 0,
    b.projects       ?? 0,
    joined,
    b.status         ?? "Pending",
  ];

  db.run(INSERT_SQL, row, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get("SELECT * FROM vendors WHERE id = ?", [this.lastID], (err2, created) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.status(201).json(parseVendor(created));
    });
  });
});

// PUT /api/vendors/:id
app.put("/api/vendors/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM vendors WHERE id = ?", [id], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!existing) return res.status(404).json({ error: "Vendor not found" });

    const b = req.body;
    const values = [
      b.name           ?? existing.name,
      b.email          ?? existing.email,
      b.phone          ?? existing.phone,
      b.location       ?? existing.location,
      b.type           ?? existing.type,
      Array.isArray(b.languages) ? JSON.stringify(b.languages) : existing.languages,
      Array.isArray(b.services)  ? JSON.stringify(b.services)  : existing.services,
      b.experience     ?? existing.experience,
      b.education      ?? existing.education,
      b.specialization ?? existing.specialization,
      b.iso17100  !== undefined ? (b.iso17100  ? 1 : 0) : existing.iso17100,
      b.iso18587  !== undefined ? (b.iso18587  ? 1 : 0) : existing.iso18587,
      b.iso27001  !== undefined ? (b.iso27001  ? 1 : 0) : existing.iso27001,
      b.nda_signed !== undefined ? (b.nda_signed ? 1 : 0) : existing.nda_signed,
      b.rate           ?? existing.rate,
      b.rate_unit      ?? existing.rate_unit,
      b.availability   ?? existing.availability,
      b.rating         ?? existing.rating,
      b.projects       ?? existing.projects,
      b.joined         ?? existing.joined,
      b.status         ?? existing.status,
      id,
    ];

    db.run(`
      UPDATE vendors SET
        name = ?, email = ?, phone = ?, location = ?, type = ?,
        languages = ?, services = ?, experience = ?, education = ?,
        specialization = ?, iso17100 = ?, iso18587 = ?, iso27001 = ?,
        nda_signed = ?, rate = ?, rate_unit = ?, availability = ?,
        rating = ?, projects = ?, joined = ?, status = ?
      WHERE id = ?
    `, values, (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      db.get("SELECT * FROM vendors WHERE id = ?", [id], (err3, updated) => {
        if (err3) return res.status(500).json({ error: err3.message });
        res.json(parseVendor(updated));
      });
    });
  });
});

// DELETE /api/vendors/:id
app.delete("/api/vendors/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT id FROM vendors WHERE id = ?", [id], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!existing) return res.status(404).json({ error: "Vendor not found" });
    db.run("DELETE FROM vendors WHERE id = ?", [id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: "Vendor deleted", id: Number(id) });
    });
  });
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
