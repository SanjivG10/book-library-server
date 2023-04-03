import dotenv from 'dotenv'

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "SOME_SECRET_KEY";
export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1/book-library" 