const bcrypt = require('bcryptjs');
const db = require('../models');
const User = db.user;

/**
 * Seed script to create default users for testing
 */
async function seedUsers() {
  try {
    // Check if users already exist
    const existingUsers = await User.count();
    if (existingUsers > 0) {
      console.log('Users already exist in the database. Skipping seed.');
      return;
    }

    // Generate salt for password hashing
    const salt = await bcrypt.genSalt(10);
    
    // Create default users
    const users = [
      {
        username: 'admin',
        email: 'admin@aeromaintenance.com',
        password: await bcrypt.hash('password123', salt),
        firstName: 'Admin',
        lastName: 'User',
        role: 'administrator',
        specialization: 'System Administration',
        certifications: ['System Management'],
        lastLogin: new Date()
      },
      {
        username: 'engineer1',
        email: 'engineer@aeromaintenance.com',
        password: await bcrypt.hash('password123', salt),
        firstName: 'Michael',
        lastName: 'Johnson',
        role: 'engineer',
        specialization: 'Propulsion Systems',
        certifications: ['A320 Type Rating', 'Engine Maintenance Specialist'],
        lastLogin: new Date()
      },
      {
        username: 'technician1',
        email: 'technician@aeromaintenance.com',
        password: await bcrypt.hash('password123', salt),
        firstName: 'Sarah',
        lastName: 'Williams',
        role: 'technician',
        specialization: 'Avionics',
        certifications: ['Avionics Technician', 'Electrical Systems'],
        lastLogin: new Date()
      }
    ];

    // Insert users into database
    await User.bulkCreate(users);
    
    console.log('Default users created successfully!');
    console.log('You can login with:');
    console.log('- admin@aeromaintenance.com / password123 (Administrator)');
    console.log('- engineer@aeromaintenance.com / password123 (Engineer)');
    console.log('- technician@aeromaintenance.com / password123 (Technician)');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

// Run the seed function
seedUsers();
