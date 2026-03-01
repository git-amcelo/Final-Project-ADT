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

//this module is evaluating recomputation strategy
async function runStrategy1() {
    console.log(`\n========================================`);
    console.log(`[INFO] STRATEGY 1 BENCHMARK`);
    console.log(`========================================\n`);

    const client = await pool.connect();

    // Simulated Risk Definition 1
    const w_anxiety = 0.4;
    const w_stress = 0.3;
    const w_depression = 0.3;

    try {
        let executionTimes = [];

        console.log(`[TEST 1] Full SQL Recomputation (PostgreSQL)`);
        console.log(`[INFO] Risk weights changed to [Anxiety: ${w_anxiety}, Stress: ${w_stress}, Depression: ${w_depression}].`);
        console.log(`[INFO] This test evaluates recomputing the risk score for ALL students from scratch.\n`);

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
                console.log(`   └─ Quality/Results: ${result.rows.length} top at-risk students found.`);
                console.log(`   └─ Sample Results:` + JSON.stringify(result.rows, null, 2).replace(/\n/g, '\n      '));
            }
        }

        const avgTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
        console.log(`   └─ Avg Latency (${ITERS} iters): ${avgTime.toFixed(2)} ms`);

    } catch (err) {
        console.error('[ERROR] Strategy 1 failed:', err.message);
    }

    client.release();

    // Pinecone Stub
    console.log(`\n[TEST 2] Semantic Vector Search (Pinecone AI)`);
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

runStrategy1();
