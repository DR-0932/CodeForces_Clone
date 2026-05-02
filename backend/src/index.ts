import  express, { Router }  from "express";
import cors from 'cors'
import morgan from 'morgan'
import 'dotenv/config'

import authRoutes from './routes/auth.js'

const app = express();

app.use(express.json())
app.use(morgan('dev'))

app.use('/api/auth',authRoutes)



app.listen(3000);