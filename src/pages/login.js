import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, pin }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Login successful ✅");
        console.log("Server Response: - login.js:25", data);
      } else {
        setMessage(data.error || "Login failed ❌");
      }
    } catch (error) {
      console.error("Error: - login.js:30", error);
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white transition-all duration-700">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700">PIN</label>
            <input
              type="password"
              placeholder="Enter your PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              required
            />
          </div>

          <div className="text-right">
            <a href="#" className="text-blue-500 text-sm hover:underline">
              Forgot PIN / Password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition transform hover:scale-105"
          >
            Login
          </button>
        </form>

        {message && (
          <p className="text-center mt-4 text-sm text-gray-700">{message}</p>
        )}

        <p className="text-center mt-6 text-sm text-gray-600">
          Don’t have an account?{" "}
          <a href="#" className="text-blue-500 font-medium hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}