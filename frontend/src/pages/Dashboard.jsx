import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    Plus,
    Briefcase,
    Users,
    Calendar,
    CheckCircle,
    Clock,
    ArrowRight,
    Trash2,
    UserPlus,
    Info,
    Folder,
    Eye,
    ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [myProjects, setMyProjects] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form states for Admin
    const [showAddProject, setShowAddProject] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '', deadline: '' });
    
    // Form states for User Management (Admin)
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Developer' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [projectsRes, usersRes] = await Promise.all([
                api.get('/projects'),
                user.role === 'Admin' ? api.get('/auth/users') : Promise.resolve({ data: { data: [] } })
            ]);
            
            // Process data for display
            const allProjects = projectsRes.data.data || projectsRes.data;
            setProjects(allProjects);
            
            // "My Projects" are projects where the user is either the Lead or an Assigned Developer
            const assigned = allProjects.filter(p => 
                p.projectLead?._id === user._id || 
                p.assignedDevelopers?.some(d => d._id === user._id)
            );
            setMyProjects(assigned);

            setAllUsers(usersRes.data.data || usersRes.data);
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await api.post('/projects', newProject);
            toast.success('Project created successfully');
            setShowAddProject(false);
            setNewProject({ name: '', description: '', deadline: '' });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create project');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', newUser);
            toast.success('User registered successfully');
            setShowAddUser(false);
            setNewUser({ name: '', email: '', password: '', role: 'Developer' });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to register user');
        }
    };

    const handleCompleteProject = async (id) => {
        try {
            await api.put(`/projects/${id}/complete`);
            toast.success('Project marked as completed');
            fetchData();
        } catch (error) {
            toast.error('Failed to update project');
        }
    };

    const handleDeleteProject = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        try {
            await api.delete(`/projects/${id}`);
            toast.success('Project deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete project');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="header-info">
                    <h1 className="header-title">Welcome, {user.name}</h1>
                    <p className="header-subtitle">Role: {user.role}</p>
                </div>
                <div className="dashboard-actions">
                        <Link to="/guide" className="guide-link">
                            <Info size={18} />
                            How it works
                        </Link>
                        {user.role === 'Admin' && (
                            <>
                                <Button
                                    onClick={() => setShowAddUser(true)}
                                    variant="secondary"
                                    className="action-btn"
                                >
                                    <UserPlus size={20} />
                                    Add User
                                </Button>
                                <Button
                                    onClick={() => setShowAddProject(true)}
                                    className="action-btn"
                                >
                                    <Plus size={20} />
                                    New Project
                                </Button>
                            </>
                        )}
                    </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-header">
                        <Folder size={24} />
                        <span className="stat-label">All Active</span>
                    </div>
                    <h3 className="stat-value">{projects.filter(p => p.status === 'Active').length}</h3>
                    <p className="stat-desc">System Projects</p>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <Briefcase size={24} className="stat-icon" />
                        <span className="stat-label">Assigned</span>
                    </div>
                    <h3 className="stat-value">{myProjects.length}</h3>
                    <p className="stat-desc">My Projects</p>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <CheckCircle size={24} className="stat-icon" />
                        <span className="stat-label">Completed</span>
                    </div>
                    <h3 className="stat-value">{projects.filter(p => p.status === 'Completed').length}</h3>
                    <p className="stat-desc">Total Completed</p>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <Users size={24} className="stat-icon" />
                        <span className="stat-label">Team</span>
                    </div>
                    <h3 className="stat-value">{allUsers.length}</h3>
                    <p className="stat-desc">Total Members</p>
                </div>
            </div>

            {/* Role Helper Banner */}
            <div className="mb-12 bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex items-start gap-4">
                <div className="bg-white p-3 rounded-xl shadow-sm text-indigo-600">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-indigo-900 mb-1">Your Role: {user.role}</h2>
                    <p className="text-indigo-700 text-sm mb-4">
                        {user.role === 'Admin' && "As an Admin, you have full control over projects, users, and system settings."}
                        {user.role === 'Project Lead' && "As a Project Lead, you can manage team assignments and project documentation for your leads."}
                        {user.role === 'Developer' && "As a Developer, you can view all active projects and access resources for your assigned tasks."}
                    </p>
                    <Link to="/guide" className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1">
                        View Full Functionality Guide <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

            {/* Admin: User Management Modal */}
            {user.role === 'Admin' && showAddUser && (
                <div className="dashboard-modal">
                    <h2 className="modal-title">Register New Team Member</h2>
                    <form onSubmit={handleCreateUser} className="user-form">
                        <div className="form-row">
                            <input
                                type="text"
                                placeholder="Full Name"
                                required
                                className="form-input"
                                value={newUser.name}
                                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                required
                                className="form-input"
                                value={newUser.email}
                                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                            />
                        </div>
                        <div className="form-row">
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                className="form-input"
                                value={newUser.password}
                                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                            />
                            <select
                                className="form-select"
                                value={newUser.role}
                                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                            >
                                <option value="Developer">Developer</option>
                                <option value="Project Lead">Project Lead</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                        <div className="form-actions">
                            <Button type="submit" variant="primary" size="medium">Add User</Button>
                            <Button type="button" variant="outline" size="medium" onClick={() => setShowAddUser(false)}>Cancel</Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Admin: Create Project Form */}
            {user.role === 'Admin' && showAddProject && (
                <div className="mb-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold mb-4">Create New Project</h2>
                    <form onSubmit={handleCreateProject} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Project Name"
                                required
                                className="p-2 border rounded-lg"
                                value={newProject.name}
                                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                            />
                            <input
                                type="date"
                                required
                                className="p-2 border rounded-lg"
                                value={newProject.deadline}
                                onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                            />
                        </div>
                        <textarea
                            placeholder="Description"
                            required
                            className="w-full p-2 border rounded-lg"
                            rows="3"
                            value={newProject.description}
                            onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                        ></textarea>
                        <div className="flex justify-end space-x-3">
                            <button type="button" onClick={() => setShowAddProject(false)} className="px-4 py-2 text-slate-500 font-medium">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium">Create Project</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="projects-section">
                <div className="section-header">
                    <h2 className="section-title">
                        {user.role === 'Admin' ? 'Projects Requiring Lead Assignment' : 'My Assigned Projects'}
                    </h2>
                </div>
                <div className="projects-grid">
                    {(user.role === 'Admin' ? projects.filter(p => !p.projectLead) : myProjects).map((project) => (
                        <Link key={project._id} to={`/projects/${project._id}`} className="project-link">
                            <div className="project-card">
                                <div className="project-header">
                                    <div className={`project-icon ${project.status === 'Completed' ? 'completed' : 'active'}`}>
                                        <Folder size={20} />
                                    </div>
                                    <span className={`project-status ${project.status.toLowerCase()}`}>
                                        {project.status}
                                    </span>
                                </div>
                                <h3 className="project-title">
                                    {project.name}
                                </h3>
                                <p className="project-description">
                                    {project.description}
                                </p>
                                <div className="project-footer">
                                    <div className="project-meta">
                                        <Calendar size={14} />
                                        {new Date(project.deadline).toLocaleDateString()}
                                    </div>
                                    <div className="developer-avatars">
                                        {project.assignedDevelopers?.slice(0, 3).map((dev, i) => (
                                            <div key={i} className="avatar" title={dev.name}>
                                                {dev.name.charAt(0)}
                                            </div>
                                        ))}
                                        {project.assignedDevelopers?.length > 3 && (
                                            <div className="avatar more">
                                                +{project.assignedDevelopers.length - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                {(user.role === 'Admin' ? projects.filter(p => !p.projectLead).length === 0 : myProjects.length === 0) && (
                    <div className="empty-state">
                        <Briefcase className="empty-icon" />
                        <h3 className="empty-title">
                            {user.role === 'Admin' ? 'All projects have leads' : 'No projects assigned'}
                        </h3>
                        <p className="empty-text">
                            {user.role === 'Admin' ? 'Great job managing the team!' : "You haven't been assigned to any projects yet."}
                        </p>
                    </div>
                )}
            </div>

            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">All Active Projects</h2>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Project Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Deadline</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {projects.filter(p => p.status === 'Active').map((project) => (
                                <tr key={project._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{project.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase">
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {new Date(project.deadline).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link 
                                                to={`/projects/${project._id}`}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </Link>
                                            {user.role === 'Admin' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleCompleteProject(project._id)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Mark Completed"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteProject(project._id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Project"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Management Section (Admin Only) */}
            {user.role === 'Admin' && (
                <div className="table-section">
                    <div className="section-header">
                        <h2 className="section-title">Team Management</h2>
                    </div>
                    <div className="data-table">
                        <div className="table-header">
                            <div className="table-cell">Name</div>
                            <div className="table-cell">Email</div>
                            <div className="table-cell">Role</div>
                            <div className="table-cell">MFA</div>
                        </div>
                        <div className="table-body">
                            {allUsers.map((u) => (
                                <div key={u._id} className="table-row">
                                    <div className="table-cell">
                                        <span className="user-name">{u.name}</span>
                                    </div>
                                    <div className="table-cell">
                                        <span className="user-email">{u.email}</span>
                                    </div>
                                    <div className="table-cell">
                                        <span className={`role-badge ${u.role.toLowerCase().replace(' ', '-')}`}>
                                            {u.role}
                                        </span>
                                    </div>
                                    <div className="table-cell">
                                        {u.isMfaEnabled ? (
                                            <span className="mfa-status enabled">
                                                <ShieldCheck size={16} />
                                                Enabled
                                            </span>
                                        ) : (
                                            <span className="mfa-status disabled">Disabled</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
