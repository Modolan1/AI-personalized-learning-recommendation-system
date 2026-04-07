import { userRepository } from '../repositories/userRepository.js';
import { activityRepository } from '../repositories/activityRepository.js';
import { generateToken } from '../utils/generateToken.js';
import { hashPassword, verifyPassword } from '../utils/hashPassword.js';
import { validatePassword } from '../utils/validatePassword.js';

export const authService = {
  async register(data) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new Error('User already exists');

    const passwordErrors = validatePassword(data.password);
    if (passwordErrors.length) throw new Error(passwordErrors.join(' '));

    const passwordHash = await hashPassword(data.password);
    const user = await userRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash,
      role: ['admin', 'instructor'].includes(data.role) ? data.role : 'student',
      learningGoal: data.learningGoal || '',
      skillLevel: data.skillLevel || 'Beginner',
      preferredSubject: data.preferredSubject || '',
      preferredLearningStyle: data.preferredLearningStyle || '',
      weeklyLearningGoalHours: data.weeklyLearningGoalHours || 5,
    });

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
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('Invalid email or password');

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) throw new Error('Invalid email or password');

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
};
