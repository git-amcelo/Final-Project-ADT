require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Pool } = require('pg');
const { Pinecone } = require('@pinecone-database/pinecone');

// 1. Initialize Postgres Client
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'postgres',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
});

// 2. Initialize Pinecone Client (Optional for running seed if keys are missing)
let pineconeIndex = null;
if (process.env.PINECONE_API_KEY) {
    try {
        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        pineconeIndex = pc.index({ name: process.env.PINECONE_INDEX_NAME || 'student-wellness' });
        console.log('[SUCCESS] Pinecone Client Initialized');
    } catch (err) {
        console.error('[WARNING] Pinecone initialization failed:', err.message);
    }
} else {
    console.log('[WARNING] PINECONE_API_KEY not found in .env. Skipping vector DB insertion for now.');
}

// 3. Parser execution
async function seedDatabase() {
    console.log('Starting seed process...');
    const results = [];
    const csvFilePath = path.join(__dirname, '..', 'Raw Data.csv');

    if (!fs.existsSync(csvFilePath)) {
        console.error(`[ERROR] CSV File not found at ${csvFilePath}`);
        process.exit(1);
    }

    // Read CSV
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            console.log(`[SUCCESS] Parsed ${results.length} rows from CSV`);

            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                console.log('Started Postgres transaction...');

                // Clear existing data (for idempotency)
                await client.query('TRUNCATE TABLE student_health_records RESTART IDENTITY CASCADE');

                let insertCount = 0;

                // Iterative Insert
                for (const row of results) {
                    const age = row['1. Age'];
                    const gender = row['2. Gender'];
                    const university = row['3. University'];
                    const department = row['4. Department'];
                    const academicYear = row['5. Academic Year'];
                    const cgpa = row['6. Current CGPA'];
                    const scholarship = row['7. Did you receive a waiver or scholarship at your university?'];
                    const anxietyScore = parseInt(row['Anxiety Value']) || 0;
                    const anxietyLabel = row['Anxiety Label'];
                    const stressScore = parseInt(row['Stress Value']) || 0;
                    const stressLabel = row['Stress Label'];
                    const depressionScore = parseInt(row['Depression Value']) || 0;
                    const depressionLabel = row['Depression Label'];

                    // Basic validation (skipping totally empty structural rows if any exist)
                    if (!age || !gender) continue;

                    const query = `
            INSERT INTO student_health_records (
              age, gender, university, department, academic_year, cgpa, scholarship,
              anxiety_score, anxiety_label, stress_score, stress_label, depression_score, depression_label
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id;
          `;

                    const values = [
                        age, gender, university, department, academicYear, cgpa, scholarship,
                        anxietyScore, anxietyLabel, stressScore, stressLabel, depressionScore, depressionLabel
                    ];

                    const res = await client.query(query, values);
                    insertCount++;

                    // VECTORD DB PUSH (Stub)
                    if (pineconeIndex) {
                        // Usually, you would embed strings here using an LLM API (e.g. OpenAI ada-002)
                        // Example:
                        // const embedding = await getEmbedding(\`Student age: \${age}, CGPA: \${cgpa}, Anxiety: \${anxietyLabel}...\`);
                        // await pineconeIndex.upsert({ records: [{ id: res.rows[0].id.toString(), values: embedding, metadata: { age, cgpa, anxietyLabel } }] });
                    }
                }

                await client.query('COMMIT');
                console.log(`[SUCCESS] Successfully seeded ${insertCount} records into PostgreSQL.`);
            } catch (err) {
                await client.query('ROLLBACK');
                console.error('[ERROR] Error during Postgres seeding:', err);
            } finally {
                client.release();
                await pool.end();
                console.log('Database connection closed.');
            }
        });
}

seedDatabase();
