import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Check if we should use mock database mode first
    if (process.env.USE_MOCK_DB === 'true') {
      console.log('🔄 Using mock database mode (MongoDB connection skipped)');
      console.log('📝 Mock users available - admin@example.com (admin123) and user@example.com (user123)');
      
      // Set mongoose to disconnected state to prevent any actual database operations
      mongoose.connection.readyState = 0;
      
      // Return a mock connection object that indicates we're in mock mode
      return { 
        connection: { 
          host: 'mock-database', 
          readyState: 1,
          isMockMode: true 
        } 
      };
    }

    // Only attempt MongoDB connection if not in mock mode
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/financial-dashboard';
    
    console.log(`Attempting to connect to MongoDB at: ${mongoURI}`);
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Create default admin user if it doesn't exist
    await createDefaultUsers();
    return conn;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('💥 Failed to connect to MongoDB. Please ensure MongoDB is running on localhost:27017');
    console.error('💡 You can start MongoDB with: mongod --dbpath /path/to/your/db');
    console.error('💡 Or set USE_MOCK_DB=true in server/.env to use mock data');
    process.exit(1);
  }
};

const createDefaultUsers = async () => {
  try {
    // Skip user creation in mock mode
    if (process.env.USE_MOCK_DB === 'true') {
      console.log('📝 Skipping default user creation in mock mode');
      return;
    }

    const User = (await import('../models/User.js')).default;
    
    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    if (!adminExists) {
      await User.create({
        name: 'John Admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
      });
      console.log('👤 Default admin user created: admin@example.com / admin123');
    }

    // Check if regular user exists
    const userExists = await User.findOne({ email: 'user@example.com' });
    
    if (!userExists) {
      await User.create({
        name: 'Jane User',
        email: 'user@example.com',
        password: 'user123',
        role: 'user',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
      });
      console.log('👤 Default user created: user@example.com / user123');
    }
  } catch (error) {
    console.error('❌ Error creating default users:', error);
  }
};

export default connectDB;