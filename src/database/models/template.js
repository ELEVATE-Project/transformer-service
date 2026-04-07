'use strict'

module.exports = (sequelize, DataTypes) => {
	const Template = sequelize.define(
		'Template',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			service_name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			mapping_schema: {
				type: DataTypes.JSONB,
				allowNull: false,
			},
			function_definitions: {
				type: DataTypes.JSONB,
				allowNull: false,
			},
			is_active: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
		},
		{
			modelName: 'Template',
			tableName: 'templates',
			timestamps: true,
			freezeTableName: true,
			paranoid: true,
			underscored: true,
		}
	)

	return Template
}
