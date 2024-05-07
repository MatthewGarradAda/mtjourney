const nodemailer = require('nodemailer');
const dotenv = require('dotenv')
dotenv.config()

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

async function sendEmail(to, subject, text) {
    return new Promise((resolve, reject) => {
        transporter.sendMail({from: process.env.GMAIL_USER, to, subject, text}, (error, info) => {
            resolve(!error)
        });
    });
}