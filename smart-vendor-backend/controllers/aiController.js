const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

// Initialize Google Generative AI with your key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// This schema gives the AI crucial context about your database structure.
const DB_SCHEMA = `
You are an expert MySQL assistant. Generate a raw SQL query based on a user's question about their financial data.

TABLES:
1. "transactions":
   - id (char(36), primary key)
   - user_id (char(36), foreign key)
   - amount (decimal(10,2))
   - date (date)
   - description (text)
   - category (text)
   - type (text, can be 'income', 'expense', or 'investment')
   - subcategory (text, nullable)

RULES:
- Today's date is ${new Date().toISOString().split('T')[0]}.
- You MUST filter every query by the user_id provided in the prompt.
- ✅ IMPORTANT: The user_id is a string and MUST be enclosed in single quotes in the WHERE clause. For example: WHERE user_id = 'some-uuid-string'.
- The output MUST be ONLY the raw SQL query. Do not include any explanations, comments, or markdown like \`\`\`sql.
- For summary queries (e.g., 'top expenses'), name the result columns 'name' for categories/descriptions and 'value' for amounts.
`;

/**
 * @route   POST /api/ai/generate-sql
 * @desc    Generates SQL from a question, saving/updating it in the history.
 */
exports.generateSql = async (req, res) => {
  const { question } = req.body;
  const userId = req.user.userId; // From authMiddleware

  if (!question) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  try {
    // Check if this question was asked before by the user
    const [existing] = await db.query('SELECT * FROM queries WHERE user_id = ? AND question = ?', [userId, question]);

    if (existing.length > 0) {
      // If it exists, update usage and return the stored SQL
      const prompt = existing[0];
      await db.query('UPDATE queries SET usage_count = usage_count + 1, last_used_at = CURRENT_TIMESTAMP WHERE id = ?', [prompt.id]);
      return res.json({ sql: prompt.sql_query });
    }

    // If it's a new question, generate SQL using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const fullPrompt = `${DB_SCHEMA}\n\nUser Question: "${question}"\nUser ID: "${userId}"`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const sqlQuery = response.text().replace(/```sql/g, '').replace(/```/g, '').trim();

    // Save the new query to the database
    const newQueryId = uuidv4();
    await db.query('INSERT INTO queries (id, user_id, question, sql_query) VALUES (?, ?, ?, ?)', [newQueryId, userId, question, sqlQuery]);
    
    res.json({ sql: sqlQuery });

  } catch (error) {
    console.error('[ERROR] AI SQL Generation Failed:', error);
    res.status(500).json({ error: 'Failed to generate SQL query.' });
  }
};

/**
 * @route   POST /api/ai/execute-sql
 * @desc    Safely executes a provided SQL query.
 */
exports.executeQuery = async (req, res) => {
    const { sqlQuery } = req.body;
    const userId = req.user.userId;

    if (!sqlQuery) {
        return res.status(400).json({ error: 'SQL query is required.' });
    }

    // Basic security: only allow SELECT statements and ensure it contains the user's ID
    if (!sqlQuery.trim().toUpperCase().startsWith('SELECT') || !sqlQuery.includes(userId)) {
        return res.status(403).json({ error: 'Forbidden: Only authorized SELECT queries are allowed.' });
    }

    try {
        const [results] = await db.query(sqlQuery);
        res.json({ data: results });
    } catch (error) {
        console.error('[ERROR] SQL Execution Failed:', error.message);
        res.status(500).json({ error: 'Failed to execute query.' });
    }
};

/**
 * @route   GET /api/ai/history
 * @desc    Fetches the user's 10 most recent AI queries.
 */
exports.getHistory = async (req, res) => {
    const userId = req.user.userId;
    try {
        const [history] = await db.query(
            'SELECT * FROM queries WHERE user_id = ? ORDER BY last_used_at DESC LIMIT 10',
            [userId]
        );
        res.json({ history });
    } catch (error) {
        console.error('[ERROR] Failed to fetch AI history:', error);
        res.status(500).json({ error: 'Failed to fetch history.' });
    }
};
