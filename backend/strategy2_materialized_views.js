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

async function runStrategy2() {
    console.log(`\n========================================`);
    console.log(`[INFO] STRATEGY 2 BENCHMARK`);
    console.log(`========================================\n`);

    const client = await pool.connect();

    // Simulate updating a materialized view definition when the "Baseline" weights change.
    // e.g. weights: 0.5 anxiety, 0.4 stress
    const w_anxiety = 0.5;
    const w_stress = 0.4;
    const w_depression = 0.1;

    try {
        console.log(`[TEST 2] Materialized Views Maintenance`);
        console.log(`[INFO] Risk definition updated... Refreshing materialized structures.`);
        console.log(`[INFO] This test evaluates the cost of refreshing precomputed aggregates when logic evolves.\n`);
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

        console.log(`\n[INFO] Subsequent O(1) Reads from Materialized View...`);
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
                console.log(`   └─ Quality/Results: ${sampleResults.length} records retrieved from view.`);
                console.log(`   └─ Sample Results:` + JSON.stringify(sampleResults, null, 2).replace(/\n/g, '\n      '));
            }
        }

        const avgRead = readTimes.reduce((a, b) => a + b, 0) / readTimes.length;
        console.log(`   └─ Avg Read Latency (${ITERS} iters): ${avgRead.toFixed(2)} ms`);
        console.log(`\n[INFO] Observation: Reads are fast, but the initial refresh DDL is heavy.`);

    } catch (err) {
        console.error('[ERROR] Strategy 2 failed:', err.message);
    }

    // Clean up
    await client.query(`DROP MATERIALIZED VIEW IF EXISTS baseline_risk_scores;`);
    client.release();

    // Pinecone Stub
    console.log(`\n[TEST 3] Semantic Vector Search (Pinecone AI)`);
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

runStrategy2();
