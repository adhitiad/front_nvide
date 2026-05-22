"use client";

import { useState, useCallback, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

export interface Wallet {
  balance: number; // in IDR
  frozen_balance: number; // in IDR
  currency: string;
}

export interface Transaction {
  id: string;
  type: "deposit" | "gift_sent" | "gift_received" | "withdrawal" | "host_earning" | "agency_commission";
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed";
  reference_id: string;
  payment_method?: string;
  description?: string;
  created_at: string;
}

interface DepositPayload {
  amount: number;
  payment_method: string;
  email: string;
  customer_name: string;
}

interface WithdrawalPayload {
  amount: number;
}

interface CryptoWithdrawalPayload {
  chain: string;
  asset: string;
  address: string;
  amount: number;
}

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = (await api.get("/wallet/balance")) as Wallet;
      setWallet(data);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Gagal memuat saldo wallet";
      setError(message);
      console.error("Fetch balance error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch transaction history
  const fetchTransactions = useCallback(
    async (type?: string, limit = 20, offset = 0) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (type) params.append("type", type);
        params.append("limit", limit.toString());
        params.append("offset", offset.toString());

        const data = (await api.get(`/wallet/transactions?${params}`)) as Transaction[];
        setTransactions(data || []);
        return data;
      } catch (err: any) {
        const message = err.response?.data?.message || "Gagal memuat riwayat transaksi";
        setError(message);
        console.error("Fetch transactions error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Request deposit (Duitku)
  const requestDeposit = useCallback(async (payload: DepositPayload) => {
    try {
      setLoading(true);
      setError(null);
      const response = (await api.post("/payment/deposit", payload)) as any;
      
      if (response.payment_url) {
        toast.success("Halaman pembayaran Duitku dibuka...");
        window.open(response.payment_url, "_blank");
      }
      
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || "Gagal memproses deposit";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Request withdrawal (Bank)
  const requestWithdrawal = useCallback(async (payload: WithdrawalPayload) => {
    try {
      setLoading(true);
      setError(null);
      const response = (await api.post("/payment/withdraw", payload)) as any;
      toast.success("Penarikan dana berhasil diajukan!");
      await fetchBalance(); // Refresh balance
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || "Gagal memproses penarikan";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBalance]);

  // Request crypto withdrawal
  const requestCryptoWithdrawal = useCallback(async (payload: CryptoWithdrawalPayload) => {
    try {
      setLoading(true);
      setError(null);
      const response = (await api.post("/crypto/withdrawal", payload)) as any;
      toast.success("Penarikan USDT berhasil diajukan!");
      await fetchBalance(); // Refresh balance
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || "Gagal memproses penarikan crypto";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBalance]);

  // Get crypto deposit address
  const getCryptoDepositAddress = useCallback(async (chain: string) => {
    try {
      const response = (await api.get(`/crypto/deposit-address?chain=${chain}`)) as any;
      return response.address;
    } catch (err) {
      console.error("Gagal mendapatkan crypto deposit address:", err);
      return null;
    }
  }, []);

  // Convert coin to IDR (1 coin = 100 IDR)
  const coinToIDR = (coin: number) => coin * 100;
  const idrToCoin = (idr: number) => Math.floor(idr / 100);

  return {
    // State
    wallet,
    transactions,
    loading,
    error,
    coinBalance: wallet ? idrToCoin(wallet.balance) : 0,
    idrBalance: wallet?.balance || 0,

    // Methods
    fetchBalance,
    fetchTransactions,
    requestDeposit,
    requestWithdrawal,
    requestCryptoWithdrawal,
    getCryptoDepositAddress,

    // Utilities
    coinToIDR,
    idrToCoin,
  };
}
