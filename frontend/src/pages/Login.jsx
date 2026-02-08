import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Mail, Lock, ShieldCheck, User, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mfaToken, setMfaToken] = useState('');
    const [mfaRequired, setMfaRequired] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userType, setUserType] = useState('User');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await login(email, password, mfaRequired ? mfaToken : null, userType);
            if (data?.mfaRequired) {
                setMfaRequired(true);
                toast.success('Please enter MFA token');
            } else {
                toast.success('Login successful');
                navigate('/');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="login-bg-shape shape-1"></div>
                <div className="login-bg-shape shape-2"></div>
                <div className="login-bg-shape shape-3"></div>
            </div>

            <div className="login-content">
                <div className="user-type-selector">
                    <button 
                        className={`selector-btn ${userType === 'User' ? 'active' : ''}`}
                        onClick={() => setUserType('User')}
                    >
                        <User className="selector-icon" />
                        Team Member
                    </button>
                    <button 
                        className={`selector-btn ${userType === 'Admin' ? 'active' : ''}`}
                        onClick={() => setUserType('Admin')}
                    >
                        <ShieldCheck className="selector-icon" />
                        Administrator
                    </button>
                </div>

                <Card className={`login-card ${userType === 'Admin' ? 'admin-theme' : ''}`}>
                    <div className="login-header">
                        <div className="login-logo">
                            {userType === 'Admin' ? <ShieldCheck className="login-logo-icon" /> : <User className="login-logo-icon" />}
                        </div>
                        <h1 className="login-title">{userType === 'Admin' ? 'Admin Portal' : 'User Portal'}</h1>
                        <p className="login-subtitle">
                            {userType === 'Admin' ? 'Secure Administrator Access' : 'Project Lead & Developer Access'}
                        </p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        {!mfaRequired ? (
                            <div className="login-fields">
                                <div className="form-group">
                                    <div className="label-wrapper">
                                        <Mail className="label-icon" />
                                        <label className="form-label">Email Address</label>
                                    </div>
                                    <div className="input-wrapper">
                                        <input
                                            type="email"
                                            required
                                            className="form-input"
                                            placeholder="developer@example.com"
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
                                <p className="form-hint">Enter the code from your authenticator app</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            size="large"
                            loading={loading}
                            className="login-submit-btn"
                        >
                            {loading ? 'Processing...' : mfaRequired ? 'Verify & Sign In' : 'Sign In'}
                        </Button>

                        {userType === 'User' && (
                            <div className="login-footer">
                                <p>Don't have an account? <Link to="/signup">Create Account</Link></p>
                            </div>
                        )}
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Login;
