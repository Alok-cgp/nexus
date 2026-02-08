const mongoose = require('mongoose');
const User = require('./models/User');
const Admin = require('./models/Admin');
const dotenv = require('dotenv');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const adminExists = await Admin.findOne({ role: 'Admin' });
        
        if (!adminExists) {
            const admin = new Admin({
                name: 'System Admin',
                email: 'admin@pixelforge.com',
                password: 'AdminPassword123!',
                role: 'Admin'
            });
            await admin.save();
            console.log('Admin user created successfully in Admin collection!');
            console.log('Email: admin@pixelforge.com');
            console.log('Password: AdminPassword123!');
        } else {
            console.log('Admin user already exists in Admin collection.');
        }
        
        // Optionally clean up old Admin from User collection if it exists
        await User.deleteOne({ role: 'Admin' });
        
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
