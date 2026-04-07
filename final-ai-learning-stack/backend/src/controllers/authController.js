import { authService } from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  res.status(201).json({ success: true, data });
});

export const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body.email, req.body.password);
  res.json({ success: true, data });
});

export const createAdmin = asyncHandler(async (req, res) => {
  const data = await authService.createAdmin(req.user.userId, req.body);
  res.status(201).json({ success: true, data });
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const result = await authService.updatePassword(req.user.userId, oldPassword, newPassword);
  res.json({ success: true, data: result });
});
