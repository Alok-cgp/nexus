const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Document name is required'],
        trim: true,
        maxlength: [100, 'Document name cannot exceed 100 characters']
    },
    filePath: { 
        type: String, 
        required: [true, 'File path is required'] 
    },
    uploadedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true,
        index: true
    },
    project: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project',
        required: true,
        index: true
    }
}, { timestamps: true });

// Compound index for faster project document retrieval
documentSchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
