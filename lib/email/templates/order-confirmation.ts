interface OrderItem {
  productName: string;
  variantLabel: string;
  quantity: number;
  lineTotalCents: number;
}

interface OrderConfirmationData {
  orderNumber: string;
  email: string;
  items: OrderItem[];
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  siteUrl: string;
}

function formatCents(cents: number, currency = "CAD"): string {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency }).format(cents / 100);
}

export function orderConfirmationHtml(data: OrderConfirmationData): string {
  const { orderNumber, items, subtotalCents, shippingCents, taxCents, totalCents, currency, siteUrl } = data;

  const itemRows = items
    .map(
      (item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e8e3de;font-size:14px;color:#2d2520;">
        ${item.productName}${item.variantLabel ? ` — ${item.variantLabel}` : ""}
        <span style="color:#8c7b72;font-size:12px;display:block;margin-top:2px;">Qty ${item.quantity}</span>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #e8e3de;font-size:14px;color:#2d2520;text-align:right;white-space:nowrap;">
        ${formatCents(item.lineTotalCents, currency)}
      </td>
    </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Order ${orderNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f7f3ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3ef;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <a href="${siteUrl}" style="font-family:Georgia,serif;font-size:22px;font-weight:400;color:#2d2520;text-decoration:none;letter-spacing:0.15em;">
                ARACHCHI
              </a>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:24px;font-weight:400;color:#2d2520;">
                Order confirmed.
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:#8c7b72;line-height:1.6;">
                Thank you for your order. We&rsquo;ll send a shipping notification with tracking when your items are on their way.
              </p>

              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#2d2520;">
                Order
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:#8c7b72;">${orderNumber}</p>

              <!-- Items -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e8e3de;">
                <tbody>
                  ${itemRows}
                </tbody>
              </table>

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                <tr>
                  <td style="font-size:13px;color:#8c7b72;padding:4px 0;">Subtotal</td>
                  <td style="font-size:13px;color:#8c7b72;text-align:right;">${formatCents(subtotalCents, currency)}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#8c7b72;padding:4px 0;">Shipping</td>
                  <td style="font-size:13px;color:#8c7b72;text-align:right;">${shippingCents === 0 ? "Free" : formatCents(shippingCents, currency)}</td>
                </tr>
                ${
                  taxCents > 0
                    ? `<tr>
                  <td style="font-size:13px;color:#8c7b72;padding:4px 0;">Tax</td>
                  <td style="font-size:13px;color:#8c7b72;text-align:right;">${formatCents(taxCents, currency)}</td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="font-size:14px;color:#2d2520;font-weight:600;padding:12px 0 0;border-top:1px solid #e8e3de;">Total</td>
                  <td style="font-size:14px;color:#2d2520;font-weight:600;text-align:right;padding:12px 0 0;border-top:1px solid #e8e3de;">${formatCents(totalCents, currency)} ${currency}</td>
                </tr>
              </table>

              <!-- CTA -->
              <div style="margin-top:32px;text-align:center;">
                <a href="${siteUrl}/account/orders"
                  style="display:inline-block;background:#2d2520;color:#f7f3ef;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;padding:14px 32px;">
                  View order
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 0;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#8c7b72;">
                Questions? <a href="mailto:hello@arachchi.com" style="color:#2d2520;">hello@arachchi.com</a>
              </p>
              <p style="margin:0;font-size:12px;color:#b8aca4;">
                Arachchi Inc. &mdash; Toronto, Ontario, Canada
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
