'use strict'

const vm = require('vm')
const transform = require('json-to-json-transformer').transform
const jsonata = require('jsonata')
const { performance } = require('perf_hooks')

const { TransformationError } = require('@utils/errors')
const { emptyFieldSanitizer } = require('@utils/emptyFieldSanitizer')
const logger = require('@utils/logger')

class TransformHelper {
	/**
	 * Safely create a function from a function string using VM
	 * @param {string} functionStr - Function definition as a string
	 * @returns {Function} Validated and created function
	 */
	static createTransformFunction(functionStr) {
		// Validate input
		if (typeof functionStr !== 'string' || functionStr.trim() === '') {
			throw new TransformationError('Invalid function definition')
		}

		// Restricted context to prevent access to global objects
		const context = vm.createContext({
			Math,
			Date,
			console: {
				log: (...args) => logger.info('VM Console Log:', ...args),
				error: (...args) => logger.error('VM Console Error:', ...args),
			},
		})

		try {
			// Additional security: limit function complexity
			if (functionStr.length > 10000) {
				throw new TransformationError('Function definition too long')
			}

			const script = new vm.Script(`(${functionStr})`, {
				displayErrors: true,
				lineOffset: 0,
				columnOffset: 0,
			})

			const function_ = script.runInContext(context, {
				timeout: 1000, // 1-second execution timeout
				displayErrors: true,
			})

			// Strict function type checking
			if (typeof function_ !== 'function') {
				throw new TransformationError('Transform definition must evaluate to a function')
			}

			return function_
		} catch (error) {
			logger.error('Function creation failed', {
				errorMessage: error.message,
				functionLength: functionStr.length,
			})

			throw new TransformationError(`Failed to create transform function: ${error.message}`)
		}
	}

	/**
	 * Apply transformation using json-to-json-transformer
	 * @param {Object} inputData - Input data to transform
	 * @param {Object} mappingSchema - Mapping schema for transformation
	 * @param {Object} functionDefinitions - Custom functions for transformation
	 * @returns {Object} Transformed data
	 */
	static async applyTransformation(inputData, mappingSchema, functionDefinitions = {}) {
		// Input validation
		if (!inputData || !mappingSchema) {
			throw new TransformationError('Input data and mapping schema are required')
		}

		const startTime = performance.now()
		const transformFunctions = {}

		try {
			// Process function definitions
			if (functionDefinitions && Object.keys(functionDefinitions).length > 0) {
				for (const [funcName, funcDef] of Object.entries(functionDefinitions)) {
					// Validate function name
					if (!/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(funcName)) {
						throw new TransformationError(`Invalid function name: ${funcName}`)
					}

					transformFunctions[funcName] = this.createTransformFunction(funcDef)
				}
			}

			// Apply transformation
			const result = await transform(mappingSchema, inputData, transformFunctions)

			// Sanitize empty fields
			const sanitizedResult = emptyFieldSanitizer(result)

			// Log performance
			const duration = performance.now() - startTime
			logger.info('Transformation completed', {
				inputSize: Buffer.byteLength(JSON.stringify(inputData)),
				outputSize: Buffer.byteLength(JSON.stringify(sanitizedResult)),
				duration: `${duration.toFixed(2)}ms`,
			})

			return sanitizedResult
		} catch (error) {
			logger.error('Transformation failed', {
				errorMessage: error.message,
				inputDataKeys: Object.keys(inputData),
				mappingSchemaKeys: Object.keys(mappingSchema),
			})

			throw new TransformationError(`Transform failed: ${error.message}`)
		} finally {
			// Clean up function references
			for (const funcName in transformFunctions) {
				transformFunctions[funcName] = null
			}
		}
	}

	/**
	 * Convert custom function definitions to actual functions
	 * @param {Object} customFunctions - Custom function definitions
	 * @returns {Object} Mapped functions
	 */
	static _convertToFunction(customFunctions) {
		if (!customFunctions || typeof customFunctions !== 'object') {
			return {}
		}

		const functionMap = {}

		Object.entries(customFunctions).forEach(([funcName, funcDef]) => {
			try {
				// Stricter function conversion with additional checks
				if (typeof funcDef !== 'string' || funcDef.trim() === '') {
					logger.warn(`Skipping invalid function definition for ${funcName}`)
					return
				}

				// Use safer function creation
				const func = new Function(`return (${funcDef})`)()

				// Additional type and complexity checks
				if (typeof func !== 'function') {
					throw new Error('Not a valid function')
				}

				functionMap[funcName] = func
			} catch (error) {
				logger.error(`Failed to parse function ${funcName}`, {
					errorMessage: error.message,
				})
			}
		})

		return functionMap
	}

	/**
	 * Transform data using JSONata
	 * @param {Object} inputJson - Input data
	 * @param {Object} mappingSchema - Mapping schema
	 * @param {Object} customFunctions - Custom functions
	 * @returns {Object} Transformed data
	 */
	static async transformWithJsonata(inputJson, mappingSchema, customFunctions) {
		const startTime = performance.now()

		try {
			// Sanitize and prepare mapping schema
			const jsonataMapping = mappingSchema //JSON.stringify(mappingSchema, null, 2).replace(/"\{\{(.*?)\}\}"/g, '$1') // Remove quotes around expressions

			const expression = jsonata(jsonataMapping)

			// Register custom functions
			if (customFunctions) {
				const functionInstances = this._convertToFunction(customFunctions)

				Object.entries(functionInstances).forEach(([funcName, func]) => {
					// Optionally add function signature if needed
					expression.registerFunction(funcName, func)
				})
			}

			// Evaluate expression
			const result = await expression.evaluate(inputJson)

			// Log performance
			const duration = performance.now() - startTime
			logger.info('JSONata transformation completed', {
				inputSize: Buffer.byteLength(JSON.stringify(inputJson)),
				outputSize: Buffer.byteLength(JSON.stringify(result)),
				duration: `${duration.toFixed(2)}ms`,
			})

			return result
		} catch (error) {
			logger.error('JSONata transformation failed', {
				errorMessage: error.message,
				inputDataKeys: Object.keys(inputJson),
			})

			throw new TransformationError(`JSONata transformation failed: ${error.message}`)
		}
	}
}

module.exports = TransformHelper
