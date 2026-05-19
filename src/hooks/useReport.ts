import { useReportStore } from "@/store/useReportStore";

export function useReport() {
  const { reports, loading, error, submitReport, fetchReports, resolveReport } = useReportStore();

  return {
    reports,
    loading,
    error,
    submitReport,
    fetchReports,
    resolveReport
  };
}
