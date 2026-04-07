'use strict'
const templateQueries = require('../database/queries/template')
const { NotFoundError, ValidationError } = require('../utils/errors')

/**
 * Template service containing all business logic for template operations
 */
const templateService = {
	async createTemplate(templateData) {
		return await templateQueries.createTemplate({
			...templateData,
		})
	},

	/**
	 * Create a new template
	 * @param {Object} templateData - Template data to create
	 * @returns {Promise<Object>} Created template
	 */
	async createTemplateOld(templateData) {
		const { mapping_schema } = templateData

		// Extract and process functions from the schema
		const { processedSchema, functionDefinitions } = this._extractFunctions(mapping_schema)

		return await templateQueries.createTemplate({
			...templateData,
			mapping_schema: processedSchema,
			function_definitions: functionDefinitions,
		})
		//return await templateQueries.createTemplate(templateData)
	},

	/**
	 * Get all templates with optional filtering
	 * @param {Object} query - Query parameters for filtering
	 * @returns {Promise<Array>} List of templates
	 */
	async getAllTemplates(query = {}) {
		const filters = this._parseFilters(query)
		return await templateQueries.getAllTemplates(filters)
	},

	/**
	 * Get template by ID
	 * @param {number} id - Template ID
	 * @returns {Promise<Object>} Template data
	 * @throws {NotFoundError} If template not found
	 */
	async getTemplateById(id) {
		const template = await templateQueries.getTemplateById(id)
		if (!template) {
			throw new NotFoundError('Template not found')
		}
		return template
	},

	/**
	 * Update template by ID
	 * @param {number} id - Template ID
	 * @param {Object} templateData - Updated template data
	 * @returns {Promise<Object>} Updated template
	 * @throws {NotFoundError} If template not found
	 */
	async updateTemplate(id, templateData) {
		const updatedTemplate = await templateQueries.updateTemplate(id, templateData)
		if (!updatedTemplate) {
			throw new NotFoundError('Template not found')
		}
		return updatedTemplate
	},

	/**
	 * Delete template by ID
	 * @param {number} id - Template ID
	 * @throws {NotFoundError} If template not found
	 */
	async deleteTemplate(id) {
		const deleted = await templateQueries.deleteTemplate(id)
		if (!deleted) {
			throw new NotFoundError('Template not found')
		}
	},

	/**
	 * Parse query parameters into filter object
	 * @private
	 * @param {Object} query - Query parameters
	 * @returns {Object} Formatted filters
	 */
	_parseFilters(query) {
		const filters = {}

		if (query.is_active !== undefined) {
			filters.is_active = query.is_active === 'true'
		}

		if (query.service_name) {
			filters.service_name = query.service_name
		}

		if (query.type) {
			filters.type = query.type
		}

		return filters
	},
}

module.exports = templateService
