import nodemailer from "nodemailer";



const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    debug: true,
    logger: true
});

export const sendEmail = async (
    to,
    subject,
    html
) => {
    await transporter.sendMail({
        from: process.env.EMAIL,
        to,
        subject,
        html,
    });
};