require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  fullName: String,
  idNumber: String,
  accountNumber: String,
  username: String,
  password: String,
  role: String,
  isActive: Boolean,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

async function createEmployee() {
  try {
    console.log('Creating employee account...');
    
    // Check if employee already exists
    const existingEmployee = await User.findOne({ username: 'employee1' });
    if (existingEmployee) {
      console.log('❌ Employee account already exists!');
      process.exit(1);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('Employee123!', salt);
    
    // Create employee
    await User.create({
      fullName: "Bank Employee",
      idNumber: "8001015009087",
      accountNumber: "9876543210",
      username: "employee1",
      password: hashedPassword,
      role: "employee",
      isActive: true,
      createdAt: new Date()
    });
    
    console.log('✅ Employee created successfully!');
    console.log('\nLogin credentials:');
    console.log('Username: employee1');
    console.log('Account Number: 9876543210');
    console.log('Password: Employee123!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating employee:', error);
    process.exit(1);
  }
}

// Run the function
createEmployee();
