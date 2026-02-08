const AuditLog = require('../models/AuditLog');

const logActivity = async (userId, action, resource, status, ipAddress, details) => {
    try {
        await AuditLog.create({
            userId,
            action,
            resource,
            status,
            ipAddress,
            details
        });
    } catch (error) {
        console.error('Audit Logging Error:', error);
    }
};

module.exports = logActivity;
