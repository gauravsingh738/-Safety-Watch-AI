// server.js (Node.js/Express)
const express = require('express');
const axios = require('axios');
const app = express();

app.post('/api/analyze', async (req, res) => {
    const { city, lat, lon } = req.body;

    try {
        // 1. Fetch Real-time GDELT Data
        const gdeltUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=(crime OR safety) "${city}"&mode=artlist&format=json`;
        const news = await axios.get(gdeltUrl).catch(() => ({ data: { articles: [] } }));

        // 2. LLM Inference (Conceptual)
        // Here, the LLM processes the city name against a pre-loaded NCRB dataset 
        // to determine historical risk weightings.
        const aiResponse = await callLLM({
            prompt: `Based on NCRB 2024 Crime in India data and these recent GDELT articles: ${JSON.stringify(news.data)}, 
                     calculate a safety score and one-sentence advice for ${city}.`,
            temperature: 0.2
        });

        res.json({
            score: aiResponse.score, // 0-100
            advice: aiResponse.text,
            ncrb_tier: aiResponse.historical_category
        });
    } catch (err) {
        res.status(500).send("AI Engine Timeout");
    }
});