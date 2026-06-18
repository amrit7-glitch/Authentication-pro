import SibApiV3Sdk from "sib-api-v3-sdk";

const defaultClient = SibApiV3Sdk.ApiClient.instance;

defaultClient.authentications["api-key"].apiKey =
    process.env.BREVO_API_KEY;

const apiInstance =
    new SibApiV3Sdk.TransactionalEmailsApi();

export const sendEmail = async (
    to,
    subject,
    html
) => {
    const result =
        await apiInstance.sendTransacEmail({
            sender: {
                email: process.env.EMAIL,
                name: "Auth Project",
            },
            to: [{ email: to }],
            subject,
            htmlContent: html,
        });

    console.log("Email sent:", result);
};