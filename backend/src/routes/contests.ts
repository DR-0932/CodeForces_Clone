import { Router } from 'express'
import {prisma} from "../prisma.js"
import { authMiddleware } from '../middleware/auth.js'

const router = Router()



router.get("/", async (req,res)=>{
  const contests = await prisma.contest.findMany({
    orderBy:{startTime:'asc'},
    include:{
      createdby:{select:{username:true}},
    },
  })
  res.json(contests)
})

router.get("/:id", async (req,res)=>{
  const id = parseInt(req.params.id)

  const contest = await prisma.contest.findUnique({
    where:{id:id},
    include:{
      problems:{
        orderBy:{orderIndex:'asc'},
        include:{
          problem:{select:{title:true,code:true,difficulty:true}},
        },
      },
      createdby:{select:{username:true}},
    },  
  })

  if(!contest){
    res.status(404).json({error:"contest not found"})
    return
  }
  res.json(contest)
})

router.post("/", authMiddleware, async (req,res)=>{
  const {title,description,startTime,endTime,type} = req.body

  if(!title || !startTime || !endTime){
    res.status(400).json({
      error:"title,start Time and end Time are required"
    })
    return
  }
  if(new Date(endTime)<= new Date(startTime)){
    res.status(400).json({
      error:'end time must be greater than start time'
    })
    return
  }

  const contest = await prisma.contest.create({
    data:{
      title,
      description,
      startTime:new Date(startTime),
      endTime: new Date(endTime),
      type: type ?? 'ICPC',
      createdById:req.userId!
    },
  })
  res.status(201).json(contest)
})


// registering for a contest
router.post("/:id/register",authMiddleware, async (req,res)=>{
  const contestId = parseInt(req.params.id)
  const userId = req.userId!

  const contest =await prisma.contest.findUnique({
    where:  { id: contestId}
  })
  if(!contest){
    res.status(404).json({error:"Contest not found"})
    return
  }

  const exists = await prisma.contestRegistration.findUnique({
    where: {contestId_userId:{contestId,userId}},
  })

  if(exists){
    res.status(409).json({error:"already exists"})
    return
  }

  const registeration  = await prisma.contestRegistration.create({
    data:{contestId,userId},
  })

  res.status(201).json(registeration)
})

router.get("/:id/standings",async (req,res)=>{
  const contestId = parseInt(req.params.id)

  const registeration = await prisma.contestRegistration.findMany({
    where:{contestId},
    include:{
      user:{select:{id:true,username:true,rating:true}}
    },
  })

  const submissions = await prisma.submission.findMany({
    where:{contestId,verdict:"ACCEPTED"},
    select:{userId:true,problemId:true,submittedAt:true},

  })

  const contest =await prisma.contest.findUnique({
    where:{id:contestId},
    select:{startTime:true}
  })

  if(!contest){
    res.status(404).json({error:"contest not found"})
    return
  }

  const standing = registeration.map((reg)=>{
    const userSubs = submissions.filter((s)=>s.userId == reg.userId)
    const solved = userSubs.length
    const penalty =userSubs.reduce((total,s)=>{
      const minutes=Math.floor(
        (s.submittedAt.getTime() - contest.startTime.getTime()) / 60000
      )
      return total + minutes
    },0)
    return { user: reg.user, solved, penalty }
  })
  standing.sort((a,b)=>b.solved -a.solved || a.penalty -b.penalty)

  res.json(standing)
})

 

// POST /:id/problems — add a problem to a contest (protected)
router.post('/:id/problems', authMiddleware, async (req, res) => {
  const contestId = parseInt(req.params.id as string)
  const { problemCode, label, orderIndex } = req.body

  if (!problemCode || !label || orderIndex === undefined) {
    res.status(400).json({ error: 'problemCode, label and orderIndex are required' })
    return
  }

  const contest = await prisma.contest.findUnique({ where: { id: contestId } })
  if (!contest) {
    res.status(404).json({ error: 'Contest not found' })
    return
  }

  const problem = await prisma.problem.findUnique({ where: { code: problemCode } })
  if (!problem) {
    res.status(404).json({ error: 'Problem not found' })
    return
  }

  const existing = await prisma.contestProblem.findUnique({
    where: { contestId_problemId: { contestId, problemId: problem.id } },
  })
  if (existing) {
    res.status(409).json({ error: 'Problem already in contest' })
    return
  }

  const contestProblem = await prisma.contestProblem.create({
    data: { contestId, problemId: problem.id, label, orderIndex },
  })

  res.status(201).json(contestProblem)
})

export default router
