import React, { useState } from 'react';
import Input from '../FormElements/Input';
import Select from '../FormElements/Select';
import '../../styles/components.css';

const IncomeInfo = ({ formData, onChange }) => {
    const [incomes, setIncomes] = useState(formData.incomes || []);

    const incomeTypeOptions = [
        { value: 'salary', label: 'Salary' },
        { value: 'bonus', label: 'Bonus' },
        { value: 'commission', label: 'Commission' },
        { value: 'rental', label: 'Rental Income' },
        { value: 'investment', label: 'Investment Income' },
        { value: 'other', label: 'Other' }
    ];

    const frequencyOptions = [
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'annually', label: 'Annually' }
    ];

    const addIncome = () => {
        const newIncome = {
            income_type: '',
            amount: '',
            frequency: 'monthly',
            source: ''
        };
        const updatedIncomes = [...incomes, newIncome];
        setIncomes(updatedIncomes);
        onChange({ target: { name: 'incomes', value: updatedIncomes } });
    };

    const removeIncome = (index) => {
        const updatedIncomes = incomes.filter((_, i) => i !== index);
        setIncomes(updatedIncomes);
        onChange({ target: { name: 'incomes', value: updatedIncomes } });
    };

    const updateIncome = (index, field, value) => {
        const updatedIncomes = [...incomes];
        updatedIncomes[index][field] = value;
        setIncomes(updatedIncomes);
        onChange({ target: { name: 'incomes', value: updatedIncomes } });
    };

    return (
        <div className="card fade-in">
            <div className="card-header">
                <h2 className="card-title">Additional Income</h2>
                <p className="card-subtitle">Add any additional sources of income</p>
            </div>

            {incomes.length === 0 && (
                <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-lg)' }}>
                    No additional income sources added yet. Click the button below to add one.
                </p>
            )}

            {incomes.map((income, index) => (
                <div key={index} className="dynamic-list-item">
                    <div className="dynamic-list-header">
                        <h3 className="dynamic-list-title">Income Source {index + 1}</h3>
                        <button
                            className="btn-remove"
                            onClick={() => removeIncome(index)}
                            type="button"
                        >
                            Remove
                        </button>
                    </div>

                    <div className="form-grid-2">
                        <Select
                            label="Income Type"
                            name={`income_type_${index}`}
                            value={income.income_type || ''}
                            onChange={(e) => updateIncome(index, 'income_type', e.target.value)}
                            options={incomeTypeOptions}
                            required
                        />

                        <Input
                            label="Source"
                            name={`source_${index}`}
                            value={income.source || ''}
                            onChange={(e) => updateIncome(index, 'source', e.target.value)}
                            placeholder="e.g., Company name, Property address"
                            required
                        />
                    </div>

                    <div className="form-grid-2">
                        <Input
                            label="Amount"
                            name={`amount_${index}`}
                            type="number"
                            value={income.amount || ''}
                            onChange={(e) => updateIncome(index, 'amount', e.target.value)}
                            placeholder="0"
                            required
                        />

                        <Select
                            label="Frequency"
                            name={`frequency_${index}`}
                            value={income.frequency || 'monthly'}
                            onChange={(e) => updateIncome(index, 'frequency', e.target.value)}
                            options={frequencyOptions}
                            required
                        />
                    </div>
                </div>
            ))}

            <button className="btn-add" onClick={addIncome} type="button">
                + Add Income Source
            </button>
        </div>
    );
};

export default IncomeInfo;
