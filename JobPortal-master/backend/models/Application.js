const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const Application = sequelize.define('application', {
    applicantId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    jobTitle: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending'
    },
    appliedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    publishedBy: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Application;
