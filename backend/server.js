/**
 * @author Sarvesh Solanke
 * @date 2026-02-28
 * @description create Express REST API with search and benchmark endpoints
 */


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// PostgreSQL Pool
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'postgres',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
});

// Mock/Proxy endpoint representing the semantic vector search integration
app.get('/api/search', async (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter "q" is required.' });
    }

    try {
        const client = await pool.connect();

        // Simulate Vector RAG concept by using basic ILIKE search against Postgres for mid-project demo
        // Wait for the full vector DB index to be built by Member 4
        const sqlQuery = `
      SELECT id, age, university, department, cgpa, anxiety_label, stress_label, depression_label
      FROM student_health_records
      WHERE
        anxiety_label ILIKE $1
        OR stress_label ILIKE $1
        OR depression_label ILIKE $1
      LIMIT 10;
    `;

        const { rows } = await client.query(sqlQuery, [`%${query}%`]);
        client.release();

        res.json({
            success: true,
            message: 'Data successfully retrieved via simulated RAG interface.',
            data: rows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database connection error. Run init.sql and seed.js first!' });
    }
});

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const scriptsMap = {
    0: 'strategy1_recomputation.js',
    1: 'strategy2_materialized_views.js',
    2: 'strategy3_incremental.js',
    3: 'strategy4_window_functions.js'
};

app.get('/api/run/:strategyId', async (req, res) => {
    const { strategyId } = req.params;
    const script = scriptsMap[strategyId];

    if (!script) {
        return res.status(400).json({ error: 'Invalid strategy ID.' });
    }

    try {
        const { stdout, stderr } = await execPromise(`node ${script}`, { cwd: __dirname });
        res.json({ success: true, output: stdout });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message, output: err.stdout || err.stderr });
    }
});

app.listen(PORT, () => {
    console.log(`[INFO] Wellness RAG Backend running at http://localhost:${PORT}`);
    console.log(`UI Dashboard is accessible directly via the root route.`);
});
