import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout, LogOut, Settings, User as UserIcon } from 'lucide-react';
import Button from './Button';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="bg-white shadow-sm border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <Layout className="h-8 w-8 text-indigo-600" />
                            <span className="text-xl font-bold text-slate-900">PixelForge Nexus</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 px-3 py-1 bg-slate-100 rounded-full">
                            <UserIcon className="h-4 w-4 text-slate-500" />
                            <span className="text-sm font-medium text-slate-700">{user.name} ({user.role})</span>
                        </div>
                        
                        <Link to="/settings" className="p-2 text-slate-500 hover:text-indigo-600 transition-colors">
                            <Settings className="h-5 w-5" />
                        </Link>

                        <Button 
                            onClick={handleLogout}
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50"
                            size="small"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
