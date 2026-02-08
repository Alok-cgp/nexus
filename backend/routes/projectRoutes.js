const express = require('express');
const router = express.Router();
const { 
    createProject, 
    completeProject, 
    getProjects, 
    getProjectById, 
    assignMembers,
    deleteProject
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(protect, getProjects)
    .post(protect, authorize('Admin'), createProject);

router.route('/:id')
    .get(protect, getProjectById)
    .delete(protect, authorize('Admin'), deleteProject);

router.put('/:id/complete', protect, authorize('Admin'), completeProject);
router.put('/:id/assign', protect, authorize('Admin', 'Project Lead'), assignMembers);

module.exports = router;
