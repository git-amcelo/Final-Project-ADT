/**
 * @author Hemit Rana
 * @date 2026-02-22
 * @description This script initializes the relational schema and indexes for student health records.
 */

CREATE TABLE IF NOT EXISTS student_health_records (
    id SERIAL PRIMARY KEY,
    age VARCHAR(255),
    gender VARCHAR(255),
    university VARCHAR(255),
    department VARCHAR(255),
    academic_year VARCHAR(255),
    cgpa VARCHAR(255),
    scholarship VARCHAR(255),
    anxiety_score INT,
    anxiety_label VARCHAR(255),
    stress_score INT,
    stress_label VARCHAR(255),
    depression_score INT,
    depression_label VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_cgpa ON student_health_records (cgpa);
CREATE INDEX IF NOT EXISTS idx_anxiety ON student_health_records (anxiety_score);
CREATE INDEX IF NOT EXISTS idx_stress ON student_health_records (stress_score);
CREATE INDEX IF NOT EXISTS idx_depression ON student_health_records (depression_score);