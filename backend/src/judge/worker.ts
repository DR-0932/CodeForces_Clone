import { writeFile } from 'fs/promises'
import path from 'path'
import { prisma } from '../prisma.js'
import { submissionQueue } from '../queue/submissionQueue.js'
import { languages, Language } from './languages.js'
import { compile } from './compiler.js'
import { initBox, cleanupBox, runInSandbox } from './sandbox.js'
import { checkOutput } from './checker.js'

submissionQueue.process(async (job) => {
  const { submissionId } = job.data

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      problem: {
        include: {
          testCases: { orderBy: { orderIndex: 'asc' } },
        },
      },
    },
  })

  if (!submission) return

  const config = languages[submission.language as Language]
  const boxId = submissionId % 100

  try {
    await initBox(boxId)

    // write code into the sandbox box
    const boxDir = `/var/local/lib/isolate/${boxId}/box`
    await writeFile(path.join(boxDir, config.filename), submission.code)

    // compile (no-op for Python and JavaScript)
    const compileResult = await compile(boxId, config)
    if (!compileResult.success) {
      await prisma.submission.update({
        where: { id: submissionId },
        data: { verdict: 'COMPILATION_ERROR' },
      })
      return
    }

    // run against each test case, stop at first failure
    let finalVerdict = 'ACCEPTED'
    let failedTest: number | null = null
    let maxTime = 0
    let maxMemory = 0

    for (let i = 0; i < submission.problem.testCases.length; i++) {
      const tc = submission.problem.testCases[i]

      const result = await runInSandbox(
        boxId,
        config.run,
        tc.input,
        submission.problem.timeLimit,
        submission.problem.memoryLimit
      )

      maxTime = Math.max(maxTime, result.timeUsed)
      maxMemory = Math.max(maxMemory, result.memoryUsed)

      if (result.status === 'TLE') { finalVerdict = 'TIME_LIMIT_EXCEEDED'; failedTest = i + 1; break }
      if (result.status === 'MLE') { finalVerdict = 'MEMORY_LIMIT_EXCEEDED'; failedTest = i + 1; break }
      if (result.status === 'RE')  { finalVerdict = 'RUNTIME_ERROR'; failedTest = i + 1; break }

      if (!checkOutput(result.stdout, tc.expectedOutput)) {
        finalVerdict = 'WRONG_ANSWER'
        failedTest = i + 1
        break
      }
    }

    await prisma.submission.update({
      where: { id: submissionId },
      data: { verdict: finalVerdict, timeUsed: maxTime, memoryUsed: maxMemory, failedTest },
    })

  } finally {
    await cleanupBox(boxId)
  }
})

console.log('Judge worker running...')
