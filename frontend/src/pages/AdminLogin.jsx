import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Layout, Lock, Mail, ShieldCheck, ShieldAlert } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import './Login.css'; // Reuse the same CSS

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mfaToken, setMfaToken] = useState('');
    const [mfaRequired, setMfaRequired] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login, logout } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await login(email, password, mfaRequired ? mfaToken : null, 'Admin');
            if (data?.mfaRequired) {
                setMfaRequired(true);
                toast.success('Please enter MFA token');
            } else {
                toast.success('Admin login successful');
                navigate('/');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container admin-theme">
            <div className="login-background">
                <div className="login-bg-shape shape-1" style={{ background: 'rgba(124, 58, 237, 0.2)' }}></div>
                <div className="login-bg-shape shape-2" style={{ background: 'rgba(139, 92, 246, 0.2)' }}></div>
                <div className="login-bg-shape shape-3" style={{ background: 'rgba(167, 139, 250, 0.2)' }}></div>
            </div>

            <div className="login-content">
                <Card className="login-card border-t-4 border-indigo-600">
                    <div className="login-header">
                        <div className="login-logo bg-indigo-600">
                            <ShieldAlert className="login-logo-icon text-white" />
                        </div>
                        <h1 className="login-title">Nexus Admin</h1>
                        <p className="login-subtitle">Administrative Control Portal</p>

                        <div className="login-security-badge bg-indigo-50 text-indigo-700">
                            <ShieldCheck className="security-icon" />
                            <span className="security-text">Restricted Administrator Access</span>
                        </div>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        {!mfaRequired ? (
                            <div className="login-fields">
                                <div className="form-group">
                                    <div className="label-wrapper">
                                        <Mail className="label-icon" />
                                        <label className="form-label">Admin Email</label>
                                    </div>
                                    <div className="input-wrapper">
                                        <input
                                            type="email"
                                            required
                                            className="form-input"
                                            placeholder="admin@pixelforge.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <div className="label-wrapper">
                                        <Lock className="label-icon" />
                                        <label className="form-label">Password</label>
                                    </div>
                                    <div className="input-wrapper">
                                        <input
                                            type="password"
                                            required
                                            className="form-input"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="form-group">
                                <div className="label-wrapper">
                                    <ShieldCheck className="label-icon" />
                                    <label className="form-label">MFA Token</label>
                                </div>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        required
                                        className="form-input"
                                        placeholder="6-digit code"
                                        value={mfaToken}
                                        onChange={(e) => setMfaToken(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            size="large"
                            loading={loading}
                            className="login-submit-btn bg-indigo-600 hover:bg-indigo-700"
                        >
                            {loading ? 'Authenticating...' : mfaRequired ? 'Verify & Sign In' : 'Admin Sign In'}
                        </Button>

                        <div className="mt-6 text-center">
                            <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                                Not an admin? Use the User Portal
                            </Link>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default AdminLogin;