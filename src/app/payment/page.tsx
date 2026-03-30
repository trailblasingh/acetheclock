import { PaymentCheckout } from "@/components/payment-checkout";
import { getPremiumAmount } from "@/lib/payments";

export default function PaymentPage() {
  return <PaymentCheckout amountInPaise={getPremiumAmount()} />;
}