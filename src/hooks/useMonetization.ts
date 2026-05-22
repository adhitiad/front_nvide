"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallet, type Wallet, type Transaction } from "./useWallet";
import { useGifts, type Gift, type GiftTransaction } from "./useGifts";

export interface MonetizationState {
  wallet: Wallet | null;
  transactions: Transaction[];
  gifts: Gift[];
  coinBalance: number;
  idrBalance: number;
  isLoading: boolean;
  error: string | null;
}

export function useMonetization(autoLoad = true) {
  const wallet = useWallet();
  const gifts = useGifts();
  const [state, setState] = useState<MonetizationState>({
    wallet: null,
    transactions: [],
    gifts: [],
    coinBalance: 0,
    idrBalance: 0,
    isLoading: false,
    error: null,
  });

  // Initialize data on mount
  useEffect(() => {
    if (autoLoad) {
      loadAll();
    }
  }, [autoLoad]);

  // Load all monetization data
  const loadAll = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      await Promise.all([
        wallet.fetchBalance(),
        wallet.fetchTransactions(),
        gifts.fetchGiftCatalog(),
      ]);

      setState((prev) => ({
        ...prev,
        wallet: wallet.wallet,
        transactions: wallet.transactions,
        gifts: gifts.gifts,
        coinBalance: wallet.coinBalance,
        idrBalance: wallet.idrBalance,
        isLoading: false,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err.message || "Gagal memuat data monetization",
        isLoading: false,
      }));
    }
  }, [wallet, gifts]);

  // Refresh wallet data
  const refreshWallet = useCallback(async () => {
    await wallet.fetchBalance();
    setState((prev) => ({
      ...prev,
      wallet: wallet.wallet,
      coinBalance: wallet.coinBalance,
      idrBalance: wallet.idrBalance,
    }));
  }, [wallet]);

  // Refresh transactions
  const refreshTransactions = useCallback(async () => {
    await wallet.fetchTransactions();
    setState((prev) => ({
      ...prev,
      transactions: wallet.transactions,
    }));
  }, [wallet]);

  // Refresh gifts catalog
  const refreshGifts = useCallback(async () => {
    await gifts.fetchGiftCatalog();
    setState((prev) => ({
      ...prev,
      gifts: gifts.gifts,
    }));
  }, [gifts]);

  return {
    // Aggregated state
    ...state,

    // Wallet operations
    wallet: {
      balance: wallet.wallet,
      coinBalance: wallet.coinBalance,
      idrBalance: wallet.idrBalance,
      transactions: wallet.transactions,
      fetchBalance: wallet.fetchBalance,
      fetchTransactions: wallet.fetchTransactions,
      requestDeposit: wallet.requestDeposit,
      requestWithdrawal: wallet.requestWithdrawal,
      requestCryptoWithdrawal: wallet.requestCryptoWithdrawal,
      getCryptoDepositAddress: wallet.getCryptoDepositAddress,
    },

    // Gift operations
    gifts: {
      catalog: gifts.gifts,
      loading: gifts.loading,
      sending: gifts.sending,
      fetchGiftCatalog: gifts.fetchGiftCatalog,
      sendGift: gifts.sendGift,
      sendPrivateGift: gifts.sendPrivateGift,
      sendStreamGift: gifts.sendStreamGift,
      getGiftLeaderboard: gifts.getGiftLeaderboard,
    },

    // Refresh operations
    refresh: {
      all: loadAll,
      wallet: refreshWallet,
      transactions: refreshTransactions,
      gifts: refreshGifts,
    },

    // Utilities
    coinToIDR: wallet.coinToIDR,
    idrToCoin: wallet.idrToCoin,
  };
}
