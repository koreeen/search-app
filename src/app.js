import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.static("public"));

app.get("/api/search", async (req, res) => {
    try {
        const query = (req.query.q || "").trim();
        const apiKey = process.env.SERPAPI_KEY;

        if (!query) {
            return res.status(400).json({ error: "Query is required" });
        }

        if (query.length > 100) {
            return res.status(400).json({ error: "Query too long (max 100 chars)" });
        }

        if (/[<>]/.test(query)) {
            return res.status(400).json({ error: "Invalid characters in query" });
        }

        if (!apiKey) {
            return res.status(500).json({ error: "Missing SERPAPI_KEY" });
        }

        const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&num=10&api_key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ error: data.error });
        }

        const results = (data.organic_results || [])
            .slice(0, 10)
            .map(item => ({
                title: item.title,
                link: item.link,
                snippet: item.snippet || item.description
            }));

        res.json(results);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default app;

if (process.env.NODE_ENV !== "test") {
    app.listen(3000, () => console.log("http://localhost:3000"));
}
