const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
    const { name, description, deadline } = req.body;

    const project = await Project.create({
        name,
        description,
        deadline,
        status: 'Active'
    });

    if (project) {
        res.status(201).json(project);
    } else {
        res.status(400).json({ message: 'Invalid project data' });
    }
};

// @desc    Mark project as completed
// @route   PUT /api/projects/:id/complete
// @access  Private/Admin
const completeProject = async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (project) {
        project.status = 'Completed';
        await project.save();
        res.json(project);
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
};

// @desc    Get projects (Admin: all, others: all active + their assigned)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
    try {
        let projects;
        if (req.user.role === 'Admin') {
            // Admin sees everything
            projects = await Project.find({}).populate('projectLead assignedDevelopers', 'name email');
        } else {
            // Others see all Active projects (Requirement 1b)
            // Plus any Completed projects they were assigned to (Requirement 2b)
            projects = await Project.find({
                $or: [
                    { status: 'Active' },
                    { projectLead: req.user._id },
                    { assignedDevelopers: req.user._id }
                ]
            }).populate('projectLead assignedDevelopers', 'name email');
        }
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching projects' });
    }
};

// @desc    Get project details
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
    const project = await Project.findById(req.params.id)
        .populate('projectLead assignedDevelopers', 'name email');

    if (project) {
        // Check if user is assigned to this project or is Admin
        const isAssigned = project.assignedDevelopers.some(dev => dev._id.toString() === req.user._id.toString()) || 
                           (project.projectLead && project.projectLead._id.toString() === req.user._id.toString()) ||
                           req.user.role === 'Admin';
        
        if (!isAssigned) {
            return res.status(403).json({ message: 'Not authorized to view this project' });
        }
        res.json(project);
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
};

// @desc    Assign team members to project
// @route   PUT /api/projects/:id/assign
// @access  Private/Project Lead or Admin
const assignMembers = async (req, res) => {
    const { developers, projectLeadId } = req.body;
    const project = await Project.findById(req.params.id);

    if (project) {
        // Check permissions: Admin can do anything. Project Lead can only assign to their OWN projects.
        const isAdmin = req.user.role === 'Admin';
        const isProjectLeadOfThisProject = project.projectLead?.toString() === req.user._id.toString();

        if (!isAdmin && !isProjectLeadOfThisProject) {
            return res.status(403).json({ message: 'Not authorized to assign members to this project' });
        }

        // Only Admin can change the Project Lead
        if (projectLeadId && isAdmin) {
            project.projectLead = projectLeadId;
        }
        
        if (developers) {
            project.assignedDevelopers = developers;
        }

        const updatedProject = await project.save();
        res.json(updatedProject);
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (project) {
        await project.deleteOne();
        res.json({ message: 'Project removed' });
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
};

module.exports = {
    createProject,
    completeProject,
    getProjects,
    getProjectById,
    assignMembers,
    deleteProject
};
