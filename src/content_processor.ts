export type Order = {
  orderId: string;
  buyerEmail: string;
  buyerName: string;
  title: string;
  downloadUrl: string;
  amountCents: number;
};

export function renderReceipt(order: Order): string {
  const amount = (order.amountCents / 100).toFixed(2);
  return `<h1>Thanks for supporting ${escapeHtml(order.title)}</h1><p>Hi ${escapeHtml(order.buyerName)}, your receipt is ready.</p><p>Total: $${amount}</p><p><a href="${escapeHtml(order.downloadUrl)}">Download your digital asset</a></p>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}
