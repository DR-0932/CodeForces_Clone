import { Router } from 'express'
import { prisma } from '../prisma.js'

const router = Router()

// GET /:username — public profile
router.get('/:username', async (req, res) => {
  const username = req.params.username as string

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      rating: true,
      maxRating: true,
      rank: true,
      country: true,
      avatar: true,
      createdAt: true,
    },
  })

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  // all accepted submissions (distinct problems)
  const solved = await prisma.submission.findMany({
    where: { userId: user.id, verdict: 'ACCEPTED' },
    distinct: ['problemId'],
    select: {
      problemId: true,
      problem: {
        select: {
          difficulty: true,
          tags: { select: { tag: { select: { name: true } } } },
        },
      },
    },
  })


  // recent submission history (last 20)
  const recentSubmissions = await prisma.submission.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      verdict: true,
      language: true,
      submittedAt: true,
      problem: { select: { code: true, title: true } },
    },
    orderBy: { submittedAt: 'desc' },
    take: 20,
  })

  res.json({
    ...user,
    totalSolved: solved.length,
    recentSubmissions,
  })
})

export default router
