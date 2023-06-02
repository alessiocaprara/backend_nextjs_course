import { createTransport } from "nodemailer";
import env from "../utils/validateEnv";

const transporter = createTransport({
    host: "smtp-relay.sendinblue.com",
    port: 587,
    auth: {
        user: "capraraalessio@gmail.com",
        pass: env.SMTP_PASSWORD,
    },
});

export async function sendEmailVerificationCode(toEmail: string, verificationCode: string) {
    await transporter.sendMail({
        from: "noreply@k-app.cloud",
        to: toEmail,
        subject: "K-app - Your verification code",
        html: `<p>This is your verification code. It will expires in 10 minutes</p>
        <strong>${verificationCode}</strong>`,
    });
}

export async function sendPasswordResetCode(toEmail: string, verificationCode: string) {
    await transporter.sendMail({
        from: "noreply@k-app.cloud",
        to: toEmail,
        subject: "K-app - Reset your password",
        html: `<p>A password reset request has been sent for this account. 
        Use this verification code to reset your password. It will expire in 10 minutes.</p>
        <p><strong>${verificationCode}</strong></p>
        If you didn't request a password reset, ignore this email.`,
    });
}