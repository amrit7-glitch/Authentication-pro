import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
    },
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