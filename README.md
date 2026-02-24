# Student Wellness & Academic Success (RAG System)

This project tracks and analyzes the interplay between student mental wellness and academic success, applying modern RAG principles with PostgreSQL (Relational) and Pinecone (Vector/Semantic Database).

## Mid-Project Evaluation TBS (Task Breakdown Structure) - 7 Members

| Task ID | Task Description | Assignee | Status | Dependencies | Evaluation / Demo Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Database Schema & Relational Modeling | **Member 1** | Completed | None | ER Schema and normalized script `database/init.sql` |
| **2** | Data Cleaning & Ingestion Scripting | **Member 2** | Completed | Task 1 | `backend/seed.js` securely digests `Raw Data.csv` |
| **3** | GitHub Setup & Version Control | **Member 3** | Completed | None | The repository setup, branches, and commit tracking initialized |
| **4** | Vector DB (Pinecone) Configuration | **Member 4** | Completed | Task 2 | Configured Pinecone cluster, embedded keys, and logic |
| **5** | Query Optimization & Benchmarking | **Member 5** | Completed | Task 1, 4 | Executed `strategy_1...4.js` proving Postgres vs Pinecone latency |
| **6** | Backend API & Router Initialization | **Member 6** | Completed | Task 1, 5 | REST API in `server.js` exposing the benchmark executions |
| **7** | Dynamic Dashboard Initialization | **Member 7** | Completed | Task 6 | Built `dashboard/` with React/Vite/GSAP mapping execution feeds |


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
