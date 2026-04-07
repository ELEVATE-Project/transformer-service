'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('templates', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			service_name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			type: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			description: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			mapping_schema: {
				type: Sequelize.JSONB,
				allowNull: false,
			},
			function_definitions: {
				type: Sequelize.JSONB,
				allowNull: false,
			},
			is_active: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
			created_at: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updated_at: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			deleted_at: {
				allowNull: true,
				type: Sequelize.DATE,
			},
		})

		// Add unique constraint on service_name and type
/* 		await queryInterface.addConstraint('templates', {
			fields: ['service_name', 'type'],
			type: 'unique',
			name: 'unique_service_name_type_constraint',
		}) */
	},

	down: async (queryInterface, Sequelize) => {
		// Remove the unique constraint first before dropping the table
		await queryInterface.removeConstraint('templates', 'unique_service_name_type_constraint')
		await queryInterface.dropTable('templates')
	},
}
