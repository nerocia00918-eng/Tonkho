import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // --- DATA FETCHING & STORAGE ---
  const GAS_URL = process.env.VITE_GAS_API_URL;

  const isValidUrl = (url: string | undefined): url is string => {
    if (!url) return false;
    try {
      new URL(url);
      return url.startsWith('http');
    } catch {
      return false;
    }
  };

  // Cache for fallback if GAS is down
  let cachedData: any = null;

  // API Routes
  app.get("/api/data", async (req, res) => {
    if (!isValidUrl(GAS_URL)) {
      console.error("Invalid VITE_GAS_API_URL:", GAS_URL);
      return res.status(500).json({ 
        error: "VITE_GAS_API_URL is missing or invalid. Please check your environment variables.",
        received: GAS_URL ? `${GAS_URL.substring(0, 5)}...` : 'undefined'
      });
    }

    const defaultStructure = {
      '64': [],
      'BT': [],
      '7bc': [],
      'Tba': [],
      'tk': [],
      'Data Tba': []
    };

    try {
      console.log("Attempting to fetch from GAS:", GAS_URL.substring(0, 40) + "...");
      const response = await fetch(GAS_URL);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GAS returned ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      console.log("Data received from GAS. Keys:", Object.keys(data));
      
      const mergedData = { ...defaultStructure, ...data };
      cachedData = mergedData;
      res.json(mergedData);
    } catch (error) {
      console.error("CRITICAL: Error fetching from GAS:", error);
      if (cachedData) {
        console.log("Serving from cached data.");
        res.json(cachedData);
      } else {
        console.log("No cache available, returning default structure.");
        res.json(defaultStructure); 
      }
    }
  });

  app.post("/api/sync", async (req, res) => {
    if (!isValidUrl(GAS_URL)) {
      return res.status(500).json({ error: "VITE_GAS_API_URL is missing or invalid" });
    }

    const { type, payload } = req.body;
    console.log(`Syncing ${type}:`, payload);
    
    try {
      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, payload })
      });
      
      const text = await response.text();
      try {
        const result = JSON.parse(text);
        res.json(result);
      } catch (parseError) {
        console.error("GAS returned non-JSON response:", text.substring(0, 500));
        res.status(500).json({ 
          error: "Google Apps Script returned an invalid response (not JSON)",
          details: text.substring(0, 200)
        });
      }
    } catch (error) {
      console.error("CRITICAL: Error syncing to GAS:", error);
      res.status(500).json({ error: "Failed to sync data to Google Sheets" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
