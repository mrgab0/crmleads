export interface SendEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const defaultFrom =
    from ||
    process.env.EMAIL_FROM ||
    'Lead CRM <onboarding@resend.dev>';

  const resendApiKey = process.env.RESEND_API_KEY;

  // 1. Si está configurada la API de Resend
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: defaultFrom,
          to: [to],
          subject,
          html: html || `<p>${text || ''}</p>`,
          text: text || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al enviar email vía Resend',
        };
      }

      return { success: true, id: data.id };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido al enviar email';
      return { success: false, error: message };
    }
  }

  // 2. Modo desarrollo / Fallback si aún no se configuró RESEND_API_KEY
  console.log(`[Email Mock/Dev] Para: ${to} | Asunto: ${subject}`);
  return {
    success: true,
    id: `dev-mock-${Date.now()}`,
  };
}
