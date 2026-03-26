import dotenv from 'dotenv';
dotenv.config();
console.log('JWT_SECRET_LENGTH:', process.env.JWT_SECRET?.length);
console.log('JWT_SECRET_FIRST_CHAR:', process.env.JWT_SECRET?.[0]);
