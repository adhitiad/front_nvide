import { useEffect, useState } from "react";
import { usePredictionStore } from "@/store/usePredictionStore";

export function usePrediction(streamId: string) {
  const {
    activePrediction,
    userBet,
    loading,
    error,
    fetchActivePrediction,
    placeBet,
    claimWinnings,
  } = usePredictionStore();

  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (streamId) {
      fetchActivePrediction(streamId);
    }
  }, [streamId, fetchActivePrediction]);

  // Efek countdown timer real-time
  useEffect(() => {
    if (!activePrediction || activePrediction.status !== "active") {
      setTimeLeft(0);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = +new Date(activePrediction.endsAt) - +new Date();
      return difference > 0 ? Math.floor(difference / 1000) : 0;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const current = calculateTimeLeft();
      setTimeLeft(current);
      if (current <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activePrediction]);

  const formatTimeLeft = () => {
    if (timeLeft <= 0) return "Ditutup";
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return {
    activePrediction,
    userBet,
    loading,
    error,
    timeLeft,
    isClosed: timeLeft <= 0,
    formattedTimeLeft: formatTimeLeft(),
    placeBet,
    claimWinnings,
    refetch: () => fetchActivePrediction(streamId),
  };
}
