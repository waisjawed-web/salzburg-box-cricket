type BookingEmailInput = {
  to: string;
  customerName: string;
  bookingId: string;
  courtName: string;
  date: string;
  time: string;
  amountCents: number;
};

type WelcomeEmailInput = {
  to: string;
  customerName: string;
};

export function hasEmailConfig() {
  return Boolean(process.env.RESEND_API_KEY);
}

function formatEuroFromCents(amountCents: number) {
  return new Intl.NumberFormat("en-AT", {
    style: "currency",
    currency: "EUR"
  }).format(amountCents / 100);
}

function getEmailSettings() {
  return {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.RESEND_FROM_EMAIL || "Salzburg Box Cricket <bookings@salzburgboxcricket.com>",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://salzburgboxcricket.com"
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const { apiKey, from } = getEmailSettings();
  if (!apiKey) {
    return { skipped: true, reason: "RESEND_API_KEY is not configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html
    })
  });

  if (!response.ok) {
    const error = await response.text();
    return { skipped: false, error };
  }

  const data = await response.json();
  return { skipped: false, id: data.id as string | undefined };
}

export async function sendWelcomeEmail(input: WelcomeEmailInput) {
  const { appUrl } = getEmailSettings();
  const customerName = escapeHtml(input.customerName);
  const subject = "Welcome to Salzburg Box Cricket";
  const html = `
    <div style="font-family: Arial, sans-serif; color: #102015; line-height: 1.6;">
      <h1 style="color: #0f7a3b;">Welcome to Salzburg Box Cricket</h1>
      <p>Hi ${customerName},</p>
      <p>Your account is ready. You can now book indoor cricket nets, view your bookings, and join upcoming tournaments.</p>
      <p><a href="${appUrl}/booking" style="background: #22c55e; color: #07130b; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: bold;">Book a court</a></p>
      <p>If this was not you, please ignore this email.</p>
    </div>
  `;

  return sendEmail({ to: input.to, subject, html });
}

export async function sendBookingConfirmationEmail(input: BookingEmailInput) {
  const customerName = escapeHtml(input.customerName);
  const bookingId = escapeHtml(input.bookingId);
  const courtName = escapeHtml(input.courtName);
  const date = escapeHtml(input.date);
  const time = escapeHtml(input.time);
  const { appUrl } = getEmailSettings();
  const subject = `Booking confirmed: ${courtName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #102015; line-height: 1.6;">
      <h1 style="color: #0f7a3b;">Salzburg Box Cricket booking confirmed</h1>
      <p>Hi ${customerName},</p>
      <p>Your court booking is confirmed.</p>
      <table style="border-collapse: collapse; margin: 20px 0; width: 100%; max-width: 520px;">
        <tr><td style="padding: 8px; border: 1px solid #d7eadc; font-weight: bold;">Booking ID</td><td style="padding: 8px; border: 1px solid #d7eadc;">${bookingId}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #d7eadc; font-weight: bold;">Court</td><td style="padding: 8px; border: 1px solid #d7eadc;">${courtName}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #d7eadc; font-weight: bold;">Date</td><td style="padding: 8px; border: 1px solid #d7eadc;">${date}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #d7eadc; font-weight: bold;">Time</td><td style="padding: 8px; border: 1px solid #d7eadc;">${time}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #d7eadc; font-weight: bold;">Paid</td><td style="padding: 8px; border: 1px solid #d7eadc;">${formatEuroFromCents(input.amountCents)}</td></tr>
      </table>
      <p>You can manage your booking from your dashboard:</p>
      <p><a href="${appUrl}/dashboard" style="background: #22c55e; color: #07130b; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: bold;">Open dashboard</a></p>
      <p>See you at the nets.</p>
    </div>
  `;

  return sendEmail({ to: input.to, subject, html });
}
