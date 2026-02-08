import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    Lock,
    ShieldCheck,
    Smartphone,
    CheckCircle2,
    XCircle,
    User
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import './Settings.css';

const Settings = () => {
    const { user, setUser } = useAuth();
    
    // Password state
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [passLoading, setPassLoading] = useState(false);
    
    // MFA state
    const [mfaData, setMfaData] = useState(null);
    const [mfaToken, setMfaToken] = useState('');
    const [mfaLoading, setMfaLoading] = useState(false);

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return toast.error('Passwords do not match');
        }
        
        setPassLoading(true);
        try {
            await api.put('/auth/password', {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            toast.success('Password updated successfully');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setPassLoading(false);
        }
    };

    const setupMFA = async () => {
        setMfaLoading(true);
        try {
            const { data } = await api.post('/auth/mfa/setup');
            setMfaData(data);
        } catch (error) {
            toast.error('Failed to initiate MFA setup');
        } finally {
            setMfaLoading(false);
        }
    };

    const verifyMFA = async (e) => {
        e.preventDefault();
        setMfaLoading(true);
        try {
            await api.post('/auth/mfa/verify', { token: mfaToken });
            toast.success('MFA enabled successfully');
            setMfaData(null);
            setMfaToken('');
            
            // Update user state
            const updatedUser = { ...user, isMfaEnabled: true };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
            toast.error('Invalid MFA token');
        } finally {
            setMfaLoading(false);
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h1 className="settings-title">Account Settings</h1>
                <p className="settings-subtitle">Manage your account security and preferences</p>
            </div>

            <div className="settings-content">
                {/* Security Section */}
                <Card className="settings-card">
                    <div className="card-header">
                        <div className="header-icon">
                            <Lock className="icon" />
                        </div>
                        <h2 className="card-title">Security & Password</h2>
                    </div>
                    <div className="card-content">
                        <form onSubmit={handlePasswordUpdate} className="password-form">
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <input
                                    type="password"
                                    required
                                    className="form-input"
                                    value={passwords.current}
                                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input
                                    type="password"
                                    required
                                    className="form-input"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    className="form-input"
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                />
                            </div>
                            <Button
                                type="submit"
                                variant="primary"
                                size="medium"
                                loading={passLoading}
                                className="update-btn"
                            >
                                {passLoading ? 'Updating...' : 'Update Password'}
                            </Button>
                        </form>
                    </div>
                </Card>

                {/* MFA Section */}
                <Card className="settings-card">
                    <div className="card-header">
                        <div className="header-icon">
                            <ShieldCheck className="icon" />
                        </div>
                        <h2 className="card-title">Multi-Factor Authentication</h2>
                    </div>
                    <div className="card-content">
                        {user.isMfaEnabled ? (
                            <div className="mfa-status enabled">
                                <div className="status-icon">
                                    <CheckCircle2 className="icon" />
                                </div>
                                <div className="status-content">
                                    <h3 className="status-title">MFA is Enabled</h3>
                                    <p className="status-text">Your account is protected with an extra layer of security.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="mfa-setup">
                                <div className="mfa-status disabled">
                                    <div className="status-icon">
                                        <XCircle className="icon" />
                                    </div>
                                    <div className="status-content">
                                        <h3 className="status-title">MFA is Disabled</h3>
                                        <p className="status-text">Enable MFA to significantly boost your account security.</p>
                                    </div>
                                </div>

                                {!mfaData ? (
                                    <Button
                                        onClick={setupMFA}
                                        variant="primary"
                                        size="large"
                                        loading={mfaLoading}
                                        className="setup-btn"
                                    >
                                        <Smartphone className="btn-icon" />
                                        Setup Authenticator App
                                    </Button>
                                ) : (
                                    <div className="mfa-verification">
                                        <div className="qr-section">
                                            <div className="qr-container">
                                                <img src={mfaData.qrCodeUrl} alt="QR Code" className="qr-code" />
                                            </div>
                                            <div className="qr-instructions">
                                                <h3 className="qr-title">Scan this QR Code</h3>
                                                <p className="qr-text">Scan this code with Google Authenticator or any TOTP app. Then enter the 6-digit code below to verify.</p>
                                                <div className="secret-key">
                                                    Secret Key: {mfaData.secret}
                                                </div>
                                            </div>
                                        </div>

                                        <form onSubmit={verifyMFA} className="verification-form">
                                            <div className="code-input-group">
                                                <label className="form-label">Enter 6-digit Code</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="000000"
                                                    className="code-input"
                                                    value={mfaToken}
                                                    onChange={(e) => setMfaToken(e.target.value)}
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                variant="secondary"
                                                size="medium"
                                                loading={mfaLoading}
                                                className="verify-btn"
                                            >
                                                Verify & Enable
                                            </Button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
