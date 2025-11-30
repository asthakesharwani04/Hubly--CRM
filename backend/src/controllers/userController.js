import User from '../models/User.js';
import Ticket from '../models/Ticket.js';
import { USER_ROLES } from '../config/constants.js';

// Get all team members
// @route   GET /api/users
// @access  Private
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Get single user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

// @desc    Create new team member (Admin only)
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Prevent creating another admin if one exists
    if (role === USER_ROLES.ADMIN) {
      const adminExists = await User.findOne({ role: USER_ROLES.ADMIN });
      if (adminExists) {
        return res.status(400).json({
          success: false,
          message: 'Admin account already exists'
        });
      }
    }

    // Create user with default password if not provided
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || '',
      password: password || 'password123', // Default password - should be changed
      role: role || USER_ROLES.MEMBER
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('✅ Team member created:', user._id, user.email);

    res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('❌ Failed to create user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
};

// Update team member (Admin only, or self for limited fields)
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, phone, role } = req.body;
    const userId = req.params.id;
    const requestingUser = req.user;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permissions
    const isAdmin = requestingUser.role === USER_ROLES.ADMIN;
    const isSelf = requestingUser._id.toString() === userId;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    // Members can only update their own name
    if (!isAdmin && isSelf) {
      if (role) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to change role'
        });
      }
    }

    // Prevent changing admin's role if they're the only admin
    if (user.role === USER_ROLES.ADMIN && role && role !== USER_ROLES.ADMIN) {
      const adminCount = await User.countDocuments({ role: USER_ROLES.ADMIN });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot change role. At least one admin must exist.'
        });
      }
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (role && isAdmin) user.role = role;

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('✅ User updated:', user._id);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('❌ Failed to update user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// Delete team member (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const requestingUser = req.user;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting admin
    if (user.role === USER_ROLES.ADMIN) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin account'
      });
    }

    // Prevent self-deletion
    if (requestingUser._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // ✅ Find admin to reassign tickets
    const admin = await User.findOne({ role: USER_ROLES.ADMIN });
    
    if (!admin) {
      return res.status(500).json({
        success: false,
        message: 'Cannot delete user: No admin account found to reassign tickets'
      });
    }

    // ✅ Count tickets that will be reassigned
    const ticketCount = await Ticket.countDocuments({ assignedTo: userId });
    
    console.log(`🔄 Reassigning ${ticketCount} tickets from user ${userId} to admin ${admin._id}`);

    // ✅ Reassign all tickets from deleted user to admin
    const updateResult = await Ticket.updateMany(
      { assignedTo: userId },
      { assignedTo: admin._id }
    );

    console.log(`✅ Reassigned ${updateResult.modifiedCount} tickets to admin`);

    // Delete the user
    await User.findByIdAndDelete(userId);

    console.log(`✅ User deleted: ${user.email} (${userId})`);

    res.status(200).json({
      success: true,
      message: ticketCount > 0 
        ? `User deleted successfully. ${ticketCount} ticket(s) reassigned to admin.`
        : 'User deleted successfully.',
      ticketsReassigned: ticketCount
    });
  } catch (error) {
    console.error('❌ Failed to delete user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};