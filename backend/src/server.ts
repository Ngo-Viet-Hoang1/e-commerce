import logger from '@v1/config/logger'
import setupProcessHandlers from '@v1/utils/process-handler.util'
import app from './app'

const port = process.env.PORT || 3000

// Setup process error handlers
setupProcessHandlers()

const server = app.listen(port, () => {
  logger.info(
    `2 Factor Authentication app listening at http://localhost:${port}`,
  )
})

export default server
