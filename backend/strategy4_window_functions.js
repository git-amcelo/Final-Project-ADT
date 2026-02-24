require('dotenv').config();
const { Pool } = require('pg');
const { Pinecone } = require('@pinecone-database/pinecone');

const ITERS = 10;

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'postgres',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
});

async function runStrategy4() {
    console.log(`\n========================================`);
    console.log(`[INFO] STRATEGY 4 BENCHMARK`);
    console.log(`========================================\n`);

    const client = await pool.connect();

    // Baseline definitions
    const w_anxiety = 0.4;
    const w_stress = 0.3;
    const w_depression = 0.3;

    // Simulate changing a temporal rolling window from "last 5 records" to "last 50 records"
    const windowPrecedingRows = 50;

    try {
        let executionTimes = [];

        console.log(`[TEST 4] Advanced Window Matrix Computation (PostgreSQL)`);
        console.log(`[INFO] Structural change: Temporal aggregation window updated to "last ${windowPrecedingRows}" sequence rows.`);
        console.log(`[INFO] This test evaluates non-destructive PARTITION aggregations without redesigning materializations.\n`);

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
                console.log(`   └─ Quality/Results: ${result.rows.length} top at-risk (rolling average) students found.`);
                console.log(`   └─ Sample Results:` + JSON.stringify(result.rows, null, 2).replace(/\n/g, '\n      '));
            }
        }

        const avgTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
        console.log(`   └─ Avg Latency (${ITERS} iters): ${avgTime.toFixed(2)} ms`);

    } catch (err) {
        console.error('[ERROR] Strategy 4 failed:', err.message);
    }

    client.release();

    // Pinecone Stub
    console.log(`\n[TEST 5] Semantic Vector Search (Pinecone AI)`);
    console.log(`[INFO] Searching for conceptual matches in the vector space...`);
    console.log(`[INFO] This test simulates retrieving relevant documents using embeddings and vector similarity.\n`);

    if (!process.env.PINECONE_API_KEY) {
        console.log(`[WARNING] PINECONE_API_KEY missing! Skipping vector DB execution.`);
        console.log(`[INFO] [Simulation] Vector searches typically clock 50-150ms depending on index scaling and dimensions.`);
    } else {
        try {
            const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
            const indexName = process.env.PINECONE_INDEX_NAME || 'student-wellness';
            const index = pc.index(indexName);

            let pcTimes = [];
            const dummyVector = Array.from({ length: 1536 }, () => Math.random());

            for (let i = 0; i < ITERS; i++) {
                const start = performance.now();
                const queryResponse = await index.query({
                    vector: dummyVector,
                    topK: 3,
                    includeMetadata: true
                });
                const end = performance.now();
                pcTimes.push(end - start);

                if (i === 0) {
                    console.log(`   └─ Quality/Results: Top conceptually nearest profiles retrieved.`);
                    const formattedMatches = queryResponse.matches.map(m => {
                        return {
                            id: m.id,
                            score: `${(m.score * 100).toFixed(3)}%`,
                            ...(m.metadata || {})
                        };
                    });
                    console.log(`   └─ Vector Match Details:` + JSON.stringify(formattedMatches, null, 2).replace(/\n/g, '\n      '));
                }
            }

            const avgPc = pcTimes.reduce((a, b) => a + b, 0) / pcTimes.length;
            console.log(`   └─ Avg Latency (${ITERS} iters): ${avgPc.toFixed(2)} ms`);
        } catch (err) {
            console.error('[ERROR] Pinecone error:', err.message);
        }
    }

    await pool.end();
    console.log(`\n[SUCCESS] Benchmark Complete.`);
}

runStrategy4();
