import { clientEnv } from "@/lib/env";

const APP_NAME = clientEnv.NEXT_PUBLIC_APP_NAME;

export function emailLayout({
  title,
  preheader,
  body,
  accent = "#c2410c",
}: {
  title: string;
  preheader?: string;
  body: string;
  accent?: string;
}) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  ${preheader ? `<span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>` : ""}
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e7e5e4;">
        <tr>
          <td style="background:${accent};color:#fff;padding:28px 24px;">
            <p style="margin:0;font-size:13px;opacity:0.9;letter-spacing:0.05em;text-transform:uppercase;">${APP_NAME}</p>
            <h1 style="margin:8px 0 0;font-size:24px;font-weight:700;">${title}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;color:#1c1917;font-size:15px;line-height:1.6;">${body}</td>
        </tr>
        <tr>
          <td style="padding:16px 24px;background:#fafaf9;color:#78716c;font-size:12px;border-top:1px solid #e7e5e4;">
            © ${new Date().getFullYear()} ${APP_NAME}. This is an automated message — please do not reply.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function detailBox(rows: { label: string; value: string }[]) {
  const items = rows
    .map(
      (r) =>
        `<tr><td style="padding:6px 0;color:#78716c;font-size:14px;width:120px;">${r.label}</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${r.value}</td></tr>`,
    )
    .join("");
  return `<table width="100%" style="background:#fafaf9;border-radius:8px;padding:16px;margin:16px 0;">${items}</table>`;
}

export function ctaButton(href: string, label: string, color = "#c2410c") {
  return `<p style="margin:24px 0;"><a href="${href}" style="display:inline-block;background:${color};color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">${label}</a></p>`;
}
