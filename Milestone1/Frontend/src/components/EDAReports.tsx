import React from "react";
import {
  BarChart3,
  CreditCard,
  Users,
} from "lucide-react";

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

interface StatEntry {
  total: number;
  fraud: number;
  legitimate: number;
}

type ChannelStats = Record<string, StatEntry>;
type KYCStats = Record<string, StatEntry>;

interface Props {
  data: Transaction[];
}

const EDAReports: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6 text-center text-gray-500">
        No data available for analysis.
      </div>
    );
  }

  // --- Channel Stats ---
  const channelStats: ChannelStats = data.reduce((acc, transaction) => {
    const { channel, is_fraud } = transaction;
    if (!acc[channel]) {
      acc[channel] = { total: 0, fraud: 0, legitimate: 0 };
    }
    acc[channel].total++;
    if (is_fraud) acc[channel].fraud++;
    else acc[channel].legitimate++;
    return acc;
  }, {} as ChannelStats);

  // --- KYC Stats ---
  const kycStats: KYCStats = data.reduce((acc, transaction) => {
    const kycStatus = transaction.kyc_verified ? "Verified" : "Unverified";
    if (!acc[kycStatus]) {
      acc[kycStatus] = { total: 0, fraud: 0, legitimate: 0 };
    }
    acc[kycStatus].total++;
    if (transaction.is_fraud) acc[kycStatus].fraud++;
    else acc[kycStatus].legitimate++;
    return acc;
  }, {} as KYCStats);

  const maxChannelCount = Math.max(
    ...Object.values(channelStats).map((stat) => stat.total)
  );

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-gray-100">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        Exploratory Data Analysis
      </h2>

      {/* Channel Distribution */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <CreditCard className="w-5 h-5 text-purple-600" />
          Transactions by Channel
        </h3>
        <div className="space-y-4">
          {Object.entries(channelStats).map(([channel, stats]) => (
            <div key={channel}>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">{channel}</span>
                <span>
                  {stats.total} transactions (
                  {((stats.fraud / stats.total) * 100).toFixed(1)}% fraud)
                </span>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex">
                <div
                  className="bg-green-500"
                  style={{
                    width: `${(stats.legitimate / maxChannelCount) * 100}%`,
                  }}
                />
                <div
                  className="bg-red-500"
                  style={{
                    width: `${(stats.fraud / maxChannelCount) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Legitimate: {stats.legitimate}</span>
                <span>Fraud: {stats.fraud}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KYC Verification */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <Users className="w-5 h-5 text-green-600" />
          Fraud by KYC Status
        </h3>
        <div className="grid grid-cols-2 gap-6">
          {Object.entries(kycStats).map(([status, stats]) => (
            <div
              key={status}
              className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm"
            >
              <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">
                {status}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {stats.total} transactions
              </p>
              <div
                className={`text-sm font-semibold ${
                  stats.fraud / stats.total > 0.1
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {((stats.fraud / stats.total) * 100).toFixed(1)}% fraud
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded mt-2 overflow-hidden">
                <div
                  className="h-full bg-red-500"
                  style={{
                    width: `${(stats.fraud / stats.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EDAReports;
