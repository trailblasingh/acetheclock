"use client";

import { useMemo, useState } from "react";
import Script from "next/script";
import { LoaderCircle, LockKeyhole, ShieldCheck, Wallet } from "lucide-react";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

type RazorpayOptions = {
  key?: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => Promise<void>;
  modal: {
    ondismiss: () => void;
  };
  theme?: {
    color: string;
  };
};

export function PaymentCheckout({ amountInPaise }: { amountInPaise: number }) {
  const [isLoading, setIsLoading] = useState(false);
  const amountLabel = useMemo(() => `₹${(amountInPaise / 100).toFixed(0)}`, [amountInPaise]);

  async function handleCheckout() {
    if (!window.Razorpay) {
      alert("Razorpay SDK failed to load.");
      return;
    }

    setIsLoading(true);

    try {
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST"
      });
      const order = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(order.message ?? "Unable to create Razorpay order.");
      }

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "AceTheClock",
        description: "Unlock all premium tests",
        handler: async function (response) {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response)
          });

          const data = await verifyRes.json();

          if (data.success) {
            localStorage.setItem("is_premium", "true");
            localStorage.setItem("isPaidUser", "true");
            window.location.href = "/topics";
          } else {
            alert("Payment verification failed");
          }
        },
        modal: {
          ondismiss: function () {
            alert("Payment cancelled");
          }
        },
        theme: {
          color: "#4F46E5"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to start payment.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="space-y-8">
        <section className="rounded-[32px] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-indigo-950/30 backdrop-blur not-dark:border-slate-200 not-dark:bg-white">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Premium Unlock</p>
          <h1 className="mt-3 text-3xl font-semibold text-white not-dark:text-slate-950">Unlock all tests for ₹129</h1>
          <p className="mt-3 max-w-2xl text-slate-300 not-dark:text-slate-600">
            Complete a one-time Razorpay payment to open every locked CAT topic and every premium mock inside AceTheClock.
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 not-dark:border-slate-200 not-dark:bg-white">
            <div className="grid gap-4 md:grid-cols-3">
              <Benefit icon={<LockKeyhole className="h-5 w-5" />} title="All premium topics" text="Arithmetic, Numbers, Algebra, Geometry, and Modern Math unlock together." />
              <Benefit icon={<ShieldCheck className="h-5 w-5" />} title="Real CAT practice" text="Use the same premium engine for sectionals, review tests, and post-test analysis." />
              <Benefit icon={<Wallet className="h-5 w-5" />} title="Razorpay checkout" text="Secure checkout powered by your existing live keys from environment variables." />
            </div>
          </div>

          <aside className="rounded-[32px] border border-indigo-400/20 bg-indigo-500/10 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Checkout summary</p>
            <p className="mt-4 text-5xl font-semibold text-white">{amountLabel}</p>
            <p className="mt-3 text-sm text-slate-200">Unlock all tests for ₹129. Razorpay receives 12900 paise internally as required.</p>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isLoading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-60"
            >
              {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {isLoading ? "Starting Razorpay..." : "Unlock all tests for ₹129"}
            </button>
          </aside>
        </section>
      </div>
    </>
  );
}

function Benefit({
  icon,
  title,
  text
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5 not-dark:border-slate-200 not-dark:bg-slate-50">
      <div className="inline-flex rounded-2xl bg-indigo-500/15 p-3 text-indigo-200 not-dark:text-indigo-700">{icon}</div>
      <h2 className="mt-4 text-lg font-semibold text-white not-dark:text-slate-950">{title}</h2>
      <p className="mt-2 text-sm text-slate-300 not-dark:text-slate-600">{text}</p>
    </div>
  );
}