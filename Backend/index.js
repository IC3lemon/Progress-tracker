import express from "express"
const port = 3000
const app = express()
import Router from "./routes"
import passport from "passport"
import { Strategy as GitHubStrategy } from "passport-github2";
import jwt from "jsonwebtoken"
JWT_SECRET="Crytoniteisworstsp"
import axios from "axios"
// app.use("/api/auth",Router)

app.use(cors())
app.use(express.json())

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/github/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
        let user = //Yaha par db query likh dena ki agar pehle user exist karta tha kya using progile.id

        if (user.rows.length === 0) {
          user = //yaha par new user add karne ki query likh dena;
        }

        const token = jwt.sign({ userId: user.rows[0].id },JWT_SECRET);
        await storeData(profile.username, accessToken);
        return done(null, { token, user: user.rows[0] });
      } catch (err) {
        return done(err, null);
      }
  }
));

app.get('/auth/github',passport.authenticate('github', { scope: [ 'user:email' ] }));

app.get('/auth/github/callback', 
    passport.authenticate('github', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect(`http://localhost:3000/dashboard?token=${req.user.token}`);
    }
);

app.get("/user/repos", async (req, res) => {
    //Query for fetching from database 
});

app.get("/repo/:repoId/commits", async (req, res) => {

});

async function storeData(username, accessToken) {
    try {
      const repos = await axios.get(`https://api.github.com/users/${username}/repos`, {
        headers: { Authorization: `token ${accessToken}` },
      });
  
      for (const repo of repos.data) {
        //Yaha par fetching ki query likh dena
      }
    } catch (err) {
      console.error("Nigga coding kar.");
    }
  }

app.listen(port,()=>{
    console.log(`Server running on ${port}`)
})


