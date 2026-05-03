import { Router } from 'express'
import { prisma } from '../prisma.js'

const router = Router()

router.get('/', async (_req, res) => {
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
  })
  res.json(tags)
})

export default router
