import { z } from "zod";
import { renderReceipt, type Order } from "./content_processor.js";
import { sendEmail, type EmailResult } from "./infrai_email.js";

export const orderSchema = z.object({
  orderId: z.string().min(1),
  buyerEmail: z.string().email(),
  buyerName: z.string().min(1),
  title: z.string().min(1),
  downloadUrl: z.string().url(),
  amountCents: z.number().int().nonnegative(),
});

export type SubscriberUpdate = { email: string; lastOrderId: string; status: "active" };

export function updateSubscriber(order: Order): SubscriberUpdate {
  return { email: order.buyerEmail, lastOrderId: order.orderId, status: "active" };
}

export async function sendOrderReceipt(input: unknown): Promise<{ email: EmailResult; subscriber: SubscriberUpdate }> {
  const order = orderSchema.parse(input);
  const subscriber = updateSubscriber(order);
  const email = await sendEmail(
    { to: order.buyerEmail, subject: `Receipt for ${order.title}`, html: renderReceipt(order) },
    `receipt-${order.orderId}`,
  );
  return { email, subscriber };
}
