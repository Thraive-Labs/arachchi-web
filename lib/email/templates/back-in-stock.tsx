interface BackInStockData {
  productName: string;
  productUrl: string;
  size?: string | null;
}

export function backInStockHtml({ productName, productUrl, size }: BackInStockData): string {
  const label = size ? `${productName} (${size})` : productName;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Back in stock: ${label}</title>
</head>
<body style="margin:0;padding:0;background:#f9f5f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5f1;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;padding:48px 40px;">
          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#6b5f56;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-weight:400;">
                arachchi
              </p>
            </td>
          </tr>
          <tr>
            <td>
              <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:22px;font-weight:300;color:#1f1a17;letter-spacing:0.05em;">
                Back in stock
              </p>
              <p style="margin:0 0 24px;font-size:14px;color:#6b5f56;line-height:1.7;">
                Good news &mdash; <strong style="color:#1f1a17;">${label}</strong> is back in stock. Quantities are limited.
              </p>
              <div style="margin-bottom:32px;">
                <a href="${productUrl}"
                  style="display:inline-block;background:#1f1a17;color:#f9f5f1;padding:14px 28px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;">
                  Shop now
                </a>
              </div>
              <p style="margin:0;font-size:11px;color:#a89f97;line-height:1.6;">
                You saved this item to your wishlist. You can manage your wishlist at any time from your account.
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
