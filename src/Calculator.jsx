import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast, { Toaster } from 'react-hot-toast';
import { Combobox } from '@headlessui/react';

const MAX_ENTRIES = 1000;
const EXPIRY_DAYS = 365;

const Calculator = ({ suburbs }) => {
  const [creditScore, setCreditScore] = useState('');

  const [isAdmin, setIsAdmin] = useState(false);
      const handleKeyCombo = (e) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 't') {
        setIsAdmin(true);
        toast.success('🔓 Admin access granted. Limit removed.');
      }
    };
    window.addEventListener('keydown', handleKeyCombo);
    const resetCalculator = () => {
  setInputs({
    clientName: '',
    vehiclePrice: '',
    mmValue: '',
    suburb: '',
    riskProfile: '',
    manualDeposit: '',
    termsInMonths: ''
  });
  setResults({
    deposit: 0,
    repoCost: 0,
    upfrontCost: 0,
    monthlyInstallment: 0,
    loading: 0,
    riskFactor: 0,
    totalRentalAmount: 0,
    G19: 0,
    I21: 0,
    I22: 0,
    G21: 0,
    netRentalAmount: 0,
    monthlyBasePayment: 0,
    monthlyInsurance: 0,
    profitMargin: 0,
    other: 0
  });
  setSelectedSuburbInfo(null);
  setFilteredSuburbs([]);
  setQuery('');
};

  useEffect(() => {
const handleKeyCombo = (e) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 't') {
        setIsAdmin(true);
        toast.success('🔓 Admin access granted. Limit removed.');
      }
    };
    window.addEventListener('keydown', handleKeyCombo);

    return () => window.removeEventListener('keydown', handleKeyCombo);
  }, []);

  const [inputs, setInputs] = useState({
    clientName: '',
    vehiclePrice: '',
    mmValue: '',
    suburb: '',
    riskProfile: '',
    manualDeposit: '',
    termsInMonths: ''
  });
  const [results, setResults] = useState({
    deposit: 0,
    repoCost: 0,
    upfrontCost: 0,
    monthlyInstallment: 0,
    loading: 0,
    riskFactor: 0,
    totalRentalAmount: 0,
    G19: 0,
    I21: 0,
    I22: 0,
    G21: 0,
    netRentalAmount: 0,
    monthlyBasePayment: 0,
    monthlyInsurance: 0,
    profitMargin: 0,
    other: 0
  });
  const [filteredSuburbs, setFilteredSuburbs] = useState([]);
  const [selectedSuburbInfo, setSelectedSuburbInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingCalc, setLoadingCalc] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const now = new Date();
    const storedHistory = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
    const validHistory = storedHistory.filter((entry) => {
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
    setQuery(value);
    setInputs(prev => ({ ...prev, suburb: value }));
    setSelectedSuburbInfo(null);

    if (value === '') {
      setFilteredSuburbs([]);
      return;
    }

    const filtered = suburbs.filter(sub =>
      sub.SP_NAME.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 10);
    setFilteredSuburbs(filtered);
  };

  const handleSuburbSelect = (value) => {
    setQuery(value.SP_NAME);
    setInputs(prev => ({ ...prev, suburb: value.SP_NAME }));
    setSelectedSuburbInfo(value);
    setFilteredSuburbs([]);
  };

  const saveSubmissionToLocalStorage = (submission) => {
    const now = new Date();
    const timestampedSubmission = { ...submission, timestamp: now.toISOString() };
    const storedHistory = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
    const validHistory = storedHistory.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      const diffInDays = (now - entryDate) / (1000 * 60 * 60 * 24);
      return diffInDays <= EXPIRY_DAYS;
    });
    const updatedHistory = [timestampedSubmission, ...validHistory].slice(0, MAX_ENTRIES);
    localStorage.setItem('calculatorHistory', JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
  };

  const calculate = () => {
    const storedHistory = JSON.parse(localStorage.getItem('calculatorHistory')) || [];

    // Enforce max entries unless admin
    if (!isAdmin && storedHistory.length >= MAX_ENTRIES) {
      toast.error(`Maximum of ${MAX_ENTRIES} calculations reached. Please wait or activate admin mode.`);
      return;
    }

    const price = parseFloat(inputs.vehiclePrice);
    const mm = parseFloat(inputs.mmValue);
    const terms = parseInt(inputs.termsInMonths);
const errors = {};

if (!inputs.clientName) {
  errors.clientName = 'Client Name is required.';
}

if (isNaN(price) || price <= 0) {
  errors.price = 'Vehicle Price must be a valid number greater than 0.';
}

if (isNaN(mm) || mm <= 0) {
  errors.mm = 'M&M Value must be a valid number greater than 0.';
}

if (!inputs.suburb) {
  errors.suburb = 'Please select a Suburb.';
}

if (!selectedSuburbInfo) {
  errors.selectedSuburbInfo = 'Selected Suburb is invalid or not found in the database.';
}

if (!inputs.riskProfile) {
  errors.riskProfile = 'Please select a Risk Profile.';
}

if (isNaN(terms) || terms <= 0) {
  errors.terms = 'Terms must be a valid number greater than 0.';
}

if (isNaN(inputs.creditScore) || inputs.creditScore < 0 || inputs.creditScore > 999) {
  errors.creditScore = 'Credit Score must be a number between 0 and 999.';
}

if (Object.keys(errors).length > 0) {
  Object.values(errors).forEach(msg => toast.error(msg));
  setInputErrors(errors);  // State to trigger red borders
  return;
}

// If all inputs are valid
setInputErrors({});  // Clear any previous errors

    setLoadingCalc(true);
    setTimeout(() => {
      // Loading
      const loading = price * 0.10;
      // Risk Factor
      let riskFactor = loading;
      if (inputs.riskProfile === 'Low') riskFactor = loading * 0.9;
      if (inputs.riskProfile === 'High') riskFactor = loading * 1.1;
      // Total Rental Amount
      const totalRentalAmount = price + riskFactor;
      // Repo Cost
      const distance = parseFloat(selectedSuburbInfo.DIST_KM);
      const repoCost = distance * 10;
      
      // G19
      const G19 = totalRentalAmount * 0.20 + repoCost;
      // I22
      const I22 = repoCost;
      // I21
      const I21 = totalRentalAmount - 110000 + 4000;
      // G21
      const G21 = I21 + I22;
      // Deposit
      const deposit = inputs.manualDeposit
        ? parseFloat(inputs.manualDeposit)
        : G21;
      // Net Rental Amount
      const netRentalAmount = totalRentalAmount - (deposit + repoCost);
      // Upfront Cost
      const licenseAndRegistration = 2500;
      const documentFees = 1500;
      const upfrontCost = netRentalAmount + licenseAndRegistration + documentFees;
      // Monthly base payment
      const monthlyBasePayment = upfrontCost / terms;
      // Monthly insurance
      const monthlyInsurance = mm * 0.008167;
      // Profit Margin
      const profitMargin = monthlyBasePayment * 1.05;
      // Other
      const other = 0;
      // Monthly Installment
      const monthlyInstallment =
        monthlyBasePayment + monthlyInsurance + profitMargin;

      const newResults = {
        loading,
        riskFactor,
        totalRentalAmount,
        repoCost,
        G19,
        I22,
        I21,
        G21,
        deposit,
        netRentalAmount,
        upfrontCost,
        monthlyBasePayment,
        monthlyInsurance,
        profitMargin,
        other,
        monthlyInstallment
      };
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
          ['Client Name', inputs.clientName],
          ['Vehicle Price', `R${inputs.vehiclePrice}`],
          ['Retail Value', `R${inputs.mmValue}`],
          ['Suburb', inputs.suburb],
          ['Town', selectedSuburbInfo?.MP_NAME || ''],
          ['Municipality', selectedSuburbInfo?.DC_NAME || ''],
          ['Province', selectedSuburbInfo?.Province || ''],
          ['Distance (km)', selectedSuburbInfo?.DIST_KM || ''],
          ['Risk Profile', inputs.riskProfile],
          ['Loading', `R${results.loading.toLocaleString()}`],
          ['Risk Factor', `R${results.riskFactor.toLocaleString()}`],
          ['Total Rental Amount', `R${results.totalRentalAmount.toLocaleString()}`],
          ['Repo Cost', `R${results.repoCost.toLocaleString()}`],
          
          ['Manual Deposit', inputs.manualDeposit ? `R${inputs.manualDeposit}` : ''],
          ['Net Rental Amount', `R${results.netRentalAmount.toLocaleString()}`],
          ['License & Registration', `R2500`],
          ['Document Fees', `R1500`],
          ['Upfront Cost', `R${results.upfrontCost.toLocaleString()}`],
          ['Terms (months)', inputs.termsInMonths],
          
          ['Monthly Installment', `R${results.monthlyInstallment.toFixed(2)}`]
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
      <div className="flex items-center mb-6 bg-white p-2 rounded shadow">
        <img src="/smart logo.jpg" alt="SmartRent Auto Logo" className="h-10 w-auto mr-3" />
        <h1 className="text-2xl font-bold text-gray-800">SmartRent Auto™ Calculator</h1>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Client Name
        </label>
      <input
        type="text"
        name="clientName"
        placeholder="Client Name"
        value={inputs.clientName}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-3"
      />
      </div>

         <div className="mb-3">
    <label htmlFor="vehiclePrice" className="block text-sm font-medium text-gray-700 mb-1">
      Vehicle Price
    </label>
    <div className="relative flex items-center">
      <span className="absolute left-3 text-gray-500 pointer-events-none">R</span>
      <input
        id="vehiclePrice"
        type="number"
        name="vehiclePrice"
        placeholder="Vehicle Price"
        value={inputs.vehiclePrice}
        onChange={handleChange}
        className="w-full pl-7 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  </div>
  
        <div className="relative mb-3">
          <label htmlFor="mmValue" className="block text-sm font-medium text-gray-700 mb-1">
            Retail Value
          </label>
            <div className="relative flex items-center">
            <span className="absolute left-3 text-gray-500 pointer-events-none">R</span>


          <input
            id="mmValue"
            type="number"
            name="mmValue"
            placeholder="Retail Value"
            value={inputs.mmValue}
            onChange={handleChange}
            className="w-full pl-7 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
         />
        </div>
       </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Suburb name
        </label>
      <Combobox value={inputs.suburb} onChange={handleSuburbSelect}>
        <Combobox.Input
          placeholder="Start typing suburb..."
          className="w-full p-2 border rounded mb-3"
          onChange={(e) => handleSuburbInputChange(e.target.value)}
        />
        <Combobox.Options className="border rounded shadow bg-white max-h-60 overflow-y-auto">
          {filteredSuburbs.map((suburb, idx) => (
            <Combobox.Option key={idx} value={suburb}>
              {suburb.SP_NAME} ({suburb.MP_NAME})
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
      </div>
      {selectedSuburbInfo && (
        <div className="text-sm text-gray-700 mb-4">
          <p><strong>Town:</strong> {selectedSuburbInfo.MP_NAME}</p>
          <p><strong>Municipality:</strong> {selectedSuburbInfo.DC_NAME}</p>
          <p><strong>Province:</strong> {selectedSuburbInfo.Province}</p>
          <p><strong>Distance (km):</strong> {selectedSuburbInfo.DIST_KM}</p>
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Risk Profile
        </label>
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
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Credit Score
        </label>
        <input
          type="number"
          className="w-full p-2 border border-gray-300 rounded"
          value={creditScore}
          onChange={(e) => setCreditScore(e.target.value)}
          placeholder="e.g. 650"
          min="0"
          max="999"
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700">Terms in months</label>
        <input
          type="number"
          name="termsInMonths"
          placeholder="Enter terms in months"
          value={inputs.termsInMonths}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-1"
        />
      </div>
      <button
        onClick={calculate}
        className="w-full bg-blue-600 text-white py-2 rounded mb-4 hover:bg-blue-700"
        disabled={loadingCalc}
      >
        {loadingCalc ? 'Calculating...' : 'Calculate'}
      </button>
<button
  onClick={resetCalculator}
  className="w-full bg-gray-600 text-white py-2 rounded mb-4 hover:bg-gray-700"
  disabled={loadingCalc}
>
  Reset
</button>
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="font-semibold mb-2">Results</h2>
        <p>Deposit: <strong>R{results.deposit.toLocaleString()}</strong></p>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700">Manual Deposit</label>
          <input
            type="number"
            name="manualDeposit"
            placeholder="Enter manual deposit"
            value={inputs.manualDeposit}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </div>
        <p>Repo Cost: <strong>R{results.repoCost.toLocaleString()}</strong></p>
        <p>Net Rental Amount: <strong>R{results.netRentalAmount.toLocaleString()}</strong></p>
        <p>Upfront Cost: <strong>R{results.upfrontCost.toLocaleString()}</strong></p>
        
        <p>Monthly Installment: <strong>R{results.monthlyInstallment.toFixed(2)}</strong></p>
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
              <li key={idx} className="p-2 border rounded hover:bg-gray-50">
                <div><strong>Client:</strong> {entry.inputs.clientName}</div>
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


