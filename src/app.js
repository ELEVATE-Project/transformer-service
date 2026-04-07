'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')

// Environment and module configuration
require('module-alias/register')
require('dotenv').config()

// Import centralized logger
const logger = require('@utils/logger')

// Import database connection (if using Sequelize)
const { sequelize } = require('@database/models')

// Create Express app
const app = express()

// Middleware setup
app.use(helmet()) // Adds security headers
app.use(compression()) // Compress response bodies
app.use(
	bodyParser.urlencoded({
		extended: true,
		limit: '50mb',
	})
)
app.use(
	bodyParser.json({
		limit: '50mb',
	})
)
app.use(cors())

// Routes
app.use(process.env.ROOT_ROUTE, require('@routes'))

// Error handling middleware
const errorHandler = require('@middlewares/errorHandler')
app.use(errorHandler)

// Database connection
const connectDatabase = async () => {
	try {
		await sequelize.authenticate()
		logger.info('Database connection established successfully.')
	} catch (error) {
		logger.error('Unable to connect to the database:', {
			errorMessage: error.message,
			errorStack: error.stack,
		})
		process.exit(1)
	}
}

// Server startup
const startServer = () => {
	const PORT = process.env.APPLICATION_PORT || 3030

	const server = app.listen(PORT, () => {
		logger.info('Server started', {
			environment: process.env.NODE_ENV,
			port: PORT,
		})
	})

	// Graceful shutdown
	const gracefulShutdown = (signal) => {
		logger.info(`Received ${signal}. Starting graceful shutdown...`, { signal })

		server.close(() => {
			logger.info('HTTP server closed.')

			// Close database connection
			sequelize
				.close()
				.then(() => {
					logger.info('Database connection closed.')
					process.exit(0)
				})
				.catch((err) => {
					logger.error('Error closing database connection', {
						errorMessage: err.message,
						errorStack: err.stack,
					})
					process.exit(1)
				})
		})

		// Force close server after 10 seconds
		setTimeout(() => {
			logger.error('Could not close connections in time, forcefully shutting down')
			process.exit(1)
		}, 10000)
	}

	// Listen for termination signals
	process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
	process.on('SIGINT', () => gracefulShutdown('SIGINT'))
}

// Initialize application
const bootstrap = async () => {
	try {
		logger.info('Application bootstrap started')
		await connectDatabase()
		startServer()
	} catch (error) {
		logger.error('Application bootstrap failed', {
			errorMessage: error.message,
			errorStack: error.stack,
		})
		process.exit(1)
	}
}

bootstrap()

// Unhandled promise rejection and uncaught exception handlers
process.on('unhandledRejection', (reason, promise) => {
	logger.error('Unhandled Rejection', {
		promise: promise,
		reason: reason,
	})
})

process.on('uncaughtException', (error) => {
	logger.error('Uncaught Exception', {
		errorMessage: error.message,
		errorStack: error.stack,
	})
	process.exit(1)
})

module.exports = app
