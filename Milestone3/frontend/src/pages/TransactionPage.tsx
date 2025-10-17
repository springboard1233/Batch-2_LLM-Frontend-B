// src/pages/TransactionPage.tsx
import { useState } from "react";
import { postWithAuth } from "../api";

interface PredictionResult {
  transaction_id: string;
  db_transaction_id: number;
  prediction: string;
  risk_score: number;
  ml_probability: number;
  rule_score: number;
  reasons: string[];
  message: string;
}

export default function TransactionPage() {
  const [formData, setFormData] = useState({
    customer_id: "",
    account_age_days: "",
    transaction_amount: "",
    channel: "Mobile",
    kyc_verified: "Yes",
    timestamp: "",
    transaction_id: "",
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }
      
      // Encode channel as numeric (Mobile=0, POS=1, ATM=2, Web=3)
      const channelMapping: { [key: string]: number } = {
        "Mobile": 0,
        "POS": 1,
        "ATM": 2,
        "Web": 3
      };
      
      // Prepare the payload - convert string values to appropriate types
      const payload = {
        ...formData,
        account_age_days: parseInt(formData.account_age_days) || 0,
        transaction_amount: parseFloat(formData.transaction_amount) || 0,
        channel: channelMapping[formData.channel] ?? 0,
        kyc_verified: formData.kyc_verified === "Yes" ? 1 : 0,
        transaction_id: formData.transaction_id || `tx_${Date.now()}`
      };

      const data = await postWithAuth("/predict", token, payload);
      
      // The API now returns {results: [...]}
      if (data.results && data.results.length > 0) {
        setResult(data.results[0]);
      } else {
        throw new Error("No results returned from API");
      }
    } catch (err: any) {
      console.error("Prediction error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-600 dark:text-blue-400">
        New Transaction
      </h2>

      {/* Transaction Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="transaction_id"
          placeholder="Transaction ID (optional)"
          value={formData.transaction_id}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <input
          type="text"
          name="customer_id"
          placeholder="Customer ID"
          value={formData.customer_id}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
          required
        />
        <input
          type="number"
          name="account_age_days"
          placeholder="Account Age (days)"
          value={formData.account_age_days}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
          required
        />
        <input
          type="number"
          step="0.01"
          name="transaction_amount"
          placeholder="Transaction Amount (₹)"
          value={formData.transaction_amount}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
          required
        />
        <select
          name="channel"
          value={formData.channel}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
        >
          <option value="Mobile">Mobile</option>
          <option value="POS">POS</option>
          <option value="ATM">ATM</option>
          <option value="Web">Web</option>
        </select>
        <select
          name="kyc_verified"
          value={formData.kyc_verified}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
        >
          <option value="Yes">KYC Verified - Yes</option>
          <option value="No">KYC Verified - No</option>
        </select>
        <input
          type="datetime-local"
          name="timestamp"
          value={formData.timestamp}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Submit Transaction"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6 p-5 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md border border-gray-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Prediction Result
          </h3>
          
          <div className="space-y-3">
            <ResultRow label="Transaction ID" value={result.transaction_id} />
            
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Prediction:</span>
              <span
                className={`font-bold text-lg ${
                  result.prediction === "Fraud"
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {result.prediction}
              </span>
            </div>
            
            <ResultRow 
              label="Risk Score" 
              value={`${(result.risk_score * 100).toFixed(2)}%`} 
              bold 
            />
            <ResultRow 
              label="ML Probability" 
              value={`${(result.ml_probability * 100).toFixed(2)}%`} 
            />
            <ResultRow 
              label="Rule Score" 
              value={`${(result.rule_score * 100).toFixed(2)}%`} 
            />
            
            {result.reasons && result.reasons.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                <span className="text-gray-700 dark:text-gray-300 font-medium block mb-2">
                  Risk Reasons:
                </span>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {result.reasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
              <span className="text-gray-700 dark:text-gray-300 font-medium block mb-1">
                Summary:
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400">{result.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for consistent row display
function ResultRow({ 
  label, 
  value, 
  bold = false 
}: { 
  label: string; 
  value: string; 
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-700 dark:text-gray-300 font-medium">{label}:</span>
      <span className={`text-gray-900 dark:text-white ${bold ? 'font-semibold' : ''}`}>
        {value}
      </span>
    </div>
  );
}