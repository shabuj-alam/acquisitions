import logger from '#config/logger.js';
import { users } from '#models/user.model.js';
import { db } from '#config/databse.js';
import { eq } from 'drizzle-orm';

export const getAllUsers = async () => {
  try {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users);
  } catch (error) {
    logger.error('Error fetching users', error);
    throw error;
  }
};

export const getUserById = async id => {
  try {
    const userResults = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (userResults.length === 0) {
      throw new Error('User not found');
    }

    logger.info(`User fetched successfully: ${userResults[0].email}`);
    return userResults[0];
  } catch (error) {
    logger.error(`Error fetching user with id ${id}`, error);
    throw error;
  }
};

export const updateUser = async (id, updates) => {
  try {
    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      throw new Error('User not found');
    }

    // If email is being updated, check if it's already taken by another user
    if (updates.email) {
      const emailExists = await db
        .select()
        .from(users)
        .where(eq(users.email, updates.email))
        .limit(1);

      if (emailExists.length > 0 && emailExists[0].id !== id) {
        throw new Error('Email already exists');
      }
    }

    // Add updated_at timestamp
    const updateData = {
      ...updates,
      updated_at: new Date(),
    };

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

    logger.info(`User updated successfully: ${updatedUser.email}`);
    return updatedUser;
  } catch (error) {
    logger.error(`Error updating user with id ${id}`, error);
    throw error;
  }
};

export const deleteUser = async id => {
  try {
    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      throw new Error('User not found');
    }

    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
      });

    logger.info(`User deleted successfully: ${deletedUser.email}`);
    return deletedUser;
  } catch (error) {
    logger.error(`Error deleting user with id ${id}`, error);
    throw error;
  }
};
