'use strict'
//const templateService = require('@services/template')
const templateService = require('../services/template')

exports.createTemplate = async (req, res, next) => {
	try {
		const template = await templateService.createTemplate(req.body)
		res.status(201).json({
			success: true,
			data: template,
		})
	} catch (error) {
		next(error)
	}
}

exports.getAllTemplates = async (req, res, next) => {
	try {
		const templates = await templateService.getAllTemplates(req.query)
		res.status(200).json({
			success: true,
			data: templates,
		})
	} catch (error) {
		next(error)
	}
}

exports.getTemplateById = async (req, res, next) => {
	try {
		const template = await templateService.getTemplateById(req.params.id)
		res.status(200).json({
			success: true,
			data: template,
		})
	} catch (error) {
		next(error)
	}
}

exports.updateTemplate = async (req, res, next) => {
	try {
		const template = await templateService.updateTemplate(req.params.id, req.body)
		res.status(200).json({
			success: true,
			data: template,
		})
	} catch (error) {
		next(error)
	}
}

exports.deleteTemplate = async (req, res, next) => {
	try {
		await templateService.deleteTemplate(req.params.id)
		res.status(200).json({
			success: true,
			message: 'Template deleted successfully',
		})
	} catch (error) {
		next(error)
	}
}
