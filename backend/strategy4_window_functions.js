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

async function runStrategy4() {
    console.log(`\n======================================================`);
    console.log(`[INFO] STRATEGY 4: Window-Function-Centric Plan`);
    console.log(`[INFO] Uses SQL Window Functions (OVER / PARTITION BY) instead`);
    console.log(`[INFO] of GROUP BY aggregations, isolating structural changes `);
    console.log(`[INFO] like temporal window adjustments (e.g., 6mo to 12mo rolling).`);
    console.log(`======================================================\n`);

    const client = await pool.connect();

    // Baseline definitions
    const w_anxiety = 0.4;
    const w_stress = 0.3;
    const w_depression = 0.3;

    // Simulate changing a temporal rolling window from "last 5 records" to "last 50 records"
    const windowPrecedingRows = 50;

    try {
        let executionTimes = [];

        console.log(`[INFO] Scenario: Risk definition structural change.`);
        console.log(`[INFO] The temporal aggregation window is updated from "last 5" to "last ${windowPrecedingRows}" records.`);

        for (let i = 0; i < ITERS; i++) {
            const start = performance.now();

            // Using standard Window function aggregation so we don't have to redesign materializations 
            // when the moving average structural bounds change dynamically.
            const result = await client.query(`
                SELECT id, university,
                AVG(anxiety_score::numeric * $1::numeric + stress_score::numeric * $2::numeric + depression_score::numeric * $3::numeric) 
                OVER(
                    PARTITION BY university 
                    ORDER BY id 
                    ROWS BETWEEN $4::int PRECEDING AND CURRENT ROW
                ) AS rolling_risk_score
                FROM student_health_records
                ORDER BY rolling_risk_score DESC
                LIMIT 5;
            `, [w_anxiety, w_stress, w_depression, windowPrecedingRows]);

            const end = performance.now();
            executionTimes.push(end - start);

            if (i === 0) {
                console.log(`   └─ Sample Top 5 At-Risk (Rolling Average):` + JSON.stringify(result.rows, null, 2).replace(/\n/g, '\n      '));
            }
        }

        const avgTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
        console.log(`   └─ Avg Latency (${ITERS} iters): ${avgTime.toFixed(2)} ms`);

    } catch (err) {
        console.error('[ERROR] Strategy 4 failed:', err.message);
    } finally {
        client.release();
        await pool.end();
        console.log(`\n[SUCCESS] Strategy 4 Complete.`);
    }
}

runStrategy4();
