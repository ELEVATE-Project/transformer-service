'use strict'
const { Template } = require('../models')

exports.createTemplate = async (templateData) => {
	console.log(templateData)

	return await Template.create(templateData)
}

exports.getAllTemplates = async (filters = {}) => {
	return await Template.findAll({
		where: filters,
		order: [['created_at', 'DESC']],
	})
}

exports.getTemplateById = async (id) => {
	return await Template.findByPk(id, { raw: true })
}

exports.updateTemplate = async (id, templateData) => {
	const [updatedRowsCount, updatedRows] = await Template.update(templateData, {
		where: { id },
		returning: true,
	})
	return updatedRows[0]
}

exports.deleteTemplate = async (id) => {
	return await Template.destroy({
		where: { id },
	})
}
