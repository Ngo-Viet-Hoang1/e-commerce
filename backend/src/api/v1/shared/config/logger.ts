import fs from 'fs'
import os from 'os'
import path from 'path'
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Custom format for console (development)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
    const reqId = requestId ? `[${requestId}] ` : ''
    const metaStr = Object.keys(meta).length
      ? `\n${JSON.stringify(meta, null, 2)}`
      : ''
    return `${timestamp} ${level}: ${reqId}${message}${metaStr}`
  }),
)

// Format for file (production)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  winston.format.json(),
)

// Rotation transport for error logs
const errorRotateTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  format: fileFormat,
  maxSize: '20m', // Rotate when file reaches 20MB
  maxFiles: '14d', // Keep logs for 14 days
  zippedArchive: true, // Compress old logs
})

// Rotation transport for combined logs
const combinedRotateTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  format: fileFormat,
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true,
})

// Rotation transport for access logs (HTTP requests)
const accessRotateTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'access-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'http',
  format: fileFormat,
  maxSize: '20m',
  maxFiles: '7d',
  zippedArchive: true,
})

// Create logger
const logger = winston.createLogger({
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === 'development' ? 'debug' : 'info'),
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
  ),
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'api-service',
    environment: process.env.NODE_ENV || 'development',
    hostname: process.env.HOSTNAME || os.hostname(),
  },
  transports: [
    // Console transport (available in both dev and production)
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === 'development'
          ? consoleFormat
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.simple(),
            ),
      // In production, only log from info level and above to console
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
    }),

    // File transports
    errorRotateTransport,
    combinedRotateTransport,
    accessRotateTransport,
  ],

  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: fileFormat,
    }),
  ],
})

// Stream for Morgan (HTTP logging middleware)
export const stream = {
  write: (message: string) => {
    logger.http(message.trim())
  },
}

export default logger
