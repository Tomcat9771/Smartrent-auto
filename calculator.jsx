import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast, { Toaster } from 'react-hot-toast';
import { Combobox } from '@headlessui/react';
import suburbs from './Suburbs.json';

const MAX_ENTRIES = 10;
const EXPIRY_DAYS = 7;

const Calculator = () => {
  const [inputs, setInputs] = useState({
    vehiclePrice: '',
    mmValue: '',
    suburb: '',
    riskProfile: '',
  });
  const [results, setResults] = useState({
    deposit: 0,
    repoCost: 0,
    upfrontCost: 0,
    monthlyInstallment: 0,
  });
  const [filteredSuburbs, setFilteredSuburbs] = useState([]);
  const [selectedSuburbInfo, setSelectedSuburbInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingCalc, setLoadingCalc] = useState(false);

  useEffect(() => {
    const now = new Date();
    const history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
    const validHistory = history.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      const diffInDays = (now - entryDate) / (1000 * 60 * 60 * 24);
      return diffInDays <= EXPIRY_DAYS;
    });
    setHistory(validHistory);
    localStorage.setItem('calculatorHistory', JSON.stringify(validHistory));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'suburb') setSelectedSuburbInfo(null);
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleSuburbInputChange = (value) => {
    setInputs(prev => ({ ...prev, suburb: value }));
    setSelectedSuburbInfo(null);
    const filtered = suburbs.filter(sub =>
      sub.Suburb.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 10);
    setFilteredSuburbs(filtered);
  };

  const handleSuburbSelect = (value) => {
    setInputs(prev => ({ ...prev, suburb: value.Suburb }));
    setSelectedSuburbInfo(value);
    setFilteredSuburbs([]);
  };

  const saveSubmissionToLocalStorage = (submission) => {
    const now = new Date();
    const timestampedSubmission = { ...submission, timestamp: now.toISOString() };
    const history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
    const validHistory = history.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      const diffInDays = (now - entryDate) / (1000 * 60 * 60 * 24);
      return diffInDays <= EXPIRY_DAYS;
    });
    const updatedHistory = [timestampedSubmission, ...validHistory].slice(0, MAX_ENTRIES);
    localStorage.setItem('calculatorHistory', JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
  };

  const calculate = () => {
    const price = parseFloat(inputs.vehiclePrice);
    const mm = parseFloat(inputs.mmValue);
    if (
      isNaN(price) || price <= 0 ||
      isNaN(mm) || mm <= 0 ||
      !inputs.suburb ||
      !inputs.riskProfile ||
      !selectedSuburbInfo
    ) {
      toast.error('Please fill in all fields correctly before calculating.');
      return;
    }

    setLoadingCalc(true);
    setTimeout(() => {
      const distance = parseFloat(selectedSuburbInfo.Distance_km);
      const riskMultiplier =
        inputs.riskProfile === 'High' ? 1.3 :
        inputs.riskProfile === 'Medium' ? 1.15 : 1.0;
      const deposit = Math.round(price * 0.1 + distance * 30 * riskMultiplier);
      const repoCost = Math.round(mm * 0.05);
      const upfrontCost = Math.min(deposit + repoCost, 110000);
      const monthlyInstallment = Math.round((price - deposit) / 48);

      const newResults = { deposit, repoCost, upfrontCost, monthlyInstallment };
      setResults(newResults);

      saveSubmissionToLocalStorage({ inputs, results: newResults });
      toast.success('Calculation completed!');
      setLoadingCalc(false);
    }, 400);
  };

  const exportPDF = () => {
    setLoadingPdf(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('SmartRent Auto™ - Calculation Summary', 14, 15);
      autoTable(doc, {
        startY: 25,
        head: [['Field', 'Value']],
        body: [
          ['Vehicle Price', `R${inputs.vehiclePrice}`],
          ['M&M Value', `R${inputs.mmValue}`],
          ['Suburb', inputs.suburb],
          ['Town', selectedSuburbInfo?.Town || ''],
          ['Municipality', selectedSuburbInfo?.Municipality || ''],
          ['Province', selectedSuburbInfo?.Province || ''],
          ['Distance (km)', selectedSuburbInfo?.Distance_km || ''],
          ['Risk Profile', inputs.riskProfile],
          ['Deposit', `R${results.deposit}`],
          ['Repo Cost', `R${results.repoCost}`],
          ['Upfront Cost', `R${results.upfrontCost}`],
          ['Monthly Installment', `R${results.monthlyInstallment}`],
        ],
      });
      doc.save('SmartRentAuto_Calculation.pdf');
      toast.success('PDF exported successfully!');
    } catch (err) {
      toast.error('Failed to export PDF.');
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6 text-center">SmartRent Auto™ Calculator</h1>

      <input
        type="number"
        name="vehiclePrice"
        placeholder="Vehicle Price"
        value={inputs.vehiclePrice}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-3"
      />
      <input
        type="number"
        name="mmValue"
        placeholder="M&M Value"
        value={inputs.mmValue}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-3"
      />

      <Combobox value={inputs.suburb} onChange={handleSuburbSelect}>
        <Combobox.Input
          placeholder="Start typing suburb..."
          className="w-full p-2 border rounded mb-3"
          onChange={(e) => handleSuburbInputChange(e.target.value)}
        />
        <Combobox.Options className="border rounded shadow bg-white max-h-60 overflow-y-auto">
          {filteredSuburbs.map((suburb, idx) => (
            <Combobox.Option key={idx} value={suburb}>
              {suburb.Suburb} ({suburb.Town})
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>

      <select
        name="riskProfile"
        value={inputs.riskProfile}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">Select Risk Profile</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>

      <button
        onClick={calculate}
        className="w-full bg-blue-600 text-white py-2 rounded mb-4 hover:bg-blue-700"
        disabled={loadingCalc}
      >
        {loadingCalc ? 'Calculating...' : 'Calculate'}
      </button>

      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="font-semibold mb-2">Results</h2>
        <p>Deposit: <strong>R{results.deposit.toLocaleString()}</strong></p>
        <p>Repo Cost: <strong>R{results.repoCost.toLocaleString()}</strong></p>
        <p>Upfront Cost (max R110,000): <strong>R{results.upfrontCost.toLocaleString()}</strong></p>
        <p>Monthly Installment (48 months): <strong>R{results.monthlyInstallment.toLocaleString()}</strong></p>
      </div>

      <button
        onClick={exportPDF}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        disabled={loadingPdf}
      >
        {loadingPdf ? 'Exporting PDF...' : 'Export to PDF'}
      </button>

      <section className="mt-8">
        <h3 className="font-semibold mb-2">Calculation History</h3>
        {history.length === 0 ? (
          <p>No recent calculations.</p>
        ) : (
          <ul className="space-y-2 max-h-60 overflow-y-auto border rounded p-2 bg-white">
            {history.map((entry, idx) => (
              <li
                key={idx}
                className="p-2 border rounded hover:bg-gray-50"
              >
                <div><strong>Suburb:</strong> {entry.inputs.suburb}</div>
                <div><strong>Vehicle Price:</strong> R{parseFloat(entry.inputs.vehiclePrice).toLocaleString()}</div>
                <div><strong>Risk:</strong> {entry.inputs.riskProfile}</div>
                <div><strong>Deposit:</strong> R{entry.results.deposit.toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Calculator;
