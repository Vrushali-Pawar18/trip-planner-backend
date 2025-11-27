import jwt, { SignOptions } from 'jsonwebtoken';

const generateToken = (id: string): string => {
    const secret: jwt.Secret = process.env.JWT_SECRET || 'default_secret';
    const expiresIn = (process.env.JWT_EXPIRES_IN || '30d') as any;

    return jwt.sign({ id }, secret, { expiresIn });
};

export default generateToken;
