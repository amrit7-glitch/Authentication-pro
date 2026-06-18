import nodemailer from "nodemailer";



const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_LOGIN,
    pass: process.env.BREVO_PASSWORD,
  },
  logger: true,
  debug: true,
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