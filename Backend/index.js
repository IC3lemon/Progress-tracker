import express from "express";
import cors from "cors";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import session from "express-session";  // Import express-session
import pool from "./db.js";
import { fetchUserDetails, fetchUserRepos } from "./scrape.js";

dotenv.config();

const app = express();
const port = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "Crytoniteisworstsp";

app.use(cors());
app.use(express.json());


app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false, 
  saveUninitialized: false, 
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport serialization/deserialization
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://127.0.0.1:3000/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const client = await pool.connect();
        const userRes = await client.query(
          "SELECT * FROM Users WHERE github_id = $1",
          [profile.id]
        );

        let user;
        if (userRes.rows.length === 0) {
          const githubUser = await fetchUserDetails(profile.username);
          const newUser = await client.query(
            `INSERT INTO Users (
              github_id, username, avatar_url, name, bio, location, 
              company, blog, public_repos, followers, following
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [
              profile.id,
              profile.username,
              profile.photos[0].value,
              profile.displayName || "",
              profile._json.bio || "",
              profile._json.location || "",
              profile._json.company || "",
              profile._json.blog || "",
              profile._json.public_repos,
              profile._json.followers,
              profile._json.following,
            ]
          );
          user = newUser.rows[0];

          const repos = await fetchUserRepos(profile.username);
          for (const repo of repos) {
            await client.query(
              `INSERT INTO Repositories (
                user_id, github_repo_id, name, description, html_url,
                stargazers_count, forks_count, open_issues_count, language,
                size, created_at, updated_at, pushed_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
              [
                user.user_id,
                repo.id,
                repo.name,
                repo.description,
                repo.html_url,
                repo.stargazers_count,
                repo.forks_count,
                repo.open_issues_count,
                repo.language,
                repo.size,
                repo.created_at,
                repo.updated_at,
                repo.pushed_at,
              ]
            );
          }
        } else {
          user = userRes.rows[0];
        }

        const token = jwt.sign({ userId: user.user_id }, JWT_SECRET);
        client.release();
        return done(null, { token, user });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect(`http://localhost:3000/dashboard?token=${req.user.token}`);
  }
);

app.get("/user/repos", async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const client = await pool.connect();
    const repos = await client.query(
      "SELECT * FROM Repositories WHERE user_id = $1",
      [decoded.userId]
    );
    client.release();

    res.json(repos.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});

