import { Router } from "express";
import { prisma } from '../prisma.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
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
    const field = exists.email ? 'Email':'Username'
    res.status(409).json({error: `${field} already exists`})
    return
  }

  const passwordHash  = await bcrypt.hash(password,12) 

  const user = await prisma.user.create({
    data:{username,email,passwordHash},
    select:{id:true,username:true,email:true,password:true,rating:true,rank:true,createdAt:true}
  })

  const token = jwt.sign(
    {userId: user.id},
    process.env.JWT_SECRET!)
  
  res.json({token,user})
})


//login route
router.post("/login",(req,res)=>{
  const {identifier,password} = req.body

  if(!identifier || !password){
    res.status(400).json({
      message:"wrong credentials"
    })
    return
  }

  const user = prisma.user.findFirst({
    where:{OR:[
      {email:identifier},{username:identifier}
    ]}
  })
})


router.get("/me",(req,res)=>{

})

export default router
















// import { Router, Request, Response } from 'express'
// import bcrypt from 'bcryptjs'
// import jwt from 'jsonwebtoken'
// import { prisma } from '../prisma.js'
// import { authMiddleware } from '../middleware/auth.js'

// const router = Router()

// router.post('/register', async (req: Request, res: Response) => {
//   const { username, email, password } = req.body

//   if (!username || !email || !password) {
//     res.status(400).json({ error: 'username, email and password are required' })
//     return
//   }

//   const existing = await prisma.user.findFirst({
//     where: { OR: [{ email }, { username }] },
//   })

//   if (existing) {
//     const field = existing.email === email ? 'Email' : 'Username'
//     res.status(409).json({ error: `${field} already in use` })
//     return
//   }

//   const passwordHash = await bcrypt.hash(password, 12)

//   const user = await prisma.user.create({
//     data: { username, email, passwordHash },
//     select: { id: true, username: true, email: true, rating: true, rank: true, createdAt: true },
//   })

//   const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' })

//   res.status(201).json({ token, user })
// })

// router.post('/login', async (req: Request, res: Response) => {
//   const { login, password } = req.body

//   if (!login || !password) {
//     res.status(400).json({ error: 'login and password are required' })
//     return
//   }

//   const user = await prisma.user.findFirst({
//     where: { OR: [{ email: login }, { username: login }] },
//   })

//   if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
//     res.status(401).json({ error: 'Invalid credentials' })
//     return
//   }

//   const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' })

//   const { passwordHash, ...safeUser } = user
//   res.json({ token, user: safeUser })
// })

// router.get('/me', authMiddleware, async (req: Request, res: Response) => {
//   const user = await prisma.user.findUnique({
//     where: { id: req.userId },
//     select: {
//       id: true, username: true, email: true,
//       rating: true, maxRating: true, rank: true,
//       country: true, avatar: true, createdAt: true,
//     },
//   })

//   if (!user) {
//     res.status(404).json({ error: 'User not found' })
//     return
//   }

//   res.json(user)
// })

// export default router
