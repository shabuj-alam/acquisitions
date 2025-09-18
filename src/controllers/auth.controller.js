import logger from "#config/logger.js";
import {signupSchema} from "#validations/auth.validation.js";
import {formatValidationError} from "#utils/format.js";
import {createUser} from "#services/auth.service.js";
import {jwttoken} from "#utils/jwt.js";
import {cookies} from "#utils/cookies.js";

export const signUpController = async( req, res, next) => {
    try {
        const validationResult = await signupSchema.safeParse(req.body);

        if(!validationResult.success) {
            return res.status(400).json({
                error: 'validation failed',
                details: formatValidationError(validationResult.error)
            });
        }

        const { name, email, password, role } = validationResult.data;

        const user = await createUser({ name, email, password, role});

        const token = jwttoken.sign({id: user.id, email:user.email, role: user.role});

        cookies.set(res, 'token', token);

        logger.info(`User registered successfully: ${email}`);
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id, name: user.name, email: user.email, role: user.role
            }
        });

    } catch (error) {
        logger.error('Signup error', error);

        if(error.message === 'user with this email already exists') {
            return res.status(409).json({ error: 'Email already exists'});
        }

        next(error);
    }
}