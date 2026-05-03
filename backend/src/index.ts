import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'

import authRoutes from './routes/auth.js'
import problemRoutes from './routes/problems.js'
import submissionRoutes from './routes/submissions.js'
import contestRoutes from './routes/contests.js'
import userRoutes from './routes/users.js'
import tagRoutes from './routes/tags.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(morgan('dev'))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/problems', problemRoutes)
app.use('/api/submissions', submissionRoutes)
app.use('/api/contests', contestRoutes)
app.use('/api/users', userRoutes)
app.use('/api/tags', tagRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
