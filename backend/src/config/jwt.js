import dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'campusiq_super_secret_jwt_key_2026_academic_production_grade';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
