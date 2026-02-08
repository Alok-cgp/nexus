import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    Calendar,
    Users,
    FileText,
    Upload,
    ArrowLeft,
    CheckCircle,
    UserPlus,
    File,
    Download
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import './ProjectDetails.css';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [project, setProject] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Assignment states
    const [showAssign, setShowAssign] = useState(false);
    const [selectedLead, setSelectedLead] = useState('');
    const [selectedDevs, setSelectedDevs] = useState([]);
    
    // Upload states
    const [showUpload, setShowUpload] = useState(false);
    const [file, setFile] = useState(null);
    const [docName, setDocName] = useState('');

    useEffect(() => {
        fetchProjectData();
    }, [id]);

    const fetchProjectData = async () => {
        try {
            const [projRes, docsRes, usersRes] = await Promise.all([
                api.get(`/projects/${id}`),
                api.get(`/documents/${id}`),
                (user.role === 'Admin' || user.role === 'Project Lead') ? api.get('/auth/users') : Promise.resolve({ data: [] })
            ]);
            
            setProject(projRes.data);
            setDocuments(docsRes.data);
            setAllUsers(usersRes.data.data || usersRes.data);
            setSelectedLead(projRes.data.projectLead?._id || '');
            setSelectedDevs(projRes.data.assignedDevelopers?.map(d => d._id) || []);
        } catch (error) {
            toast.error('Failed to fetch project details');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/projects/${id}/assign`, {
                projectLeadId: selectedLead,
                developers: selectedDevs
            });
            toast.success('Team members assigned successfully');
            setShowAssign(false);
            fetchProjectData();
        } catch (error) {
            toast.error('Failed to assign members');
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file) return toast.error('Please select a file');

        const formData = new FormData();
        formData.append('document', file);
        formData.append('name', docName || file.name);

        try {
            await api.post(`/documents/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Document uploaded successfully');
            setShowUpload(false);
            setFile(null);
            setDocName('');
            fetchProjectData();
        } catch (error) {
            toast.error('Failed to upload document');
        }
    };

    const toggleDev = (userId) => {
        setSelectedDevs(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    if (loading) return <div className="p-8 text-center">Loading Project Details...</div>;
    if (!project) return null;

    const canManageTeam = user.role === 'Admin' || (user.role === 'Project Lead' && project.projectLead?._id === user._id);
    const canUpload = user.role === 'Admin' || (user.role === 'Project Lead' && project.projectLead?._id === user._id);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Button 
                onClick={() => navigate('/')}
                variant="back"
                className="mb-6"
            >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Project Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">{project.name}</h1>
                                <p className="text-slate-600 text-lg leading-relaxed">{project.description}</p>
                            </div>
                            <span className={`px-3 py-1 text-sm font-bold rounded-full ${
                                project.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                                {project.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <Calendar className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deadline</p>
                                    <p className="text-slate-900 font-medium">{new Date(project.deadline).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <Users className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Lead</p>
                                    <p className="text-slate-900 font-medium">{project.projectLead?.name || 'Unassigned'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documents Section */}
                    <Card className="documents-card">
                        <div className="documents-header">
                            <div className="section-title">
                                <FileText className="section-icon" />
                                <h2 className="section-heading">Project Documents</h2>
                            </div>
                            {canUpload && (
                                <Button
                                    onClick={() => setShowUpload(true)}
                                    variant="primary"
                                    size="medium"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Doc
                                </Button>
                            )}
                        </div>

                        {showUpload && (
                            <div className="upload-form-container">
                                <form onSubmit={handleFileUpload} className="upload-form">
                                    <div className="form-row">
                                        <input
                                            type="text"
                                            placeholder="Document Name (Optional)"
                                            className="form-input"
                                            value={docName}
                                            onChange={(e) => setDocName(e.target.value)}
                                        />
                                        <input
                                            type="file"
                                            className="file-input"
                                            onChange={(e) => setFile(e.target.files[0])}
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <Button type="button" variant="outline" size="small" onClick={() => setShowUpload(false)}>Cancel</Button>
                                        <Button type="submit" variant="primary" size="small">Upload</Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="documents-list">
                            {documents.map(doc => (
                                <div key={doc._id} className="document-item">
                                    <div className="document-info">
                                        <File className="document-icon" />
                                        <div className="document-details">
                                            <p className="document-name">{doc.name}</p>
                                            <p className="document-meta">Uploaded by {doc.uploadedBy?.name} on {new Date(doc.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <a
                                        href={`http://localhost:5000/${doc.filePath.replace(/\\/g, '/')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    >
                                        <Download className="download-icon" />
                                    </a>
                                </div>
                            ))}
                            {documents.length === 0 && (
                                <div className="empty-documents">
                                    <FileText className="empty-icon" />
                                    <p className="empty-text">No documents uploaded yet.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Team Assignment */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center space-x-2">
                                <Users className="h-6 w-6 text-indigo-600" />
                                <h2 className="text-xl font-bold text-slate-900">Project Team</h2>
                            </div>
                            {canManageTeam && (
                                <Button 
                                    onClick={() => setShowAssign(!showAssign)}
                                    variant="ghost"
                                    className="p-2"
                                >
                                    <UserPlus className="h-5 w-5" />
                                </Button>
                            )}
                        </div>

                        {showAssign ? (
                            <form onSubmit={handleAssign} className="assign-form space-y-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        <Users size={16} />
                                        Project Lead
                                    </label>
                                    <select 
                                        className="form-select"
                                        value={selectedLead}
                                        onChange={(e) => setSelectedLead(e.target.value)}
                                    >
                                        <option value="">Select Lead</option>
                                        {allUsers.filter(u => u.role === 'Project Lead' || u.role === 'Admin').map(u => (
                                            <option key={u._id} value={u._id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">
                                        <UserPlus size={16} />
                                        Assigned Developers
                                    </label>
                                    <div className="developers-selection-grid">
                                        {allUsers.filter(u => u.role === 'Developer').map(u => (
                                            <div 
                                                key={u._id} 
                                                className={`dev-selection-item ${selectedDevs.includes(u._id) ? 'selected' : ''}`}
                                                onClick={() => toggleDev(u._id)}
                                            >
                                                <div className="dev-info">
                                                    <div className={`dev-avatar ${selectedDevs.includes(u._id) ? 'active' : ''}`}>
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <span className="dev-name">{u.name}</span>
                                                </div>
                                                <div className={`selection-indicator ${selectedDevs.includes(u._id) ? 'checked' : ''}`}>
                                                    {selectedDevs.includes(u._id) && <CheckCircle size={14} />}
                                                </div>
                                            </div>
                                        ))}
                                        {allUsers.filter(u => u.role === 'Developer').length === 0 && (
                                            <p className="text-sm text-slate-500 italic p-4 text-center">No developers available</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button 
                                        type="submit" 
                                        variant="primary"
                                        className="flex-1"
                                    >
                                        Save Team
                                    </Button>
                                    <Button 
                                        type="button" 
                                        onClick={() => setShowAssign(false)} 
                                        variant="secondary"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Project Lead</p>
                                    {project.projectLead ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                                {project.projectLead.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-slate-900">{project.projectLead.name}</span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">No lead assigned</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-3 px-1">Assigned Developers</p>
                                    <div className="space-y-2">
                                        {project.assignedDevelopers?.map(dev => (
                                            <div key={dev._id} className="flex items-center space-x-2 px-1">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                                                    {dev.name.charAt(0)}
                                                </div>
                                                <span className="text-sm text-slate-700">{dev.name}</span>
                                            </div>
                                        ))}
                                        {project.assignedDevelopers?.length === 0 && (
                                            <p className="text-sm text-slate-500 italic px-1">No developers assigned</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;
