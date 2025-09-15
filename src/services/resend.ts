"use server";
import { env } from "@/env";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);

export default async function SendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const data = await resend.emails.send({
    from: "Essentials <michael@notifications.extensa.studio>",
    to: [params.to],
    subject: params.subject,
    html: params.html,
  });
  return data;
}
