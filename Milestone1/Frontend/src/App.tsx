import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import UploadSection from "./components/UploadSection";
import AnalyticsSection from "./components/AnalyticsSection";
import EDAReports from "./components/EDAReports";
import TransactionTable from "./components/TransactionTable";

// ✅ Updated Transaction type with proper types
interface Transaction {
  transaction_id: string;
  customer_id: string;
  kyc_verified: boolean;
  account_age_days: number;
  transaction_amount: number;
  channel: string;
  timestamp: string; // ISO string
  is_fraud: boolean;
}

const Dashboard: React.FC = () => {
  const [transactionData, setTransactionData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch data from backend API
  const fetchTransactionsFromAPI = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/transactions");
      if (response.ok) {
        const data = await response.json();
        // Convert string fields to proper types if needed
        const parsedData: Transaction[] = data.map((txn: any) => ({
          transaction_id: txn.transaction_id,
          customer_id: txn.customer_id,
          kyc_verified: txn.kyc_verified === "Yes",
          account_age_days: Number(txn.account_age_days),
          transaction_amount: Number(txn.transaction_amount),
          channel: txn.channel,
          timestamp: txn.timestamp,
          is_fraud: txn.is_fraud === "1",
        }));
        setTransactionData(parsedData);
      }
    } catch (error) {
      console.error("Error fetching data from API:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload from CSV
  const handleFileUpload = (data: Transaction[]) => {
    // Merge uploaded data with existing data
    setTransactionData((prev) => [...prev, ...data]);
  };

  // Optionally, fetch from API when component mounts
  useEffect(() => {
    fetchTransactionsFromAPI();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Upload Section */}
        <UploadSection onFileUpload={handleFileUpload} />

        {/* Analytics Dashboard */}
        <AnalyticsSection data={transactionData} />

        {/* EDA Reports */}
        <EDAReports data={transactionData} />

        {/* Transaction Table */}
        <TransactionTable data={transactionData} />
      </main>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 flex items-center space-x-4 shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-900 dark:text-gray-100">Loading data...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
