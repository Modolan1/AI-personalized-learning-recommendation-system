import Category from '../models/Category.js';

export const categoryRepository = {
  create: (data) => Category.create(data),
  findAll: () => Category.find().sort({ name: 1 }),
  findByName: (name) => Category.findOne({ name }),
};
