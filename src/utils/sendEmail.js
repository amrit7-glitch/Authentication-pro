import * as brevo from "@getbrevo/brevo";

const apiInstance = new brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

export const sendEmail = async (
    to,
    subject,
    html
) => {
    const sendSmtpEmail =
        new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;

    sendSmtpEmail.sender = {
        name: "Auth Project",
        email: process.env.EMAIL,
    };

    sendSmtpEmail.to = [
        {
            email: to,
        },
    ];

    const result =
        await apiInstance.sendTransacEmail(
            sendSmtpEmail
        );

    console.log("Email sent:", result);
};