import { Router } from 'express'
import { prisma } from '../prisma.js'
import { authMiddleware } from '../middleware/auth.js'


const router = Router()

router.get("/", async (req,res)=>{
  const {tag , difficulty, search , page} = req.query

  const pageNum = parseInt(page as string) || 1
  const pageSize = 20 
  const skip  = (pageNum - 1) * pageSize
  const problems  = await prisma.problem.findMany({
    where:{
      isPublic:true,
      ...(difficulty && { difficulty: parseInt(difficulty as string)}),
      ...(search && {
        title: {contains: search as string , mode: 'insensitive'},
      }),
      ...(tag && {
        tags: { some:{tag:{name:tag as string}}},
      })
    },
    select:{
      id:true,
      code:true,
      title:true,
      difficulty:true,
      tags: { select: { tag: {select: {name:true}}}},
    },
    orderBy: {code:'asc'},
    skip,
    take:pageSize,
  })
  res.json(problems)
})


router.get('/:code', async (req, res) => {
  const { code } = req.params

  const problem = await prisma.problem.findUnique({
    where: { code },
    include: {
      tags: { include: { tag: true } },
      testCases: {
        where: { isSample: true },
        orderBy: { orderIndex: 'asc' },
        select: { id: true, input: true, expectedOutput: true, orderIndex: true },
      },
      author: { select: { username: true } },
    },
  })
  if(!problem){
    res.status(404).json({error:'Problem not found'})
    return
  }
  res.json(problem)
})


router.post('/',authMiddleware,async (req,res)=>{
    const {
    code,
    title,
    statement,
    inputFormat,
    outputFormat,
    notes,
    timeLimit,
    memoryLimit,
    difficulty,
    isPublic,
    tags,
  } = req.body

  if (!code || !title || !statement || !inputFormat || !outputFormat || !timeLimit || !memoryLimit || !difficulty) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  const existing = await prisma.problem.findUnique({ where: { code } })
    if (existing) {
      res.status(409).json({ error: 'Problem code already exists' })
    return
  }

    const problem = await prisma.problem.create({
    data: {
      code,
      title,
      statement,
      inputFormat,
      outputFormat,
      notes,
      timeLimit,
      memoryLimit,
      difficulty,
      isPublic: isPublic ?? false,
      authorId: req.userId!,
      tags: {
        create: (tags as string[] ?? []).map((tagName: string) => ({
          tag: {
            connectOrCreate: {
              where: { name: tagName },
              create: { name: tagName },
            },
          },
        })),
      },
    },
    include: {
      tags: { include: { tag: true } },
    },
  })
    res.status(201).json(problem)
})

// POST /:code/testcases — add test cases to a problem (protected)
router.post('/:code/testcases', authMiddleware, async (req, res) => {
  const code = req.params.code as string
  const { testcases } = req.body

  if (!Array.isArray(testcases) || testcases.length === 0) {
    res.status(400).json({ error: 'testcases must be a non-empty array' })
    return
  }

  const problem = await prisma.problem.findUnique({ where: { code } })
  if (!problem) {
    res.status(404).json({ error: 'Problem not found' })
    return
  }

  const created = await prisma.testCase.createMany({
    data: testcases.map((tc: { input: string; expectedOutput: string; isSample?: boolean; orderIndex: number }) => ({
      problemId: problem.id,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      isSample: tc.isSample ?? false,
      orderIndex: tc.orderIndex,
    })),
  })

  res.status(201).json({ created: created.count })
})

export default router
