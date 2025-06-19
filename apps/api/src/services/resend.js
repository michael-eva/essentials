"use server";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
export default async function SendEmail(params) {
    const data = await resend.emails.send({
        from: "Essentials <michael@notifications.extensa.studio>",
        to: [params.to],
        subject: params.subject,
        html: params.html,
    });
    return data;
}
//# sourceMappingURL=resend.js.map