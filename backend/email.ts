import nodemailer from "nodemailer";
import { ENV } from "./_core/env";

interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  items: InvoiceItem[];
  shippingCost: number;
  total: number;
  currency: string;
}

function buildInvoiceHtml(data: InvoiceData): string {
  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #2A2A2A;font-size:14px;color:#F5F0EB;">${item.name}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #2A2A2A;font-size:14px;color:#A0A0A0;text-align:center;">${item.quantity}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #2A2A2A;font-size:14px;color:#C9A84C;text-align:right;">$${item.unitPrice.toFixed(2)}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #2A2A2A;font-size:14px;color:#F5F0EB;text-align:right;">$${(item.unitPrice * item.quantity).toFixed(2)}</td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><title>StyleAI Invoice</title></head>
<body style="margin:0;padding:0;background:#0D0D0D;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D0D;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #2A2A2A;">

        <!-- Header -->
        <tr>
          <td style="background:#111;padding:40px 40px 24px;border-bottom:1px solid #2A2A2A;">
            <h1 style="margin:0;font-size:28px;color:#F5F0EB;font-family:Georgia,serif;letter-spacing:2px;">StyleAI</h1>
            <p style="margin:6px 0 0;font-size:11px;color:#C9A84C;letter-spacing:4px;text-transform:uppercase;">Luxury AI-Curated Fashion</p>
          </td>
        </tr>

        <!-- Invoice title -->
        <tr>
          <td style="padding:32px 40px 16px;">
            <h2 style="margin:0;font-size:22px;color:#F5F0EB;">Order Confirmation</h2>
            <p style="margin:8px 0 0;font-size:12px;color:#666;letter-spacing:2px;text-transform:uppercase;">Order #${data.orderNumber}</p>
          </td>
        </tr>

        <!-- Customer info -->
        <tr>
          <td style="padding:0 40px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:50%;vertical-align:top;">
                  <p style="margin:0 0 4px;font-size:10px;color:#666;letter-spacing:3px;text-transform:uppercase;">Bill To</p>
                  <p style="margin:0;font-size:14px;color:#F5F0EB;font-weight:bold;">${data.customerName}</p>
                  <p style="margin:2px 0;font-size:13px;color:#A0A0A0;">${data.customerEmail}</p>
                  <p style="margin:2px 0;font-size:13px;color:#A0A0A0;">${data.customerAddress}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Items table -->
        <tr>
          <td style="padding:0 40px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #2A2A2A;">
              <thead>
                <tr style="background:#1A1A1A;">
                  <th style="padding:12px 16px;text-align:left;font-size:10px;color:#666;letter-spacing:3px;text-transform:uppercase;font-weight:bold;">Item</th>
                  <th style="padding:12px 16px;text-align:center;font-size:10px;color:#666;letter-spacing:3px;text-transform:uppercase;font-weight:bold;">Qty</th>
                  <th style="padding:12px 16px;text-align:right;font-size:10px;color:#666;letter-spacing:3px;text-transform:uppercase;font-weight:bold;">Unit Price</th>
                  <th style="padding:12px 16px;text-align:right;font-size:10px;color:#666;letter-spacing:3px;text-transform:uppercase;font-weight:bold;">Total</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>
          </td>
        </tr>

        <!-- Totals -->
        <tr>
          <td style="padding:0 40px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="right">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:6px 0;font-size:13px;color:#666;padding-right:32px;">Shipping</td>
                      <td style="padding:6px 0;font-size:13px;color:#F5F0EB;text-align:right;">$${data.shippingCost.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 0 0;font-size:16px;font-weight:bold;color:#F5F0EB;padding-right:32px;border-top:1px solid #2A2A2A;">Total Paid</td>
                      <td style="padding:12px 0 0;font-size:16px;font-weight:bold;color:#C9A84C;text-align:right;border-top:1px solid #2A2A2A;">$${data.total.toFixed(2)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0D0D0D;padding:24px 40px;border-top:1px solid #2A2A2A;">
            <p style="margin:0;font-size:12px;color:#444;text-align:center;">Thank you for shopping with StyleAI. Your order will be dispatched within 1–2 business days.</p>
            <p style="margin:8px 0 0;font-size:11px;color:#333;text-align:center;letter-spacing:2px;">STYLEAI — LUXURY AI-CURATED FASHION</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendInvoiceEmail(data: InvoiceData): Promise<void> {
  if (!ENV.smtpHost || !ENV.smtpUser || !ENV.smtpPass) {
    console.warn("[Email] SMTP not configured — skipping invoice email. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: ENV.smtpHost,
    port: ENV.smtpPort,
    secure: ENV.smtpPort === 465,
    auth: { user: ENV.smtpUser, pass: ENV.smtpPass },
  });

  await transporter.sendMail({
    from: ENV.smtpFrom || `"StyleAI" <${ENV.smtpUser}>`,
    to: data.customerEmail,
    subject: `Your StyleAI Order #${data.orderNumber} — Confirmed`,
    html: buildInvoiceHtml(data),
  });

  console.log(`[Email] Invoice sent to ${data.customerEmail} for order #${data.orderNumber}`);
}
