import nodemailer from "nodemailer";



const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
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