import User from '../models/User.js';

export const userRepository = {
  create: (data) => User.create(data),
  findByEmail: (email) => User.findOne({ email }),
  findById: (id) => User.findById(id).select('-passwordHash'),
  findStudentById: (id) => User.findOne({ _id: id, role: 'student' }).select('-passwordHash'),
  findStudents: () => User.find({ role: 'student' }).select('-passwordHash').sort({ createdAt: -1 }),
  updateById: (id, data) => User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select('-passwordHash'),
};
