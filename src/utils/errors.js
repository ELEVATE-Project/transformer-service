'use strict'

class BaseError extends Error {
	constructor(message, statusCode) {
		super(message)
		this.statusCode = statusCode
		this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
		Error.captureStackTrace(this, this.constructor)
	}
}

class NotFoundError extends BaseError {
	constructor(message) {
		super(message || 'Not found', 404)
	}
}

class TransformationError extends Error {
	constructor(message) {
		super(message)
		this.name = 'TransformationError'
		this.status = 422
	}
}

class ValidationError extends BaseError {
	constructor(message) {
		super(message || 'Validation failed', 400)
	}
}

module.exports = {
	BaseError,
	NotFoundError,
	ValidationError,
	TransformationError,
}
