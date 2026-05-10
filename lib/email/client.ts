import { Resend } from "resend";

let instance: Resend | null = null;

export function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.");
  }
  if (!instance) {
    instance = new Resend(process.env.RESEND_API_KEY);
  }
  return instance;
}

export const FROM_ADDRESS = "Arachchi <orders@arachchi.com>";
