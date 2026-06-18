import brevo from "@getbrevo/brevo";

const apiInstance =
    new brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);
export const sendEmail = async (
    to,
    subject,
    html
) => {
    const email =
        new brevo.SendSmtpEmail();

    email.subject = subject;
    email.htmlContent = html;

    email.sender = {
        name: "Auth System",
        email: "devloperamrit@gmail.com",
    };

    email.to = [
        {
            email: to,
        },
    ];

    await apiInstance.sendTransacEmail(
        email
    );
};