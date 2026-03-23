require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const MGMT_KEY = process.env.openrouter_mgmtkey;
if (!MGMT_KEY) {
  console.error("Missing openrouter_mgmtkey in .env");
  process.exit(1);
}

const OR_BASE = "https://openrouter.ai/api/v1";

function mgmtHeaders() {
  return {
    Authorization: `Bearer ${MGMT_KEY}`,
    "Content-Type": "application/json",
  };
}

// POST /api/validate — validate user's API key and return their usage summary
app.post("/api/validate", async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== "string") {
    return res.status(400).json({ error: "API key is required" });
  }

  try {
    // SHA-256 hash of the user's key to match against /keys list
    const hash = crypto.createHash("sha256").update(apiKey).digest("hex");

    const keysResp = await fetch(`${OR_BASE}/keys`, {
      headers: mgmtHeaders(),
    });
    if (!keysResp.ok) {
      return res.status(502).json({ error: "Failed to fetch keys from OpenRouter" });
    }

    const keysData = await keysResp.json();
    const matched = keysData.data.find((k) => k.hash === hash);

    if (!matched) {
      return res.status(401).json({ error: "Invalid API key. Key not found in this organization." });
    }

    res.json({
      name: matched.name,
      label: matched.label,
      usage: matched.usage,
      usage_daily: matched.usage_daily,
      usage_weekly: matched.usage_weekly,
      usage_monthly: matched.usage_monthly,
      byok_usage: matched.byok_usage,
      created_at: matched.created_at,
      limit: matched.limit,
      limit_remaining: matched.limit_remaining,
    });
  } catch (err) {
    console.error("Validate error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/activity — account-wide activity (last 30 days)
app.get("/api/activity", async (req, res) => {
  try {
    const resp = await fetch(`${OR_BASE}/activity`, {
      headers: mgmtHeaders(),
    });
    if (!resp.ok) {
      return res.status(502).json({ error: "Failed to fetch activity" });
    }
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    console.error("Activity error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/credits — account credits balance
app.get("/api/credits", async (req, res) => {
  try {
    const resp = await fetch(`${OR_BASE}/credits`, {
      headers: mgmtHeaders(),
    });
    if (!resp.ok) {
      return res.status(502).json({ error: "Failed to fetch credits" });
    }
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    console.error("Credits error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
