import express from 'express';
import {
  fetchAllUsers,
  fetchUserById,
  updateUserById,
  deleteUserById,
} from '#controllers/user.controller.js';
import {
  authenticateToken,
  requireAdmin,
} from '#middleware/auth.middleware.js';

const router = express.Router();

// Get all users - requires authentication (could be restricted to admin only)
router.get('/', authenticateToken, requireAdmin, fetchAllUsers);

// Get user by ID - requires authentication
router.get('/:id', authenticateToken, requireAdmin, fetchUserById);

// Update user by ID - requires authentication (users can update self, admins can update any)
router.put('/:id', authenticateToken, requireAdmin, updateUserById);

// Delete user by ID - requires authentication (users can delete self, admins can delete any)
router.delete('/:id', authenticateToken, requireAdmin, deleteUserById);

export default router;
