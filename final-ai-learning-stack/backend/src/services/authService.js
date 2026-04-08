import { userRepository } from '../repositories/userRepository.js';
import { activityRepository } from '../repositories/activityRepository.js';
import { courseRepository } from '../repositories/courseRepository.js';
import { generateToken } from '../utils/generateToken.js';
import { hashPassword, verifyPassword } from '../utils/hashPassword.js';
import { validatePassword } from '../utils/validatePassword.js';

export const authService = {
  listPublishedCourses: () => courseRepository.findAllPublished(),

  async register(data) {
    const existing = await userRepository.findByEmail(String(data.email));
    if (existing) throw new Error('User already exists');

    const passwordErrors = validatePassword(data.password);
    if (passwordErrors.length) throw new Error(passwordErrors.join(' '));

    const passwordHash = await hashPassword(data.password);
    const isInstructor = data.role === 'instructor';
    const user = await userRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash,
      role: isInstructor ? 'instructor' : 'student',
      status: isInstructor ? 'pending' : 'active',
      learningGoal: data.learningGoal || '',
      skillLevel: data.skillLevel || 'Beginner',
      preferredSubject: data.preferredSubject || '',
      preferredLearningStyle: data.preferredLearningStyle || '',
      weeklyLearningGoalHours: data.weeklyLearningGoalHours || 5,
    });

    if (isInstructor) {
      return {
        pendingApproval: true,
        message: 'Instructor registration submitted. Your account will be active after admin approval.',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      };
    }

    return {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        skillLevel: user.skillLevel,
      },
      token: generateToken(user),
    };
  },

  async login(email, password) {
    const user = await userRepository.findByEmail(String(email));
    if (!user) throw new Error('Invalid email or password');

    const valid = await verifyPassword(String(password), user.passwordHash);
    if (!valid) throw new Error('Invalid email or password');

    if (user.role === 'instructor' && user.status !== 'active') {
      const pendingError = new Error('Instructor account is pending admin approval. Please wait for approval.');
      pendingError.statusCode = 403;
      throw pendingError;
    }

    if (user.role === 'student') {
      await activityRepository.create({
        student: user._id,
        activityType: 'login',
        resourceType: 'system',
        metadata: { note: 'User logged in' },
      });
    }

    return {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        skillLevel: user.skillLevel,
      },
      token: generateToken(user),
    };
  },

  async createAdmin(creatingAdminId, data) {
    // Verify creating user is an admin
    const creatingAdmin = await userRepository.findById(creatingAdminId);
    if (!creatingAdmin || creatingAdmin.role !== 'admin') {
      throw new Error('Only admins can create other admins');
    }

    // Prevent self-creation by email
    if (String(creatingAdmin.email).toLowerCase() === String(data.email).toLowerCase()) {
      throw new Error('Cannot create yourself as an admin');
    }

    // Check existing email
    const existing = await userRepository.findByEmail(String(data.email));
    if (existing) throw new Error('User already exists');

    // Validate password
    const passwordErrors = validatePassword(data.password);
    if (passwordErrors.length) throw new Error(passwordErrors.join(' '));

    // Create admin with hashed password
    const passwordHash = await hashPassword(data.password);
    const newAdmin = await userRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash,
      role: 'admin',
      createdBy: creatingAdminId,
      learningGoal: '',
      skillLevel: 'Beginner',
      preferredSubject: '',
      preferredLearningStyle: '',
      weeklyLearningGoalHours: 0,
    });

    return {
      user: {
        id: newAdmin._id,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    };
  },

  async updatePassword(userId, oldPassword, newPassword) {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) throw new Error('User not found');

    // Verify old password
    const valid = await verifyPassword(String(oldPassword), user.passwordHash);
    if (!valid) throw new Error('Current password is incorrect');

    // Validate new password
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length) throw new Error(passwordErrors.join(' '));

    // Update password
    const newHash = await hashPassword(newPassword);
    const updated = await userRepository.updateById(userId, { passwordHash: newHash });
    return { success: true, message: 'Password updated successfully' };
  },
};
