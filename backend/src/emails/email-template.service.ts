import { Injectable } from "@nestjs/common";
import { sanitizeHtml } from "../common/utils/sanitize.util";

@Injectable()
export class EmailTemplateService {
  renderTransactional(input: { title: string; body: string; ctaLabel?: string; ctaUrl?: string }): string {
    const cta = input.ctaLabel && input.ctaUrl ? `<p><a href="${sanitizeHtml(input.ctaUrl)}">${sanitizeHtml(input.ctaLabel)}</a></p>` : "";
    return `
      <main style="font-family:Inter,Arial,sans-serif;color:#0f172a;line-height:1.6">
        <h1>${sanitizeHtml(input.title)}</h1>
        <p>${sanitizeHtml(input.body)}</p>
        ${cta}
        <p style="color:#64748b;font-size:12px">NOVAEX AI Commerce</p>
      </main>
    `;
  }
}
