import fs from "fs/promises";
import path from "path";

function appUrl() {
  return process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? "http://localhost:3000";
}

export async function sendVerificationEmail(opts: {
  to: string;
  name: string;
  token: string;
}) {
  const verifyUrl = `${appUrl()}/verify-email?token=${opts.token}`;
  const subject = "Verify your PharmaSupply email";
  const text = `Hello ${opts.name},\n\nVerify your PharmaSupply account (expires in 48 hours):\n${verifyUrl}`;

  const outboxDir = path.join(process.cwd(), ".data", "outbox");
  await fs.mkdir(outboxDir, { recursive: true });
  const safeName = opts.to.replace(/[^a-z0-9]/gi, "_");
  const file = path.join(outboxDir, `${Date.now()}-${safeName}.txt`);
  await fs.writeFile(file, `To: ${opts.to}\nSubject: ${subject}\n\n${text}\n`, "utf-8");

  console.log(`[email] Verification link for ${opts.to}: ${verifyUrl}`);
  console.log(`[email] Saved to ${file}`);

  return { sent: false, verifyUrl, outboxFile: file };
}
