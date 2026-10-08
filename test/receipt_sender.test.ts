import assert from "node:assert/strict";
import { orderSchema, updateSubscriber } from "../src/receipt_sender.js";

const order = orderSchema.parse({
  orderId: "o-7",
  buyerEmail: "reader@example.com",
  buyerName: "Reader",
  title: "Studio Pack",
  downloadUrl: "https://creator.example/studio-pack",
  amountCents: 900,
});
assert.deepEqual(updateSubscriber(order), { email: "reader@example.com", lastOrderId: "o-7", status: "active" });
assert.throws(() => orderSchema.parse({ ...order, buyerEmail: "bad" }));
console.log("receipt decision test passed");
