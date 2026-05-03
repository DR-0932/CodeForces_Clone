import Bull from 'bull'

export const submissionQueue = new Bull('submissions', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
})
