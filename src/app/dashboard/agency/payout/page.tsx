"use client";

import PayoutSettings from "@/components/payout/PayoutSettings";

export default function AgencyPayoutPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black">Metode Penarikan Agency</h1>
      <PayoutSettings scope="agency" />
    </div>
  );
}

