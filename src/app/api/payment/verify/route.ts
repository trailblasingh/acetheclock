import { NextResponse } from "next/server";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";
import { z } from "zod";

const verificationSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string()
});

export async function POST(request: Request) {
  try {
    const payload = verificationSchema.parse(await request.json());
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json({ success: false, message: "Razorpay secret missing." }, { status: 400 });
    }

    const verified = validatePaymentVerification(
      {
        order_id: payload.razorpay_order_id,
        payment_id: payload.razorpay_payment_id
      },
      payload.razorpay_signature,
      secret
    );

    return NextResponse.json({ success: verified });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Verification failed." },
      { status: 400 }
    );
  }
}