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
  fetchUserRepos
} from "./scrape.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();

const app = express();
const port = 3000;
const JWT_SECRET = process.env.JWT_SECRET;
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",  
    credentials: true, // Allow cookies to be sent
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
        console.log(profile)

        const githubUser = await fetchUserDetails(profile.username);

        if (userRes.rows.length === 0) {
          const newUserRes = await client.query(
            `INSERT INTO Users (
              github_id, username, avatar_url, name, bio, location, 
              company, blog, public_repos, followers, following,created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
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
              githubUser.created_at
            ]
          );
          user = newUserRes.rows[0];
        } else {
          await client.query(
            `UPDATE Users SET 
              username = $2, avatar_url = $3, name = $4, bio = $5, location = $6, 
              company = $7, blog = $8, public_repos = $9, followers = $10, following = $11,created_at = $12
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
              githubUser.created_at
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
                user_id, github_repo_id, name, description,
                stargazers_count, forks_count, open_issues_count, language,
                size, created_at, updated_at, pushed_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
              [
                user.user_id,
                repo.id,
                repo.name,
                repo.description,
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

        // const commits = await fetchUserCommits(profile.username);
        // for (const commit of commits) {
        //   const commitCheck = await client.query(
        //     "SELECT * FROM Commits WHERE user_id = $1",
        //     [user.user_id]
        //   );

        //   if (commitCheck.rows.length === 0) {
        //     await client.query(
        //       `INSERT INTO Commits (repo_id, user_id, message, url, created_at)
        //        VALUES ($1, $2, $3, $4, $5)`,
        //       [
        //         commit.repo_id,
        //         user.user_id,
        //         commit.message,
        //         commit.url,
        //         commit.date,
        //       ]
        //     );
        //   }
        // }

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
      secure: true,
      sameSite: "None",
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

app.get("/user/details", async (req, res) => {
  try {
    const token = req.cookies.token; 
    console.log("Token is: " + token);
    
    if (!token) {
      console.log("Error: No token provided");
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.error("Token verification failed:", err.message);
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    const client = await pool.connect();
    try {
      const user = await client.query(
        "SELECT * FROM Users WHERE user_id = $1",
        [decoded.userId]
      );
      res.json(user.rows || []);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error fetching repositories:", err.message);
    res.status(500).json({ error: err.message });
  }
});




app.get("/user/repos", async (req, res) => {
  try {
    const token = req.cookies.token; 
    console.log("Token is: " + token);
    
    if (!token) {
      console.log("Error: No token provided");
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.error("Token verification failed:", err.message);
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    const client = await pool.connect();
    try {
      const repos = await client.query(
        "SELECT * FROM Repositories WHERE user_id = $1",
        [decoded.userId]
      );
      res.json(repos.rows || []);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error fetching repositories:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/user/commits", async (req, res) => {
  try {
    const token = req.cookies.token; 
    console.log("Token is: " + token);
    
    if (!token) {
      console.log("Error: No token provided");
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.error("Token verification failed:", err.message);
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    const client = await pool.connect();
    try {
      const commits = await client.query(
        "SELECT * FROM Commits WHERE user_id = $1",
        [decoded.userId]
      );
      res.json(commits.rows || []);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error fetching repositories:", err.message);
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

