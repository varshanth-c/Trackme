const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- Initialization ---
const app = express();
const PORT = process.env.PORT;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Middleware ---
app.use(cors()); // Allow requests from your frontend
app.use(express.json());

// --- Database Schema Definition ---
// This is crucial for giving the AI context about your database.
const DB_SCHEMA = `
You will be acting as an expert PostgreSQL assistant. Your task is to generate a SQL query based on a user's question about their financial data.

Here are the schemas for the relevant tables:

1. Table "transactions":
   - id (uuid, primary key)
   - user_id (uuid, foreign key)
   - amount (numeric)
   - date (date)
   - description (text)
   - category (text)
   - type (text, can be 'income' or 'expense')
   - subcategory (text, nullable)
   - notes (text, nullable)
   - created_at (timestamp with time zone)
   - updated_at (timestamp with time zone)

When generating queries:
- Today's date is ${new Date().toISOString().split('T')[0]}.
- Always filter by the user_id. For this task, assume the user_id is '00000000-0000-0000-0000-000000000000'. You MUST replace this with the actual user_id provided in the prompt.
- Ensure the output is ONLY the raw SQL query. Do not include any explanations, comments, markdown like \`\`\`sql, or any other text.
- For queries asking for summaries (e.g., 'top expenses', 'total income'), the result columns should be named appropriately for charting, like 'name' for categories/descriptions and 'value' for amounts.
`;


// --- API Endpoint ---
app.post('/api/generate-sql', async (req, res) => {
    const { question, userId } = req.body;

    if (!question || !userId) {
        return res.status(400).json({ error: 'Question and userId are required.' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Construct the final prompt
        const prompt = `
        ${DB_SCHEMA}

        User Question: "${question}"
        User ID: "${userId}"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let sqlQuery = response.text();

        // Clean the response to ensure it's only the SQL query
        sqlQuery = sqlQuery.replace(/```sql/g, '').replace(/```/g, '').trim();

        console.log(`[INFO] Generated SQL for user ${userId}: ${sqlQuery}`);

        res.json({ sql: sqlQuery });

    } catch (error) {
        console.error('[ERROR] Error calling Gemini API:', error);
        res.status(500).json({ error: 'Failed to generate SQL query.' });
    }
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`AI-SQL server is running on http://localhost:${PORT}`);
});