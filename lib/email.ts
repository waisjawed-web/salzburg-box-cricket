type BookingEmailInput = {
  to: string;
  customerName: string;
  bookingId: string;
  courtName: string;
  date: string;
  time: string;
  amountCents: number;
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

export async function sendBookingConfirmationEmail(input: BookingEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { skipped: true, reason: "RESEND_API_KEY is not configured" };
  }

  const from = process.env.RESEND_FROM_EMAIL || "Salzburg Box Cricket <bookings@salzburgboxcricket.com>";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://salzburgboxcricket.com";
  const subject = `Booking confirmed: ${input.courtName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #102015; line-height: 1.6;">
      <h1 style="color: #0f7a3b;">Salzburg Box Cricket booking confirmed</h1>
      <p>Hi ${input.customerName},</p>
      <p>Your court booking is confirmed.</p>
      <table style="border-collapse: collapse; margin: 20px 0; width: 100%; max-width: 520px;">
        <tr><td style="padding: 8px; border: 1px solid #d7eadc; font-weight: bold;">Booking ID</td><td style="padding: 8px; border: 1px solid #d7eadc;">${input.bookingId}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #d7eadc; font-weight: bold;">Court</td><td style="padding: 8px; border: 1px solid #d7eadc;">${input.courtName}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #d7eadc; font-weight: bold;">Date</td><td style="padding: 8px; border: 1px solid #d7eadc;">${input.date}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #d7eadc; font-weight: bold;">Time</td><td style="padding: 8px; border: 1px solid #d7eadc;">${input.time}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #d7eadc; font-weight: bold;">Paid</td><td style="padding: 8px; border: 1px solid #d7eadc;">${formatEuroFromCents(input.amountCents)}</td></tr>
      </table>
      <p>You can manage your booking from your dashboard:</p>
      <p><a href="${appUrl}/dashboard" style="background: #22c55e; color: #07130b; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: bold;">Open dashboard</a></p>
      <p>See you at the nets.</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: input.to,
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
