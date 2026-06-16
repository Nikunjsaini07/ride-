// Transactional email via Brevo (Sendinblue) HTTP API.
// Requires BREVO_API in env. Sender must be a verified sender in your Brevo
// account (Senders & IP -> Senders). Configure with MAIL_FROM / MAIL_FROM_NAME.

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

const FROM_EMAIL = process.env.MAIL_FROM || "no-reply@sugrideshare.app";
const FROM_NAME = process.env.MAIL_FROM_NAME || "SUG RideShare";

export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.BREVO_API;
  if (!apiKey) {
    throw new Error("BREVO_API is not configured");
  }

  const res = await fetch(BREVO_URL, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Brevo send failed (${res.status}): ${text}`);
  }
  return res.json().catch(() => ({}));
}

export function resetPasswordEmail({ name, resetUrl }) {
  return `
  <div style="font-family:Segoe UI,Roboto,Arial,sans-serif;max-width:480px;margin:0 auto;color:#1a2438">
    <h2 style="color:#3a72e0">SUG RideShare</h2>
    <p>Hi ${name || "there"},</p>
    <p>We received a request to reset your password. Click the button below to
    choose a new one. This link expires in 1 hour.</p>
    <p style="text-align:center;margin:28px 0">
      <a href="${resetUrl}"
         style="background:#4f8cff;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;display:inline-block">
        Reset Password
      </a>
    </p>
    <p style="font-size:13px;color:#64748b">
      If the button doesn't work, copy this link into your browser:<br>
      <a href="${resetUrl}">${resetUrl}</a>
    </p>
    <p style="font-size:13px;color:#64748b">
      Didn't request this? You can safely ignore this email — your password
      won't change.
    </p>
  </div>`;
}
