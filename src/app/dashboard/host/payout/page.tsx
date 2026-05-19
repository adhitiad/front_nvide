"use client";

import PayoutSettings from "@/components/payout/PayoutSettings";

export default function HostPayoutPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black">Metode Penarikan Host</h1>
      <PayoutSettings scope="host" />
    </div>
  );
}

