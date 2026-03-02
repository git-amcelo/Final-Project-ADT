# Student Wellness & Academic Success (RAG System)

This project tracks and analyzes the interplay between student mental wellness and academic success, applying modern RAG principles with PostgreSQL (Relational) and Pinecone (Vector/Semantic Database).


## Demo Run Instructions (Mid-Point Check)

### 1. Database Initialization
Ensure PostgreSQL is running locally.

**Mac Users (Homebrew):** If you encounter a `FATAL: role "postgres" does not exist` error, you might need to create the default user and database first by running this in your terminal:
```bash
createuser -s postgres
createdb postgres
```

You can then execute the init script:
```bash
psql -U postgres -f database/init.sql
```

### 2. Backend Setup & Ingestion
Navigate to \`/backend\`:
```bash
npm install
node seed.js
```

### 3. Benchmarking Relational vs. Vector Search
Execute:
```bash
node benchmark.js
```
*Note: Ensure \`.env\` is populated with \`PINECONE_API_KEY\` for vector search completion, otherwise it will simulate baseline retrieval logic.*
