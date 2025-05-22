import React, { useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';
import suburbsData from '/Suburbs.json';

const Calculator = () => {
  const [suburbs, setSuburbs] = useState([]);
  const [filteredSuburbs, setFilteredSuburbs] = useState([]);
  const [selectedSuburbInfo, setSelectedSuburbInfo] = useState(null);
  const [suburbInput, setSuburbInput] = useState('');

  const [inputs, setInputs] = useState({
    clientName: '',
    suburb: '',
    riskProfile: '',
    retailValue: '',
    vehiclePrice: '',
    insuranceCost: '',
    adminFee: '',
    interestRate: '',
  });

  const [results, setResults] = useState({
    deposit: 0,
    repoCost: 0,
    upfrontCost: 0,
    monthlyInstallment: 0,
  });

  useEffect(() => {
    setSuburbs(suburbsData);
  }, []);

  const handleSuburbInputChange = (value) => {
    setSuburbInput(value);
    setInputs(prev => ({ ...prev, suburb: value }));

    if (!value.trim()) {
      setFilteredSuburbs([]);
      setSelectedSuburbInfo(null);
      return;
    }

    const filtered = suburbs.filter(sub =>
      sub.Suburb.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 10);

    setFilteredSuburbs(filtered);
  };

  const handleSuburbSelect = (value) => {
    setInputs(prev => ({ ...prev, suburb: value.Suburb }));
    setSuburbInput(value.Suburb);
    setSelectedSuburbInfo(value);
    setFilteredSuburbs([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculate = () => {
    const {
      vehiclePrice,
      retailValue,
      insuranceCost,
      adminFee,
      interestRate,
      riskProfile
    } = inputs;

    const distance = selectedSuburbInfo?.DIST_KM || 0;
    let depositRate = 0.1;

    if (riskProfile === 'Low') depositRate = 0.1;
    else if (riskProfile === 'Medium') depositRate = 0.15;
    else if (riskProfile === 'High') depositRate = 0.2;

    const baseDeposit = parseFloat(vehiclePrice || 0) * depositRate;
    const distanceCost = distance * 5;
    const deposit = baseDeposit + distanceCost;

    const repoCost = parseFloat(retailValue || 0) * 0.12;

    const insurance = parseFloat(insuranceCost || 0);
    const admin = parseFloat(adminFee || 0);
    const upfront = deposit + repoCost + insurance + admin;

    const cappedUpfront = Math.min(upfront, 110000);

    const principal = parseFloat(vehiclePrice || 0) - deposit;
    const months = 36;
    const rate = parseFloat(interestRate || 0) / 100 / 12;

    const monthly = rate > 0
      ? (principal * rate) / (1 - Math.pow(1 + rate, -months))
      : principal / months;

    setResults({
      deposit: deposit.toFixed(2),
      repoCost: repoCost.toFixed(2),
      upfrontCost: cappedUpfront.toFixed(2),
      monthlyInstallment: monthly.toFixed(2)
    });
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow space-y-4">
      <h1 className="text-xl font-bold mb-4">SmartRent Auto™ Calculator</h1>

      <input
        type="text"
        name="clientName"
        placeholder="Client Name"
        value={inputs.clientName}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
      />

      <Combobox value={selectedSuburbInfo} onChange={handleSuburbSelect}>
        <Combobox.Input
          placeholder="Start typing suburb..."
          className="w-full p-2 border rounded"
          onChange={(e) => handleSuburbInputChange(e.target.value)}
          displayValue={() => suburbInput}
        />
        <Combobox.Options className="border rounded shadow bg-white max-h-60 overflow-y-auto z-10">
          {filteredSuburbs.map((suburb, idx) => (
            <Combobox.Option key={idx} value={suburb}>
              {suburb.Suburb} ({suburb.Town})
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>

      {selectedSuburbInfo && (
        <div className="space-y-1 text-sm text-gray-700">
          <div><strong>Town:</strong> {selectedSuburbInfo.Town}</div>
          <div><strong>Municipality (MP_NAME):</strong> {selectedSuburbInfo.MP_NAME}</div>
          <div><strong>Province:</strong> {selectedSuburbInfo.Province}</div>
          <div><strong>Distance (km):</strong> {selectedSuburbInfo.DIST_KM}</div>
        </div>
      )}

      <select
        name="riskProfile"
        value={inputs.riskProfile}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
      >
        <option value="">Select Risk Profile</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>

      <input
        type="number"
        name="retailValue"
        placeholder="Retail Value"
        value={inputs.retailValue}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
      />
      <input
        type="number"
        name="vehiclePrice"
        placeholder="Vehicle Price"
        value={inputs.vehiclePrice}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
      />
      <input
        type="number"
        name="insuranceCost"
        placeholder="Insurance Cost"
        value={inputs.insuranceCost}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
      />
      <input
        type="number"
        name="adminFee"
        placeholder="Admin Fee"
        value={inputs.adminFee}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
      />
      <input
        type="number"
        name="interestRate"
        placeholder="Interest Rate (%)"
        value={inputs.interestRate}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
      />

      <button
        onClick={calculate}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Calculate
      </button>

      <div className="bg-gray-50 p-4 rounded text-sm">
        <div><strong>Client:</strong> {inputs.clientName}</div>
        <div><strong>Suburb:</strong> {inputs.suburb}</div>
        <div><strong>Deposit:</strong> R{results.deposit}</div>
        <div><strong>Repo Cost:</strong> R{results.repoCost}</div>
        <div><strong>Total Upfront Cost:</strong> R{results.upfrontCost}</div>
        <div><strong>Monthly Installment:</strong> R{results.monthlyInstallment}</div>
      </div>
    </div>
  );
};

export default Calculator;


