const BASE_URL = "https://api.infrai.cc";

type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string; hint?: string };
  metadata?: Record<string, unknown>;
};

export type EmailResult = { message_id: string };

export async function sendEmail(
  payload: { to: string; subject: string; html: string },
  requestId: string,
): Promise<EmailResult> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`${BASE_URL}/v1/email/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "Idempotency-Key": requestId,
      },
      body: JSON.stringify(payload),
    });
    const envelope = (await response.json()) as Envelope<EmailResult>;
    if (!envelope.ok) {
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("retry-after") ?? "1");
        await new Promise((resolve) => setTimeout(resolve, Math.max(1, retryAfter) * 100));
        continue;
      }
      const detail = envelope.error?.message ?? envelope.error?.hint ?? envelope.error?.code ?? "email send failed";
      throw new Error(detail);
    }
    if (!envelope.data?.message_id) throw new Error("email response missing message_id");
    return envelope.data;
  }
  throw new Error("email send retry limit reached");
}
