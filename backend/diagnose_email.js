import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const testSmtp = async () => {
    console.log('--- SMTP Diagnostic ---');
    console.log('User:', process.env.SMTP_USER);
    console.log('Pass:', process.env.SMTP_PASS ? '********' : 'MISSING');

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    try {
        await transporter.verify();
        console.log('✅ SMTP Connection Verified');
    } catch (err) {
        console.error('❌ SMTP Connection Failed:', err.message);
    }
};

const checkUsers = async () => {
    console.log('\n--- User Data Check ---');
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kisaankajadoo');
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- ${u.name} (${u.role}): ${u.email}`);
        });
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Database Check Failed:', err.message);
    }
};

const run = async () => {
    await testSmtp();
    await checkUsers();
    process.exit(0);
};

run();
