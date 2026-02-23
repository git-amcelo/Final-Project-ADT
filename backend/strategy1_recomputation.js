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

async function runStrategy1() {
    console.log(`\n======================================================`);
    console.log(`[INFO] STRATEGY 1: Full SQL Recomputation`);
    console.log(`[INFO] This strategy recomputes the risk score for ALL students `);
    console.log(`[INFO] from scratch whenever the risk definition weights change.`);
    console.log(`======================================================\n`);

    const client = await pool.connect();

    // Simulated Risk Definition 1
    const w_anxiety = 0.4;
    const w_stress = 0.3;
    const w_depression = 0.3;

    try {
        let executionTimes = [];

        console.log(`[INFO] Scenario: Risk weights changed to [Anxiety: ${w_anxiety}, Stress: ${w_stress}, Depression: ${w_depression}]`);
        console.log(`[INFO] Recomputing full dataset...`);

        for (let i = 0; i < ITERS; i++) {
            const start = performance.now();

            // Full table scan to compute risk score dynamically
            const result = await client.query(`
                SELECT id, university,
                (anxiety_score::numeric * $1::numeric + stress_score::numeric * $2::numeric + depression_score::numeric * $3::numeric) AS risk_score
                FROM student_health_records
                ORDER BY risk_score DESC
                LIMIT 5;
            `, [w_anxiety, w_stress, w_depression]);

            const end = performance.now();
            executionTimes.push(end - start);

            if (i === 0) {
                console.log(`   └─ Sample Top 5 At-Risk Students:` + JSON.stringify(result.rows, null, 2).replace(/\n/g, '\n      '));
            }
        }

        const avgTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
        console.log(`   └─ Avg Latency (${ITERS} iters): ${avgTime.toFixed(2)} ms`);

    } catch (err) {
        console.error('[ERROR] Strategy 1 failed:', err.message);
    } finally {
        client.release();
        await pool.end();
        console.log(`\n[SUCCESS] Strategy 1 Complete.`);
    }
}

runStrategy1();
