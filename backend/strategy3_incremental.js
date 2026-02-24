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

async function runStrategy3() {
    console.log(`\n========================================`);
    console.log(`[INFO] STRATEGY 3 BENCHMARK`);
    console.log(`========================================\n`);

    const client = await pool.connect();

    // Baseline weights
    const old_w_anxiety = 0.4;
    const old_w_stress = 0.3;
    const old_w_depression = 0.3;

    // Simulate parametric definition change: Only Stress weight changes
    const new_w_stress = 0.5;

    try {
        console.log(`[INFO] Step 1: Pre-computing initial Risk State table (one-time setup)`);
        await client.query(`DROP TABLE IF EXISTS precalc_risk_state;`);
        await client.query(`
            CREATE TABLE precalc_risk_state AS
            SELECT id, university,
            (anxiety_score * ${old_w_anxiety} + stress_score * ${old_w_stress} + depression_score * ${old_w_depression}) AS risk_score
            FROM student_health_records;
        `);

        // Delta for stress
        const delta_stress = new_w_stress - old_w_stress;

        console.log(`[TEST 3] Incremental Dependency Graph Delta (PostgreSQL)`);
        console.log(`[INFO] Risk definition updated... Stress weight changed from ${old_w_stress} to ${new_w_stress}.`);
        console.log(`[INFO] This test evaluates calculating ONLY the parameter delta (+${delta_stress.toFixed(1)}) instead of recomputing everything.\n`);

        const startUpdate = performance.now();

        // This simulates delta-based incremental maintenance over stable subexpressions
        await client.query(`
            UPDATE precalc_risk_state prs
            SET risk_score = risk_score + (shr.stress_score::numeric * $1::numeric)
            FROM student_health_records shr
            WHERE prs.id = shr.id;
        `, [delta_stress]);

        const endUpdate = performance.now();
        console.log(`   └─ Time to update ONLY affected parameter (Incremental Sync Latency): ${(endUpdate - startUpdate).toFixed(2)} ms`);

        console.log(`\n[INFO] Subsequent Reads from Incremental Setup...`);
        let readTimes = [];
        let sampleResults = [];

        for (let i = 0; i < ITERS; i++) {
            const start = performance.now();

            const result = await client.query(`
                SELECT id, university, risk_score
                FROM precalc_risk_state
                ORDER BY risk_score DESC
                LIMIT 5;
            `);

            const end = performance.now();
            readTimes.push(end - start);

            if (i === 0) {
                sampleResults = result.rows;
                console.log(`   └─ Quality/Results: ${sampleResults.length} records retrieved after incremental sync.`);
                console.log(`   └─ Sample Results:` + JSON.stringify(sampleResults, null, 2).replace(/\n/g, '\n      '));
            }
        }

        const avgRead = readTimes.reduce((a, b) => a + b, 0) / readTimes.length;
        console.log(`   └─ Avg Read Latency (${ITERS} iters): ${avgRead.toFixed(2)} ms`);

    } catch (err) {
        console.error('[ERROR] Strategy 3 failed:', err.message);
    }

    await client.query(`DROP TABLE IF EXISTS precalc_risk_state;`);
    client.release();

    // Pinecone Stub
    console.log(`\n[TEST 4] Semantic Vector Search (Pinecone AI)`);
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

runStrategy3();
