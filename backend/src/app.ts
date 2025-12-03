import { corsMiddleware } from '@v1/middlewares/cors.middleware'
import {
  globalErrorHandler,
  notFoundHandler,
} from '@v1/middlewares/error-handler.middleware'
import { requestIdMiddleware } from '@v1/middlewares/request-id.middleware'
import router from '@v1/routes'
import compression from 'compression'
import dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(requestIdMiddleware)

app.use(corsMiddleware)

// Security middleware
app.use(helmet())
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false
      }
      return compression.filter(req, res)
    },
  }),
)

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}
// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '..', 'public')))

app.use('/api/v1', router)

// Apply error handling middlewares
// https://betterstack.com/community/guides/scaling-nodejs/error-handling-express/
app.use(notFoundHandler)
app.use(globalErrorHandler)

export default app
