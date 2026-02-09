import React, { useState } from 'react';
import Input from '../FormElements/Input';
import Select from '../FormElements/Select';
import '../../styles/components.css';

const AssetsLiabilities = ({ formData, onChange }) => {
    const [assets, setAssets] = useState(formData.assets || []);
    const [liabilities, setLiabilities] = useState(formData.liabilities || []);

    const assetTypeOptions = [
        { value: 'savings', label: 'Savings Account' },
        { value: 'checking', label: 'Checking Account' },
        { value: 'investment', label: 'Investment Account' },
        { value: 'property', label: 'Real Estate' },
        { value: 'vehicle', label: 'Vehicle' },
        { value: 'other', label: 'Other' }
    ];

    const liabilityTypeOptions = [
        { value: 'credit_card', label: 'Credit Card' },
        { value: 'auto_loan', label: 'Auto Loan' },
        { value: 'mortgage', label: 'Mortgage' },
        { value: 'student_loan', label: 'Student Loan' },
        { value: 'personal_loan', label: 'Personal Loan' },
        { value: 'other', label: 'Other' }
    ];

    const addAsset = () => {
        const newAsset = { asset_type: '', description: '', value: '' };
        const updatedAssets = [...assets, newAsset];
        setAssets(updatedAssets);
        onChange({ target: { name: 'assets', value: updatedAssets } });
    };

    const removeAsset = (index) => {
        const updatedAssets = assets.filter((_, i) => i !== index);
        setAssets(updatedAssets);
        onChange({ target: { name: 'assets', value: updatedAssets } });
    };

    const updateAsset = (index, field, value) => {
        const updatedAssets = [...assets];
        updatedAssets[index][field] = value;
        setAssets(updatedAssets);
        onChange({ target: { name: 'assets', value: updatedAssets } });
    };

    const addLiability = () => {
        const newLiability = { liability_type: '', creditor: '', balance: '', monthly_payment: '' };
        const updatedLiabilities = [...liabilities, newLiability];
        setLiabilities(updatedLiabilities);
        onChange({ target: { name: 'liabilities', value: updatedLiabilities } });
    };

    const removeLiability = (index) => {
        const updatedLiabilities = liabilities.filter((_, i) => i !== index);
        setLiabilities(updatedLiabilities);
        onChange({ target: { name: 'liabilities', value: updatedLiabilities } });
    };

    const updateLiability = (index, field, value) => {
        const updatedLiabilities = [...liabilities];
        updatedLiabilities[index][field] = value;
        setLiabilities(updatedLiabilities);
        onChange({ target: { name: 'liabilities', value: updatedLiabilities } });
    };

    return (
        <div className="card fade-in">
            <div className="card-header">
                <h2 className="card-title">Assets & Liabilities</h2>
                <p className="card-subtitle">Provide your financial overview</p>
            </div>

            {/* Assets Section */}
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>
                Assets
            </h3>

            {assets.length === 0 && (
                <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-lg)' }}>
                    No assets added yet.
                </p>
            )}

            {assets.map((asset, index) => (
                <div key={index} className="dynamic-list-item">
                    <div className="dynamic-list-header">
                        <h4 className="dynamic-list-title">Asset {index + 1}</h4>
                        <button className="btn-remove" onClick={() => removeAsset(index)} type="button">
                            Remove
                        </button>
                    </div>

                    <div className="form-grid-2">
                        <Select
                            label="Asset Type"
                            name={`asset_type_${index}`}
                            value={asset.asset_type || ''}
                            onChange={(e) => updateAsset(index, 'asset_type', e.target.value)}
                            options={assetTypeOptions}
                            required
                        />

                        <Input
                            label="Estimated Value"
                            name={`asset_value_${index}`}
                            type="number"
                            value={asset.value || ''}
                            onChange={(e) => updateAsset(index, 'value', e.target.value)}
                            placeholder="0"
                            required
                        />
                    </div>

                    <Input
                        label="Description"
                        name={`asset_description_${index}`}
                        value={asset.description || ''}
                        onChange={(e) => updateAsset(index, 'description', e.target.value)}
                        placeholder="e.g., Bank name, Property address"
                    />
                </div>
            ))}

            <button className="btn-add" onClick={addAsset} type="button">
                + Add Asset
            </button>

            <div className="section-divider"></div>

            {/* Liabilities Section */}
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>
                Liabilities
            </h3>

            {liabilities.length === 0 && (
                <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-lg)' }}>
                    No liabilities added yet.
                </p>
            )}

            {liabilities.map((liability, index) => (
                <div key={index} className="dynamic-list-item">
                    <div className="dynamic-list-header">
                        <h4 className="dynamic-list-title">Liability {index + 1}</h4>
                        <button className="btn-remove" onClick={() => removeLiability(index)} type="button">
                            Remove
                        </button>
                    </div>

                    <div className="form-grid-2">
                        <Select
                            label="Liability Type"
                            name={`liability_type_${index}`}
                            value={liability.liability_type || ''}
                            onChange={(e) => updateLiability(index, 'liability_type', e.target.value)}
                            options={liabilityTypeOptions}
                            required
                        />

                        <Input
                            label="Creditor"
                            name={`creditor_${index}`}
                            value={liability.creditor || ''}
                            onChange={(e) => updateLiability(index, 'creditor', e.target.value)}
                            placeholder="e.g., Bank name"
                            required
                        />
                    </div>

                    <div className="form-grid-2">
                        <Input
                            label="Current Balance"
                            name={`balance_${index}`}
                            type="number"
                            value={liability.balance || ''}
                            onChange={(e) => updateLiability(index, 'balance', e.target.value)}
                            placeholder="0"
                            required
                        />

                        <Input
                            label="Monthly Payment"
                            name={`monthly_payment_${index}`}
                            type="number"
                            value={liability.monthly_payment || ''}
                            onChange={(e) => updateLiability(index, 'monthly_payment', e.target.value)}
                            placeholder="0"
                            required
                        />
                    </div>
                </div>
            ))}

            <button className="btn-add" onClick={addLiability} type="button">
                + Add Liability
            </button>
        </div>
    );
};

export default AssetsLiabilities;
