import { sendOrderReceipt } from "../src/receipt_sender.js";

const to = process.env.DEMO_EMAIL_TO;
if (!to) throw new Error("DEMO_EMAIL_TO is required");

const result = await sendOrderReceipt({
  orderId: "order-demo-42",
  buyerEmail: to,
  buyerName: "Mina",
  title: "Field Notes: Issue 04",
  downloadUrl: "https://creator.example/downloads/issue-04",
  amountCents: 1200,
});
console.log(`sent ${result.email.message_id}; subscriber ${result.subscriber.status}`);
