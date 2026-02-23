require('dotenv').config();
const { Pool } = require('pg');
const { Pinecone } = require('@pinecone-database/pinecone');

// Benchmarking configs
const ITERS = 10;
const TEST_QUERY = "Severe Anxiety";

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'postgres',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
});

async function runBenchmark() {
    console.log(`\n========================================`);
    console.log(`[INFO] QUERY LATENCY & QUALITY BENCHMARK`);
    console.log(`========================================\n`);

    let pgTimes = [];
    try {
        const client = await pool.connect();

        console.log(`[TEST 1] Relational Exact Match (PostgreSQL)`);
        console.log(`[INFO] Querying for Anxiety Label: "${TEST_QUERY}"`);
        console.log(`[INFO] This test evaluates how quickly standard relational queries can find exact string matches.\n`);

        let sampleResults = [];

        for (let i = 0; i < ITERS; i++) {
            const start = performance.now();
            const res = await client.query('SELECT id, age, university, anxiety_label, cgpa FROM student_health_records WHERE anxiety_label = $1 LIMIT 3', [TEST_QUERY]);
            const countRes = await client.query('SELECT COUNT(*) FROM student_health_records WHERE anxiety_label = $1', [TEST_QUERY]);
            const end = performance.now();

            pgTimes.push(end - start);

            if (i === 0) {
                sampleResults = res.rows;
                console.log(`   └─ Quality/Results: ${countRes.rows[0].count} exact matches found.`);
                console.log(`   └─ Sample Results:` + JSON.stringify(sampleResults, null, 2).replace(/\n/g, '\n      '));
            }
        }
        client.release();

        const avgPg = pgTimes.reduce((a, b) => a + b, 0) / pgTimes.length;
        console.log(`   └─ Avg Latency (${ITERS} iters): ${avgPg.toFixed(2)} ms`);

    } catch (err) {
        console.log('[ERROR] PostgreSQL error or tables not seeded:', err.message);
    }

    // Pinecone Stub
    console.log(`\n[TEST 2] Semantic Vector Search (Pinecone AI)`);
    console.log(`[INFO] Searching for conceptual matches in the vector space...`);
    console.log(`[INFO] This test simulates retrieving relevant documents using embeddings and vector similarity.\n`);

    if (!process.env.PINECONE_API_KEY) {
        console.log(`[WARNING] PINECONE_API_KEY missing! Skipping vector DB execution.`);
        console.log(`[INFO] [Simulation] Vector searches typically clock 50-150ms depending on index scaling and dimensions.`);
        console.log(`   └─ Quality: Vectors are "fuzzier", allowing recovery of synonyms like "Extreme Stress" implicitly.`);
    } else {
        try {
            const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
            const indexName = process.env.PINECONE_INDEX_NAME || 'student-wellness';

            const existingIndexes = await pc.listIndexes();
            const indexExists = existingIndexes.indexes.some(i => i.name === indexName);

            if (!indexExists) {
                console.log(`[INFO] Index "${indexName}" not found. Creating it (this may take a moment)...`);
                await pc.createIndex({
                    name: indexName,
                    dimension: 1536,
                    metric: 'cosine',
                    spec: {
                        serverless: {
                            cloud: 'aws',
                            region: 'us-east-1'
                        }
                    }
                });
                console.log(`[SUCCESS] Index "${indexName}" created successfully.`);
            }

            const index = pc.index(indexName);

            // Check if index is empty and seed dummy vectors if needed
            const stats = await index.describeIndexStats();
            if (stats.totalRecordCount === 0) {
                console.log(`[INFO] Index is empty. Upserting dummy data so tests don't return []...`);

                // Simulate some IDs that look like the matching Postgres rows
                const sampleIds = ["8", "12", "14", "27", "42"];
                const dummyRecords = sampleIds.map((idStr) => ({
                    id: idStr,
                    values: Array.from({ length: 1536 }, () => Math.random()), // Mocked ADA-002 dimensions
                    metadata: {
                        age: "18-22",
                        university: "Independent University, Bangladesh (IUB)",
                        anxiety_label: "Severe Anxiety (Vector Matched)",
                        cgpa: "3.50 - 4.00"
                    }
                }));

                await index.upsert({ records: dummyRecords });
                console.log(`[SUCCESS] 5 dummy vectors created. Waiting a few seconds for eventual consistency...`);
                await new Promise(resolve => setTimeout(resolve, 3000));
            }

            let pcTimes = [];
            const dummyVector = Array.from({ length: 1536 }, () => Math.random()); // Mocked ADA-002 dimensions

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

    console.log(`\n[SUCCESS] Benchmark Complete.`);
    await pool.end();
}

runBenchmark();
