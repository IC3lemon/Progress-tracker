import express from express
const Router = express.Router
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


Router.post("/signup",async (req,res)=>{
    const {username,email,password} = req.body


})

Router.post("/signin",async (req,res)=>{
    const {username,email,password} = req.body

    
})



export default Router


///Leave this pageeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee