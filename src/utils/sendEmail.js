import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (
    to,
    subject,
    html
) => {
    const { data, error } =
        await resend.emails.send({
            from: process.env.EMAIL,
            to,
            subject,
            html,
        });

    console.log("RESEND DATA:", data);
    console.log("RESEND ERROR:", error);

    if (error) {
        throw error;
    }

    return data;
};