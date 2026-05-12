import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;
let testAccount: nodemailer.TestAccount | null = null;

async function getTransporter() {
  if (transporter) return transporter;

  try {
    testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return transporter;
  } catch (error) {
    console.error("Failed to create email transporter:", error);
    return null;
  }
}

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  const t = await getTransporter();
  if (!t) return;

  const info = await t.sendMail({
    from: '"StyleAI Luxury" <noreply@styleai.com>',
    to,
    subject: "Verify your email - StyleAI",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0D0D0D; color: #F5F0EB; padding: 40px; text-align: center;">
        <h1 style="font-family: serif; color: #C9A84C;">STYLEAI</h1>
        <p style="margin-bottom: 30px;">Welcome to StyleAI. Please verify your email to unlock your personal luxury fashion experience.</p>
        <a href="${verifyUrl}" style="background-color: #C9A84C; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; font-size: 12px;">Verify Email</a>
      </div>
    `,
  });

  console.log("-----------------------------------------");
  console.log("Verification email sent! Preview URL:");
  console.log(nodemailer.getTestMessageUrl(info));
  console.log("-----------------------------------------");
  
  return nodemailer.getTestMessageUrl(info);
}

export async function sendInvoiceEmail(to: string, items: any[], total: string) {
  const t = await getTransporter();
  if (!t) return;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #2A2A2A;">${item.product?.name || 'Product'} x ${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #2A2A2A; text-align: right;">$${(parseFloat(item.product?.price || 0) * item.quantity).toFixed(2)}</td>
    </tr>
  `).join("");

  const info = await t.sendMail({
    from: '"StyleAI Luxury" <noreply@styleai.com>',
    to,
    subject: "Your StyleAI Invoice",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0D0D0D; color: #F5F0EB; padding: 40px;">
        <h1 style="font-family: serif; color: #C9A84C; text-align: center;">STYLEAI</h1>
        <h2 style="text-align: center; margin-bottom: 30px;">Thank you for your purchase.</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          ${itemsHtml}
          <tr>
            <td style="padding: 10px; font-weight: bold;">TOTAL</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; color: #C9A84C;">$${total}</td>
          </tr>
        </table>
        <p style="text-align: center; color: #A0A0A0; font-size: 12px;">Your items will be shipped shortly.</p>
      </div>
    `,
  });

  console.log("-----------------------------------------");
  console.log("Invoice email sent! Preview URL:");
  console.log(nodemailer.getTestMessageUrl(info));
  console.log("-----------------------------------------");
  
  return nodemailer.getTestMessageUrl(info);
}
