'use strict'

const TransformService = require('@services/transform')

class TransformController {
	/**
	 * Transform input data based on service and type
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 * @param {Function} next - Express next middleware function
	 */
	static async transform(req, res, next) {
		const { service_name, type, input_data } = req.body

		try {
			res.json(await TransformService.transformData(service_name, type, input_data))
		} catch (error) {
			next(error)
		}
	}
}

module.exports = TransformController
