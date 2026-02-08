const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const projectSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Project name is required'],
        trim: true,
        maxlength: [100, 'Project name cannot exceed 100 characters']
    },
    description: { 
        type: String, 
        required: [true, 'Description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
        set: (v) => encrypt(v),
        get: (v) => decrypt(v)
    },
    deadline: { 
        type: Date, 
        required: [true, 'Initial deadline is required']
    },
    status: { 
        type: String, 
        enum: ['Active', 'Completed'], 
        default: 'Active' 
    },
    projectLead: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    assignedDevelopers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { 
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});

// Indexing for faster queries
projectSchema.index({ status: 1 });
projectSchema.index({ projectLead: 1 });
projectSchema.index({ assignedDevelopers: 1 });

module.exports = mongoose.model('Project', projectSchema);
