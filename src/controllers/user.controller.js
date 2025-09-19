import logger from '#config/logger.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#services/user.service.js';
import {
  userIdSchema,
  updateUserSchema,
} from '#validations/users.validation.js';
import { formatValidationError } from '#utils/format.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Fetching all users');

    const allUsers = await getAllUsers();

    res.status(200).json({
      message: 'Users fetched successfully',
      users: allUsers,
    });
  } catch (error) {
    logger.error('Error fetching users', error);
    next(error);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    const validationResult = await userIdSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { id } = validationResult.data;
    logger.info(`Fetching user with id: ${id}`);

    const user = await getUserById(id);

    res.status(200).json({
      message: 'User fetched successfully',
      user,
    });
  } catch (error) {
    logger.error('Error fetching user by id', error);

    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(error);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    const paramValidation = await userIdSchema.safeParse(req.params);
    const bodyValidation = await updateUserSchema.safeParse(req.body);

    if (!paramValidation.success) {
      return res.status(400).json({
        error: 'Invalid user ID',
        details: formatValidationError(paramValidation.error),
      });
    }

    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(bodyValidation.error),
      });
    }

    const { id } = paramValidation.data;
    const updates = bodyValidation.data;

    // Authorization checks
    const currentUserId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Users can only update their own information unless they're admin
    if (!isAdmin && currentUserId !== id) {
      logger.warn(
        `User ${req.user.email} attempted to update user ${id} without permission`
      );
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own information',
      });
    }

    // Only admin can change user roles
    if (updates.role && !isAdmin) {
      logger.warn(
        `User ${req.user.email} attempted to change role without admin privileges`
      );
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only admins can change user roles',
      });
    }

    logger.info(`Updating user with id: ${id}`);

    const updatedUser = await updateUser(id, updates);

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    logger.error('Error updating user', error);

    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    if (error.message === 'Email already exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    next(error);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    const validationResult = await userIdSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { id } = validationResult.data;
    const currentUserId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Users can only delete their own account unless they're admin
    if (!isAdmin && currentUserId !== id) {
      logger.warn(
        `User ${req.user.email} attempted to delete user ${id} without permission`
      );
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own account',
      });
    }

    // Prevent admin from deleting themselves (optional safety check)
    if (isAdmin && currentUserId === id) {
      logger.warn(
        `Admin ${req.user.email} attempted to delete their own account`
      );
      return res.status(400).json({
        error: 'Bad request',
        message: 'Admins cannot delete their own account',
      });
    }

    logger.info(`Deleting user with id: ${id}`);

    const deletedUser = await deleteUser(id);

    res.status(200).json({
      message: 'User deleted successfully',
      user: {
        id: deletedUser.id,
        email: deletedUser.email,
      },
    });
  } catch (error) {
    logger.error('Error deleting user', error);

    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(error);
  }
};
