import fs from "fs/promises";
import path from "path";

function appUrl() {
  return process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? "http://localhost:3000";
}

export async function sendOrderStatusEmail(opts: {
  to: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
}) {
  const subject = `Order ${opts.orderNumber} — ${opts.status}`;
  const text = `Your PharmaSupply order ${opts.orderNumber} is now ${opts.status}.\nTotal: ${opts.totalAmount}\n\nTrack orders: ${appUrl()}/my-orders`;

  const outboxDir = path.join(process.cwd(), ".data", "outbox");
  await fs.mkdir(outboxDir, { recursive: true });
  const safeName = opts.to.replace(/[^a-z0-9]/gi, "_");
  const file = path.join(outboxDir, `${Date.now()}-order-${safeName}.txt`);
  await fs.writeFile(file, `To: ${opts.to}\nSubject: ${subject}\n\n${text}\n`, "utf-8");

  console.log(`[email] Order update for ${opts.to}: ${opts.status}`);
  return { sent: false, outboxFile: file };
}
