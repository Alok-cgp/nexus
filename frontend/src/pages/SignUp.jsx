import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, ShieldCheck, ArrowLeft, Briefcase } from 'lucide-react';
import api from '../utils/api';
import Button from '../components/Button';
import Card from '../components/Card';
import './Login.css'; // Reuse Login styles

const SignUp = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Developer'
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { name, email, password, confirmPassword, role } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }

        setLoading(true);
        try {
            await api.post('/auth/register', { name, email, password, role });
            toast.success('Account created successfully! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
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
                <Card className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <User className="login-logo-icon" />
                        </div>
                        <h1 className="login-title">Create Account</h1>
                        <p className="login-subtitle">Join the PixelForge Nexus community</p>

                        <div className="login-security-badge">
                            <ShieldCheck className="security-icon" />
                            <span className="security-text">Secure Professional Registration</span>
                        </div>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="login-fields">
                            <div className="form-group">
                                <div className="label-wrapper">
                                    <User className="label-icon" />
                                    <label className="form-label">Full Name</label>
                                </div>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="form-input"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={onChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="label-wrapper">
                                    <Mail className="label-icon" />
                                    <label className="form-label">Email Address</label>
                                </div>
                                <div className="input-wrapper">
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="form-input"
                                        placeholder="john@example.com"
                                        value={email}
                                        onChange={onChange}
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
                                        name="password"
                                        required
                                        className="form-input"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={onChange}
                                        minLength="6"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="label-wrapper">
                                    <Lock className="label-icon" />
                                    <label className="form-label">Confirm Password</label>
                                </div>
                                <div className="input-wrapper">
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        required
                                        className="form-input"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={onChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full mt-6 py-3 text-lg"
                            loading={loading}
                        >
                            Create Account
                        </Button>

                        <div className="mt-6 text-center">
                            <Link to="/login" className="text-gray-500 hover:text-indigo-600 flex items-center justify-center gap-2">
                                <ArrowLeft size={16} />
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default SignUp;
