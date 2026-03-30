import { NextResponse } from "next/server";

import { createRazorpayClient, getPremiumAmount } from "@/lib/payments";

export async function POST() {
  try {
    const client = createRazorpayClient();
    const order = await client.orders.create({
      amount: getPremiumAmount(),
      currency: "INR",
      receipt: `ace-${Date.now()}`
    });

    return NextResponse.json({
      id: order.id,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to create Razorpay order." },
      { status: 500 }
    );
  }
}