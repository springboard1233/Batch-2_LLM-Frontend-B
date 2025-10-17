// src/pages/PerformancePage.tsx
import { useState, useEffect } from "react";
import { Target, TrendingUp, Award, BarChart3 } from "lucide-react";
import { fetchWithAuth } from "../api";

interface Metrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  truePositives: number;
  trueNegatives: number;
  falsePositives: number;
  falseNegatives: number;
}

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMetrics();
  }, []);

const fetchMetrics = async () => {
  setLoading(true);
  setError("");
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please login again.");
      return;
    }

    const data = await fetchWithAuth("/metrics", token);

    console.log("Raw metrics from backend:", data);

    // Normalize keys (snake_case -> camelCase)
    const normalizedMetrics: Metrics = {
      accuracy: data.accuracy ?? data.accuracy_score ?? 0,
      precision: data.precision ?? data.precision_score ?? 0,
      recall: data.recall ?? data.recall_score ?? 0,
      f1Score: data.f1Score ?? data.f1_score ?? 0,
      auc: data.auc ?? data.auc_roc ?? 0,
      truePositives: data.truePositives ?? data.tp ?? 0,
      trueNegatives: data.trueNegatives ?? data.tn ?? 0,
      falsePositives: data.falsePositives ?? data.fp ?? 0,
      falseNegatives: data.falseNegatives ?? data.fn ?? 0,
    };

    setMetrics(normalizedMetrics);

  } catch (err: any) {
    console.error("Metrics fetch error:", err);

    if (err.message.includes("<!doctype") || err.message.includes("<!DOCTYPE")) {
      setError("Server returned an HTML page. Check backend is running and returning JSON.");
    } else if (err.message.includes("401")) {
      setError("Authentication failed. Please logout and login again.");
    } else if (err.message.includes("Failed to fetch")) {
      setError("Cannot connect to backend. Is the server running on http://localhost:5000?");
    } else {
      setError(err.message || "Failed to fetch metrics");
    }
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
        {error}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg">
        No transaction data available yet. Submit some transactions to see performance metrics.
      </div>
    );
  }

  const totalSamples = metrics.truePositives + metrics.trueNegatives + 
                       metrics.falsePositives + metrics.falseNegatives;

  const falsePositiveRate = metrics.falsePositives + metrics.trueNegatives > 0
    ? (metrics.falsePositives / (metrics.falsePositives + metrics.trueNegatives) * 100).toFixed(2)
    : "0.00";

  const falseNegativeRate = metrics.falseNegatives + metrics.truePositives > 0
    ? (metrics.falseNegatives / (metrics.falseNegatives + metrics.truePositives) * 100).toFixed(2)
    : "0.00";

  // Check if metrics are artificially perfect
  const isPerfectMetrics = metrics.accuracy === 1 && metrics.precision === 1 && 
                          metrics.recall === 1 && metrics.f1Score === 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Model Performance Metrics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time evaluation metrics from your fraud detection system
        </p>
      </div>

      {/* Warning for perfect metrics */}
      {isPerfectMetrics && totalSamples > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                <strong>Note:</strong> Perfect metrics (100%) indicate the system is comparing predictions with themselves. 
                For accurate performance measurement, you need ground truth labels (manual review of which transactions were actually fraud).
                These metrics show model <strong>consistency</strong>, not real-world <strong>accuracy</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Accuracy"
          value={(metrics.accuracy * 100).toFixed(1)}
          icon={Target}
          color="bg-blue-500"
          description="Overall correctness of predictions"
        />
        <MetricCard
          title="Precision"
          value={(metrics.precision * 100).toFixed(1)}
          icon={Award}
          color="bg-green-500"
          description="Accuracy of fraud predictions"
        />
        <MetricCard
          title="Recall"
          value={(metrics.recall * 100).toFixed(1)}
          icon={TrendingUp}
          color="bg-purple-500"
          description="Ability to catch all frauds"
        />
        <MetricCard
          title="F1 Score"
          value={(metrics.f1Score * 100).toFixed(1)}
          icon={BarChart3}
          color="bg-orange-500"
          description="Balance between precision & recall"
        />
      </div>

      {/* Confusion Matrix & Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
            Confusion Matrix
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border-2 border-green-500">
              <div className="text-sm text-green-700 dark:text-green-400 font-medium mb-2">
                True Negatives
              </div>
              <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                {metrics.trueNegatives.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Correctly identified legit
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border-2 border-orange-500">
              <div className="text-sm text-orange-700 dark:text-orange-400 font-medium mb-2">
                False Positives
              </div>
              <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">
                {metrics.falsePositives}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Legit flagged as fraud
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border-2 border-red-500">
              <div className="text-sm text-red-700 dark:text-red-400 font-medium mb-2">
                False Negatives
              </div>
              <div className="text-3xl font-bold text-red-700 dark:text-red-400">
                {metrics.falseNegatives}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Fraud missed by model
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border-2 border-blue-500">
              <div className="text-sm text-blue-700 dark:text-blue-400 font-medium mb-2">
                True Positives
              </div>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                {metrics.truePositives}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Correctly detected fraud
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
            Additional Metrics
          </h3>
          <div className="space-y-4">
            <MetricRow label="AUC-ROC Score" value={metrics.auc.toFixed(3)} color="text-blue-600 dark:text-blue-400" />
            <MetricRow label="Total Samples" value={totalSamples.toLocaleString()} color="text-gray-900 dark:text-white" />
            <MetricRow label="False Positive Rate" value={`${falsePositiveRate}%`} color="text-orange-600 dark:text-orange-400" />
            <MetricRow label="False Negative Rate" value={`${falseNegativeRate}%`} color="text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>

      {/* Metric Explanations */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Understanding the Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ExplanationCard 
            title="Accuracy" 
            text="Percentage of all predictions that were correct (both fraud and legit)."
          />
          <ExplanationCard 
            title="Precision" 
            text="Of all transactions flagged as fraud, what percentage were actually fraudulent?"
          />
          <ExplanationCard 
            title="Recall (Sensitivity)" 
            text="Of all actual fraud cases, what percentage did the model successfully detect?"
          />
          <ExplanationCard 
            title="F1 Score" 
            text="Harmonic mean of precision and recall, providing a balanced measure of model performance."
          />
        </div>

        {/* Improvement Tips */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 How to Improve These Metrics</h4>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li><strong>1. Add Ground Truth Labels:</strong> Manually review transactions and mark which were actually fraud vs legit</li>
            <li><strong>2. Test with Diverse Data:</strong> Submit transactions with varying amounts, account ages, and times</li>
            <li><strong>3. Adjust Thresholds:</strong> Tune MODEL_WEIGHT (currently 60% ML, 40% rules) and ALERT_RISK_THRESHOLD (0.45)</li>
            <li><strong>4. Monitor Edge Cases:</strong> Focus on transactions near the decision boundary (40-60% risk score)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  description 
}: { 
  title: string; 
  value: string; 
  icon: any; 
  color: string; 
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {value}%
          </div>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function MetricRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </div>
  );
}

function ExplanationCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
    </div>
  );
}