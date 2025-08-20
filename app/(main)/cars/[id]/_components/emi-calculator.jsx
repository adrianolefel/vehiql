"use client";
import React, { useState } from "react";

function EmiCalculator({ price = 1000 }) {
  const [carPrice, setCarPrice] = useState(price);
  const [downPayment, setDownPayment] = useState("0");
  const [loanTenure, setLoanTenure] = useState("1");
  const [interestRate, setInterestRate] = useState("5");
  const [results, setResults] = useState(null);

  const calculateEMI = () => {
    const principal = parseFloat(carPrice) - parseFloat(downPayment || 0);
    const monthlyRate = parseFloat(interestRate) / 100 / 12;
    const months = parseInt(loanTenure);

    if (principal <= 0 || monthlyRate <= 0 || months <= 0) {
      setResults(null);
      return;
    }

    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    const totalAmount = emi * months;
    const totalInterest = totalAmount - principal;

    setResults({
      emi: Math.round(emi),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest),
      principal: Math.round(principal),
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("fr-FR").format(num);
  };

  const getDownPaymentPercentage = () => {
    if (!carPrice || !downPayment) return 0;
    return Math.round((parseFloat(downPayment) / parseFloat(carPrice)) * 100);
  };

  React.useEffect(() => {
    if (carPrice && loanTenure && interestRate) {
      calculateEMI();
    }
  }, [carPrice, downPayment, loanTenure, interestRate]);

  return (
    <div className="max-w-2xl mx-auto p-2">
      <div className="text-center mb-3">
        <h2 className="text-lg font-bold mb-1">
          EMI Calculator
        </h2>
        <p className="text-xs text-gray-600">
          Calculate your monthly car loan payments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <h3 className="text-base font-semibold mb-3 text-gray-900">Loan Details</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Car Price (FCFA)
              </label>
              <input
                type="number"
                name="carPrice"
                value={carPrice}
                onChange={(e) => setCarPrice(e.target.value)}
                placeholder="e.g., 15000000"
                className="w-full px-2 py-1.5 rounded border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Down Payment (FCFA){" "}
                {downPayment && carPrice && (
                  <span className="text-green-600 text-xs">
                    ({getDownPaymentPercentage()}%)
                  </span>
                )}
              </label>
              <input
                type="number"
                name="downPayment"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                placeholder="e.g., 3000000"
                className="w-full px-2 py-1.5 rounded border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Loan Tenure (
                {loanTenure ? Math.round((loanTenure / 12) * 10) / 10 : 0}{" "}
                years)
              </label>
              <input
                type="number"
                name="loanTenure"
                value={loanTenure}
                onChange={(e) => setLoanTenure(e.target.value)}
                placeholder="e.g., 60"
                className="w-full px-2 py-1.5 rounded border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Interest Rate ({interestRate}% per annum)
              </label>
              <input
                type="number"
                name="interestRate"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="e.g., 12.5"
                step="0.1"
                className="w-full px-2 py-1.5 rounded border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-xs"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <h3 className="text-base font-semibold mb-3 text-gray-900">Results</h3>

          {results ? (
            <div className="space-y-3">
              <div className="bg-blue-50 text-blue-900 rounded-lg p-3 text-center border border-blue-200">
                <h4 className="text-xs font-medium mb-1">Monthly EMI</h4>
                <p className="text-lg font-bold">
                  {formatCurrency(results.emi)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                  <span className="text-gray-600 text-xs">Principal</span>
                  <span className="font-semibold text-gray-900 text-xs">
                    {formatCurrency(results.principal)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                  <span className="text-gray-600 text-xs">Total Interest</span>
                  <span className="font-semibold text-orange-600 text-xs">
                    {formatCurrency(results.totalInterest)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                  <span className="text-gray-600 text-xs">Total Payable</span>
                  <span className="font-semibold text-green-600 text-xs">
                    {formatCurrency(results.totalAmount)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-gray-600 text-xs">Tenure</span>
                  <span className="font-semibold text-gray-900 text-xs">
                    {loanTenure} months ({Math.round((loanTenure / 12) * 10) / 10}y)
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <h5 className="font-medium mb-1 text-gray-900 text-xs">Summary</h5>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Pay{" "}
                  <strong className="text-gray-900">
                    {formatCurrency(results.emi)}
                  </strong>{" "}
                  monthly for{" "}
                  <strong className="text-gray-900">
                    {loanTenure} months
                  </strong>
                  , total interest:{" "}
                  <strong className="text-orange-600">
                    {formatCurrency(results.totalInterest)}
                  </strong>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-3xl text-gray-400 mb-1">📊</div>
              <p className="text-gray-500 text-xs">
                Fill loan details to calculate EMI
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
        <h4 className="text-xs font-semibold mb-1 text-gray-900">Formula</h4>
        <p className="text-gray-700 text-xs">
          <strong>EMI = [P × R × (1+R)^N] / [(1+R)^N-1]</strong>
        </p>
        <div className="grid grid-cols-3 gap-1 mt-1 text-xs text-gray-600">
          <div><strong>P</strong> = Principal</div>
          <div><strong>R</strong> = Monthly rate</div>
          <div><strong>N</strong> = Months</div>
        </div>
      </div>
    </div>
  );
}

export default EmiCalculator;