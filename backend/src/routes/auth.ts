import { Router } from "express";
import { prisma } from '../prisma.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { authMiddleware } from "../middleware/auth.js";
const router = Router();

//signup route
router.post("/register",async (req,res)=>{
  const {username,email,password} =req.body;

  if(!username || !email || !password){
    res.status(400).json({
      message:"mandatory fields not filled"
    })
    return
  }

  const exists = await prisma.user.findFirst({
    where:{
      OR:[{email},{username}]
    }
  })

  if(exists){
    const field = exists.email == email ? 'Email':'Username'
    res.status(409).json({error: `${field} already exists`})
    return
  }

  const passwordHash  = await bcrypt.hash(password,12) 

  const user = await prisma.user.create({
    data:{username,email,passwordHash},
    select:{id:true,username:true,email:true,rating:true,rank:true,createdAt:true}
  })

  const token = jwt.sign(
    {userId: user.id},
    process.env.JWT_SECRET!)
  
  res.json({token,user})
})


//login route
router.post("/login",async (req,res)=>{
  const {identifier,password} = req.body

  if(!identifier || !password){
    res.status(400).json({
      message:"email/usuername & password required"
    })
    return
  }

  const user =await prisma.user.findFirst({
    where:{OR:[
      {email:identifier},{username:identifier}
    ]}
  })
  
  
  if(!user || !await bcrypt.compare(password,user.passwordHash)){
    res.status(401).json({
      error:"Invalid Credentials"
    })
    return
  }

  const token = jwt.sign({userId:user.id},process.env.JWT_SECRET!)

  const {passwordHash,...safeUser} =user
  res.json({token,safeUser})
})

//fetch user data
router.get("/me",authMiddleware,async (req,res)=>{
  const user = await prisma.user.findUnique({
    where:{id: req.userId},
    select:{
      id:true,username:true,email:true,
      rating:true,maxRating:true,rank:true,
      country:true,avatar:true,createdAt:true,
    },
  })
  if(!user){
    res.status(404).json({error:"User not found"})
    return
  }

  res.json(user)
})

export default router

