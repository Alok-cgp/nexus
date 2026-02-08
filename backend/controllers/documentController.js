const Document = require('../models/Document');
const Project = require('../models/Project');
const path = require('path');
const fs = require('fs');

// @desc    Upload project document
// @route   POST /api/documents/:projectId
// @access  Private/Admin or Project Lead
const uploadDocument = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const project = await Project.findById(req.params.projectId);
    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }

    // Check permissions
    const canUpload = req.user.role === 'Admin' || 
                      (req.user.role === 'Project Lead' && project.projectLead?.toString() === req.user._id.toString());
    
    if (!canUpload) {
        // Delete uploaded file if no permission
        fs.unlinkSync(req.file.path);
        return res.status(403).json({ message: 'Not authorized to upload to this project' });
    }

    const document = await Document.create({
        name: req.body.name || req.file.originalname,
        filePath: req.file.path,
        uploadedBy: req.user._id,
        project: project._id
    });

    res.status(201).json(document);
};

// @desc    Get documents for a project
// @route   GET /api/documents/:projectId
// @access  Private (Assigned users)
const getDocumentsByProject = async (req, res) => {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is assigned or Admin
    const isAssigned = project.assignedDevelopers.some(devId => devId.toString() === req.user._id.toString()) || 
                       project.projectLead?.toString() === req.user._id.toString() ||
                       req.user.role === 'Admin';

    if (!isAssigned) {
        return res.status(403).json({ message: 'Not authorized to view documents' });
    }

    const documents = await Document.find({ project: project._id }).populate('uploadedBy', 'name');
    res.json(documents);
};

module.exports = {
    uploadDocument,
    getDocumentsByProject
};
