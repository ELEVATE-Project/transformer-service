'use strict'

const express = require('express')
const router = express.Router()
const { celebrate, Joi, errors } = require('celebrate')
const templateController = require('@controllers/template')
const transformController = require('@controllers/transform')

// Validation schemas
const templateValidation = {
	createTemplate: {
		body: Joi.object({
			service_name: Joi.string().required().trim().max(255),
			description: Joi.string().optional().trim().max(1000), // Increased limit
			mapping_schema: Joi.object().required(),
			function_definitions: Joi.object().required(),
			is_active: Joi.boolean().optional().default(true),
		}),
	},
	updateTemplate: {
		params: Joi.object({
			id: Joi.number().positive().required(),
		}),
		body: Joi.object({
			service_name: Joi.string().optional().trim().max(255),
			name: Joi.string().optional().trim().max(255),
			description: Joi.string().optional().trim().max(1000),
			mapping_schema: Joi.object().optional(),
			function_definitions: Joi.object().optional(),
			type: Joi.string().valid('jsonata', 'json-transformer').optional(),
			is_active: Joi.boolean().optional(),
		}).min(1), // Ensure at least one field is provided
	},
	getTemplateById: {
		params: Joi.object({
			id: Joi.number().positive().required(),
		}),
	},
}

const transformValidation = {
	transform: {
		body: Joi.object({
			service_name: Joi.string().required(),
			type: Joi.string().required(),
			input_data: Joi.object().required(),
		}),
	},
}

// Template CRUD routes with validation
router.post('/templates', templateController.createTemplate)

router.get('/templates', templateController.getAllTemplates)

router.get('/templates/:id', celebrate(templateValidation.getTemplateById), templateController.getTemplateById)

router.put('/templates/:id', celebrate(templateValidation.updateTemplate), templateController.updateTemplate)

router.delete('/templates/:id', celebrate(templateValidation.getTemplateById), templateController.deleteTemplate)

// Transform route with validation
router.post('/transform', celebrate(transformValidation.transform), transformController.transform)

/* 
const { authVerifier } = require('@middlewares/authVerifier');
router.use(authVerifier); 
*/

// Celebrate error handler
router.use(errors())

module.exports = router
