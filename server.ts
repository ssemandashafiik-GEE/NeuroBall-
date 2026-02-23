import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import { analyzeMatch, generateDailyBetSlip } from "./src/services/gemini.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("nerdytips.db");
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-nerdy-tips";

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    tier TEXT DEFAULT 'free',
    predictions_remaining INTEGER DEFAULT 4,
    subscription_end TEXT
  );
  
  CREATE TABLE IF NOT EXISTS predictions (
    id TEXT PRIMARY KEY,
    home_team TEXT,
    away_team TEXT,
    league TEXT,
    start_time TEXT,
    prediction TEXT,
    odds REAL,
    confidence REAL,
    analysis TEXT,
    status TEXT DEFAULT 'pending',
    is_elite INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (e) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // API Routes
  app.post("/api/auth/register", async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = Math.random().toString(36).substring(7);
    try {
      db.prepare("INSERT INTO users (id, email, password) VALUES (?, ?, ?)").run(id, email, hashedPassword);
      const token = jwt.sign({ id, email }, JWT_SECRET);
      res.json({ token, user: { id, email, tier: 'free', predictions_remaining: 4 } });
    } catch (e) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      res.json({ token, user: { id: user.id, email: user.email, tier: user.tier, predictions_remaining: user.predictions_remaining } });
    } else {
      res.status(400).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/predictions", (req, res) => {
    const predictions = db.prepare("SELECT * FROM predictions ORDER BY created_at DESC").all();
    if (predictions.length === 0) {
      // Auto-seed if empty for demo
      const mockPredictions = [
        { id: '1', home: 'Arsenal', away: 'Man City', league: 'Premier League', start: '2026-02-23 20:00', pred: 'Home Win', odds: 2.1, conf: 85, elite: 1, analysis: 'Arsenal in great form at home.' },
        { id: '2', home: 'Real Madrid', away: 'Barcelona', league: 'La Liga', start: '2026-02-24 21:00', pred: 'Over 2.5', odds: 1.6, conf: 92, elite: 1, analysis: 'El Clasico usually high scoring.' },
        { id: '3', home: 'Bayern', away: 'Dortmund', league: 'Bundesliga', start: '2026-02-25 18:30', pred: 'Home Win', odds: 1.4, conf: 78, elite: 0, analysis: 'Bayern dominant at Allianz Arena.' },
        { id: '4', home: 'Liverpool', away: 'Chelsea', league: 'Premier League', start: '2026-02-26 19:45', pred: 'BTTS - Yes', odds: 1.75, conf: 81, elite: 0, analysis: 'Both teams have defensive issues.' }
      ];
      const insert = db.prepare(`
        INSERT OR REPLACE INTO predictions (id, home_team, away_team, league, start_time, prediction, odds, confidence, analysis, is_elite)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of mockPredictions) {
        insert.run(p.id, p.home, p.away, p.league, p.start, p.pred, p.odds, p.conf, p.analysis, p.elite);
      }
      return res.json(db.prepare("SELECT * FROM predictions ORDER BY created_at DESC").all());
    }
    res.json(predictions);
  });

  app.get("/api/predictions/elites", (req, res) => {
    const elites = db.prepare("SELECT * FROM predictions WHERE is_elite = 1 ORDER BY created_at DESC").all();
    res.json(elites);
  });

  app.post("/api/predictions/generate", authenticate, async (req, res) => {
    const { home, away, league } = req.body;
    try {
      const prediction = await analyzeMatch(home, away, league);
      const id = Math.random().toString(36).substring(7);
      
      db.prepare(`
        INSERT INTO predictions (id, home_team, away_team, league, start_time, prediction, odds, confidence, analysis, is_elite)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, 
        prediction.homeTeam, 
        prediction.awayTeam, 
        prediction.league, 
        prediction.startTime, 
        prediction.prediction, 
        prediction.odds, 
        prediction.confidence, 
        prediction.analysis, 
        prediction.isElite ? 1 : 0
      );
      
      res.json({ id, ...prediction });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to generate prediction" });
    }
  });

  // Admin route to seed predictions (In a real app, this would be a cron job calling Gemini)
  app.post("/api/admin/seed-predictions", authenticate, (req, res) => {
    // Simplified for demo
    const mockPredictions = [
      { id: '1', home: 'Arsenal', away: 'Man City', league: 'Premier League', start: '2026-02-23 20:00', pred: 'Home Win', odds: 2.1, conf: 85, elite: 1, analysis: 'Arsenal in great form at home.' },
      { id: '2', home: 'Real Madrid', away: 'Barcelona', league: 'La Liga', start: '2026-02-24 21:00', pred: 'Over 2.5', odds: 1.6, conf: 92, elite: 1, analysis: 'El Clasico usually high scoring.' },
      { id: '3', home: 'Bayern', away: 'Dortmund', league: 'Bundesliga', start: '2026-02-25 18:30', pred: 'Home Win', odds: 1.4, conf: 78, elite: 0, analysis: 'Bayern dominant at Allianz Arena.' }
    ];

    const insert = db.prepare(`
      INSERT OR REPLACE INTO predictions (id, home_team, away_team, league, start_time, prediction, odds, confidence, analysis, is_elite)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of mockPredictions) {
      insert.run(p.id, p.home, p.away, p.league, p.start, p.pred, p.odds, p.conf, p.analysis, p.elite);
    }

    res.json({ message: "Predictions seeded" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
