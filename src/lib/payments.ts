import Razorpay from "razorpay";

const premiumAmount = 12900;

export function getPremiumAmount() {
  return premiumAmount;
}

export function createRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are missing from environment variables.");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
}