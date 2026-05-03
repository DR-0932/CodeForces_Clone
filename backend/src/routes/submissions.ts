import { Router } from 'express'
import { prisma } from '../prisma.js'
import { authMiddleware } from '../middleware/auth.js'
import { submissionQueue } from '../queue/submissionQueue.js'

const router = Router()

router.get('/', async (req, res) => {
  const { userId } = req.query

  const submissions = await prisma.submission.findMany({
    where: {
      ...(userId && { userId: parseInt(userId as string) }),
    },
    select: {
      id: true,
      verdict: true,
      language: true,
      timeUsed: true,
      memoryUsed: true,
      submittedAt: true,
      problem: { select: { code: true, title: true } },
      user: { select: { username: true } },
    },
    orderBy: { submittedAt: 'desc' },
    take: 5,
  })

  res.json(submissions)
})

// GET /:id — get single submission verdict (frontend polls this)
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id)

  const submission = await prisma.submission.findUnique({
    where: { id },
    select: {
      id: true,
      verdict: true,
      language: true,
      code: true,
      timeUsed: true,
      memoryUsed: true,
      failedTest: true,
      submittedAt: true,
      problem: { select: { code: true, title: true } },
      user: { select: { username: true } },
    },
  })

  if (!submission) {
    res.status(404).json({ error: 'Submission not found' })
    return
  }

  res.json(submission)
})

// POST / — submit code (protected)
router.post('/', authMiddleware, async (req, res) => {
  const { problemCode, code, language, contestId } = req.body

  if (!problemCode || !code || !language) {
    res.status(400).json({ error: 'problemCode, code and language are required' })
    return
  }

  const validLanguages = ['CPP', 'PYTHON', 'JAVA', 'JAVASCRIPT']
  if (!validLanguages.includes(language)) {
    res.status(400).json({ error: `language must be one of: ${validLanguages.join(', ')}` })
    return
  }

  const problem = await prisma.problem.findUnique({ where: { code: problemCode } })
  if (!problem) {
    res.status(404).json({ error: 'Problem not found' })
    return
  }

  const submission = await prisma.submission.create({
    data: {
      userId: req.userId!,
      problemId: problem.id,
      contestId: contestId ?? null,
      code,
      language,
      verdict: 'PENDING',
    },
  })

  await submissionQueue.add({ submissionId: submission.id })

  res.status(201).json({ id: submission.id, verdict: 'PENDING' })
})

export default router
