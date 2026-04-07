'use strict'
const { BaseError } = require('@utils/errors')

const errorHandler = (err, req, res, next) => {
	// Log error for debugging
	console.error(err)
	console.error('Error:', {
		message: err.message,
		stack: err.stack,
		timestamp: new Date().toISOString(),
	})

	// Handle custom errors
	if (err instanceof BaseError) {
		return res.status(err.statusCode).json({
			success: false,
			error: err.message,
		})
	}

	// Handle Sequelize errors
	if (err.name === 'SequelizeValidationError') {
		return res.status(400).json({
			success: false,
			error: err.errors.map((e) => e.message),
		})
	}

	// Default error
	res.status(500).json({
		success: false,
		error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
	})
}

module.exports = errorHandler
