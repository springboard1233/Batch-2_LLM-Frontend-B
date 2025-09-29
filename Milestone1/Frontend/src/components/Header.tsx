import React from "react";
import { Shield, Users } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left section: Logo + Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                FraudGuard Analytics
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                BFSI Transaction Monitoring System
              </p>
            </div>
          </div>

          {/* Right section: Team info + Theme toggle */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <Users className="h-4 w-4" />
              <span>Team B</span>
            </div>
            <ThemeToggle />
          </div>
          
        </div>
      </div>
    </header>
  );
};

export default Header;
