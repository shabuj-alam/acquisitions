import logger from "#config/logger.js";
import bcrypt from "bcrypt";
import {users} from "#models/user.model.js";
import {eq} from "drizzle-orm";
import {db} from "#config/databse.js";

export const hashPassword = async(password) => {
    try {
        return await bcrypt.hash(password, 10)
    } catch (error) {
        logger.error(`Error hashing password: ${error} `);
        throw new Error('Error hashing password');
    }
}

export const createUser = async({name, email, password, role = 'user'}) => {
    try {
        const existingUser = db.select().from(users).where(eq(users.email, email)).limit(1);

        if(existingUser.length > 0) {
            throw new Error('user with this email already exists');
        }

        const passwordHash = await hashPassword(password);

        const [newUser] = await db
            .insert(users)
            .values({name, email, password: passwordHash, role})
            .returning({ id: users.id, name: users.name, email:users.email, role:users.role});

        logger.info(`User created successfully: ${newUser.email}`);
        return newUser;

    } catch (error) {
        logger.error(`Error creating user: ${error} `);
        throw new Error('Error creating user');
    }
}