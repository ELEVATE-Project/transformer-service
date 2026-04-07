'use strict'

const { Template } = require('@database/models')
const TransformHelper = require('@helpers/transformHelper')
const { NotFoundError, ValidationError } = require('@utils/errors')
const logger = require('@utils/logger') // Assuming we'll create a centralized logger

class TransformService {
	/**
	 * Transform input data based on a template
	 * @param {string} serviceName - Name of the service
	 * @param {string} type - Type of transformation
	 * @param {Object} inputData - Input data to be transformed
	 * @returns {Object} Transformed data
	 */
	static async transformData(serviceName, type, inputData) {
		// Input validation
		if (!serviceName || !type || !inputData) {
			throw new ValidationError('Missing required parameters for transformation')
		}

		try {
			// Fetch template from database with proper error handling
			const template = await Template.findOne({
				where: {
					service_name: serviceName,
					type,
					is_active: true,
				},
				attributes: ['mapping_schema', 'function_definitions'], // Select only necessary fields
				raw: true,
			})

			if (!template) {
				const errorMessage = `No active template found for service: ${serviceName}, type: ${type}`
				logger.warn(errorMessage, { serviceName, type })
				throw new NotFoundError(errorMessage)
			}

			// Determine transformation method based on environment variable
			const useJsonata = process.env.JSONATA === 'true'

			// Perform transformation with error handling and logging
			let transformedData
			const startTime = Date.now()

			try {
				transformedData = useJsonata
					? await TransformHelper.transformWithJsonata(
							inputData,
							template.mapping_schema,
							template.function_definitions
					  )
					: await TransformHelper.applyTransformation(
							inputData,
							template.mapping_schema,
							template.function_definitions
					  )
			} catch (transformError) {
				logger.error('Transformation failed', {
					serviceName,
					type,
					inputDataSize: Buffer.byteLength(JSON.stringify(inputData)),
					error: transformError.message,
				})
				throw new Error(`Transformation failed: ${transformError.message}`)
			}

			// Log transformation performance
			const duration = Date.now() - startTime
			logger.info('Data transformation completed', {
				serviceName,
				type,
				inputDataSize: Buffer.byteLength(JSON.stringify(inputData)),
				outputDataSize: Buffer.byteLength(JSON.stringify(transformedData)),
				duration: `${duration}ms`,
			})

			return transformedData
		} catch (error) {
			// Central error handling
			logger.error('Transform service error', {
				serviceName,
				type,
				errorMessage: error.message,
				errorStack: error.stack,
			})

			// Rethrow or transform error as needed
			if (error instanceof NotFoundError || error instanceof ValidationError) {
				throw error
			}

			throw new Error(`Transform service failed: ${error.message}`)
		}
	}

	/**
	 * Validate input data before transformation
	 * @param {Object} inputData - Input data to validate
	 * @returns {boolean} - Whether input data is valid
	 */
	static validateInputData(inputData) {
		// Implement custom validation logic
		if (!inputData || typeof inputData !== 'object') {
			return false
		}

		// Add more specific validation as per your requirements
		return true
	}
}

module.exports = TransformService
