require('dotenv').config();
const { Pool } = require('pg');

const ITERS = 10;

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'postgres',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
});

async function runStrategy2() {
    console.log(`\n======================================================`);
    console.log(`[INFO] STRATEGY 2: Materialized Views Maintenance`);
    console.log(`[INFO] Creates aggregate structures upfront so that reading is fast,`);
    console.log(`[INFO] but must incur a maintenance cost to refresh when logic evolves.`);
    console.log(`======================================================\n`);

    const client = await pool.connect();

    // Simulate updating a materialized view definition when the "Baseline" weights change.
    // e.g. weights: 0.5 anxiety, 0.4 stress
    const w_anxiety = 0.5;
    const w_stress = 0.4;
    const w_depression = 0.1;

    try {
        console.log(`[INFO] Scenario: Risk definition updated. Refreshing materialized structures...`);
        // Drop existing to simulate definition change DDL
        await client.query(`DROP MATERIALIZED VIEW IF EXISTS baseline_risk_scores;`);

        // Measure materialized view creation/refresh cost (Parametric change penalty)
        const mvStart = performance.now();
        await client.query(`
            CREATE MATERIALIZED VIEW baseline_risk_scores AS
            SELECT id, university,
            (anxiety_score * ${w_anxiety} + stress_score * ${w_stress} + depression_score * ${w_depression}) AS risk_score
            FROM student_health_records
            ORDER BY risk_score DESC;
        `);
        const mvEnd = performance.now();
        const refreshTime = mvEnd - mvStart;
        console.log(`   └─ Time to Recompute/Refresh View: ${refreshTime.toFixed(2)} ms`);

        console.log(`\n[INFO] Subsequent Reads from Materialized View...`);
        let readTimes = [];
        let sampleResults = [];

        for (let i = 0; i < ITERS; i++) {
            const start = performance.now();

            // Because the view is materialized, selecting is just an index/heap scan
            const result = await client.query(`
                SELECT id, university, risk_score
                FROM baseline_risk_scores
                LIMIT 5;
            `);

            const end = performance.now();
            readTimes.push(end - start);

            if (i === 0) {
                sampleResults = result.rows;
                console.log(`   └─ Sample Hit:` + JSON.stringify(sampleResults, null, 2).replace(/\n/g, '\n      '));
            }
        }

        const avgRead = readTimes.reduce((a, b) => a + b, 0) / readTimes.length;
        console.log(`   └─ Avg Read Latency (${ITERS} iters): ${avgRead.toFixed(2)} ms`);
        console.log(`[INFO] Observation: Reads are O(1) or O(N), but the initial refresh is heavy.`);

    } catch (err) {
        console.error('[ERROR] Strategy 2 failed:', err.message);
    } finally {
        // Clean up
        await client.query(`DROP MATERIALIZED VIEW IF EXISTS baseline_risk_scores;`);
        client.release();
        await pool.end();
        console.log(`\n[SUCCESS] Strategy 2 Complete.`);
    }
}

runStrategy2();
