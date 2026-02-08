import React from 'react';
import {
    CheckCircle2,
    Users,
    FileText,
    Shield,
    UserPlus,
    Upload,
    Eye
} from 'lucide-react';
import Card from '../components/Card';
import './FunctionalityGuide.css';

const FunctionalityGuide = () => {
    const sections = [
        {
            title: "1. Project Management",
            icon: <CheckCircle2 className="h-6 w-6 text-indigo-600" />,
            items: [
                {
                    label: "Add/Remove Projects",
                    desc: "Admins can add new game projects (name, description, deadline) and mark them as 'Completed'.",
                    roles: ["Admin"]
                },
                {
                    label: "View Projects",
                    desc: "All users can view a list of active projects in the system.",
                    roles: ["Admin", "Project Lead", "Developer"]
                }
            ]
        },
        {
            title: "2. Team Assignment",
            icon: <Users className="h-6 w-6 text-indigo-600" />,
            items: [
                {
                    label: "Assign Team Members",
                    desc: "Project Leads and Admins can assign developers to specific projects.",
                    roles: ["Admin", "Project Lead"]
                },
                {
                    label: "View Assigned Projects",
                    desc: "Developers see a personalized list of projects they are currently assigned to.",
                    roles: ["Developer"]
                }
            ]
        },
        {
            title: "3. Asset & Resource Management",
            icon: <FileText className="h-6 w-6 text-indigo-600" />,
            items: [
                {
                    label: "Upload Project Documents",
                    desc: "Admins and Project Leads can upload design docs, meeting notes, etc.",
                    roles: ["Admin", "Project Lead"]
                },
                {
                    label: "View Documents",
                    desc: "All users assigned to a project can view its uploaded documents.",
                    roles: ["Admin", "Project Lead", "Developer"]
                }
            ]
        }
    ];

    return (
        <div className="guide-container">
            <header className="guide-header">
                <h1 className="guide-title">System Functionality Guide</h1>
                <p className="guide-subtitle">Understand your role and available features within PixelForge Nexus.</p>
            </header>

            <div className="guide-content">
                {sections.map((section, idx) => (
                    <div key={idx} className="guide-section">
                        <div className="section-header">
                            {section.icon}
                            <h2 className="section-title">{section.title}</h2>
                        </div>

                        <div className="section-content">
                            {section.items.map((item, itemIdx) => (
                                <div key={itemIdx} className="guide-item">
                                    <div className="item-header">
                                        <h3 className="item-title">{item.label}</h3>
                                        <div className="role-badges">
                                            {item.roles.map(role => (
                                                <span key={role} className="role-badge">
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="item-description">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <footer className="guide-footer">
                <div className="footer-content">
                    <Shield className="footer-icon" />
                    <div className="footer-text">
                        <h3 className="footer-title">Security Note</h3>
                        <p className="footer-description">
                            Access to specific projects and documents is strictly enforced via Role-Based Access Control (RBAC).
                            Sensitive data like project descriptions are encrypted at rest.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default FunctionalityGuide;
