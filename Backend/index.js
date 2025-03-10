import express from "express";
import cors from "cors";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import session from "express-session";
import pool from "./db.js";
import {
  fetchUserDetails,
  fetchUserRepos,
  fetchUserCommits,
  fetchUserPullRequests,
  fetchUserIssues,
} from "./scrape.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();

const app = express();
const port = 3000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(
  cors({
    origin: "http://localhost:3000",  
    credentials: true, // Allow cookies to be sent
  })
);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../Frontend/dist')));




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
        let user;

        const userRes = await client.query(
          "SELECT * FROM Users WHERE github_id = $1",
          [profile.id]
        );

        const githubUser = await fetchUserDetails(profile.username);

        if (userRes.rows.length === 0) {
          const newUserRes = await client.query(
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
          user = newUserRes.rows[0];
        } else {
          await client.query(
            `UPDATE Users SET 
              username = $2, avatar_url = $3, name = $4, bio = $5, location = $6, 
              company = $7, blog = $8, public_repos = $9, followers = $10, following = $11
              WHERE github_id = $1`,
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
          user = userRes.rows[0];
        }

        const repos = await fetchUserRepos(profile.username);
        for (const repo of repos) {
          const repoCheck = await client.query(
            "SELECT * FROM Repositories WHERE user_id = $1 AND github_repo_id = $2",
            [user.user_id, repo.id]
          );

          if (repoCheck.rows.length === 0) {
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
          } else {
            await client.query(
              `UPDATE Repositories SET 
                name = $3, description = $4, html_url = $5, 
                stargazers_count = $6, forks_count = $7, open_issues_count = $8, language = $9, 
                size = $10, created_at = $11, updated_at = $12, pushed_at = $13
                WHERE user_id = $1 AND github_repo_id = $2`,
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
        }

        const commits = await fetchUserCommits(profile.username);
        for (const commit of commits) {
          const commitCheck = await client.query(
            "SELECT * FROM Commits WHERE user_id = $1",
            [user.user_id]
          );

          if (commitCheck.rows.length === 0) {
            await client.query(
              `INSERT INTO Commits (repo_id, user_id, message, url, created_at)
               VALUES ($1, $2, $3, $4, $5)`,
              [
                commit.repo_id,
                user.user_id,
                commit.message,
                commit.url,
                commit.date,
              ]
            );
          }
        }

        const pullRequests = await fetchUserPullRequests(profile.username);
        for (const pr of pullRequests) {
          const prCheck = await client.query(
            "SELECT * FROM PullRequests WHERE user_id = $1 AND github_pr_id = $2",
            [user.user_id, pr.github_pr_id]
          );

          if (prCheck.rows.length === 0) {
            await client.query(
              `INSERT INTO PullRequests (repo_id, user_id, github_pr_id, title, url, state, created_at, merged_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [
                pr.repo_id,
                user.user_id,
                pr.github_pr_id,
                pr.title,
                pr.url,
                pr.state,
                pr.created_at,
                pr.merged_at,
              ]
            );
          }
        }

        const issues = await fetchUserIssues(profile.username);
        for (const issue of issues) {
          const issueCheck = await client.query(
            "SELECT * FROM Issues WHERE user_id = $1 AND github_issue_id = $2",
            [user.user_id, issue.github_issue_id]
          );

          if (issueCheck.rows.length === 0) {
            await client.query(
              `INSERT INTO Issues (repo_id, user_id, github_issue_id, title, url, state, created_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [
                issue.repo_id,
                user.user_id,
                issue.github_issue_id,
                issue.title,
                issue.url,
                issue.state,
                issue.created_at,
              ]
            );
          }
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
    res.cookie("token", req.user.token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      path: "/",  
    });
    console.log("Token set in cookie: " + " "+req.user.token)
    res.redirect("http://localhost:3000/dashboard");
  }
);

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/user')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../Frontend/dist', 'index.html'));
});




app.get("/user/repos", async (req, res) => {
  try {
    const token = req.cookies.token; 
    console.log("Token is: "+token)
    if (!token) {
      console.log("Error hai bhai")
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const client = await pool.connect();
    const repos = await client.query(
      "SELECT * FROM Repositories WHERE user_id = $1",
      [decoded.userId]
    );
    client.release();

    res.json(repos.rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("http://localhost:3000/login");
});

app.listen(port, () => {
  console.log(`Server running on ${port}`);
  
});

