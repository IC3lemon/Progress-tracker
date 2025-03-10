import pg from "pg";
const { Pool } = pg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  user: process.env.user,
  host: process.env.host,
  database: process.env.database,
  password: process.env.password,
  port: process.env.port
});

const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS Users (
        user_id SERIAL PRIMARY KEY,
        github_id INT UNIQUE NOT NULL,
        username VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(512),
        name VARCHAR(255),
        bio TEXT,
        location VARCHAR(255),
        company VARCHAR(255),
        blog VARCHAR(512),
        public_repos INT,
        followers INT,
        following INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS Repositories (
        repo_id SERIAL PRIMARY KEY,
        user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
        github_repo_id INT UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        stargazers_count INT,
        forks_count INT,
        open_issues_count INT,
        language VARCHAR(255),
        size INT,
        created_at TIMESTAMP,
        updated_at TIMESTAMP,
        pushed_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS Commits (
        commit_id SERIAL PRIMARY KEY,
        repo_id INT REFERENCES Repositories(repo_id) ON DELETE CASCADE,
        user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        url VARCHAR(512) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      
    `);

    console.log("Tables created successfully!");
  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    client.release();
  }
};

createTables();

export default pool;
