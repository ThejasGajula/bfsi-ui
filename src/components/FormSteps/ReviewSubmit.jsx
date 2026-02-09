import React from 'react';
import Button from '../FormElements/Button';
import '../../styles/components.css';

const ReviewSubmit = ({ formData, onEdit }) => {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value || 0);
    };

    const renderSection = (title, data, editStep) => (
        <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-lg)',
            marginBottom: 'var(--spacing-lg)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {title}
                </h3>
                <button
                    onClick={() => onEdit(editStep)}
                    style={{
                        background: 'transparent',
                        color: 'var(--primary-color)',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 'var(--font-size-sm)',
                        textDecoration: 'underline'
                    }}
                >
                    Edit
                </button>
            </div>
            <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
                {Object.entries(data).map(([key, value]) => {
                    if (!value || (Array.isArray(value) && value.length === 0)) return null;
                    return (
                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                            </span>
                            <span style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                                {typeof value === 'number' && key.includes('amount') ? formatCurrency(value) : String(value)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="card fade-in">
            <div className="card-header">
                <h2 className="card-title">Review & Submit</h2>
                <p className="card-subtitle">Please review your application before submitting</p>
            </div>

            {renderSection('Loan Details', {
                loan_type: formData.loan_type,
                credit_type: formData.credit_type,
                loan_purpose: formData.loan_purpose,
                requested_amount: formData.requested_amount,
                requested_term_months: formData.requested_term_months,
                preferred_payment_day: formData.preferred_payment_day,
                origination_channel: formData.origination_channel
            }, 0)}

            {renderSection('Applicant Information', {
                name: `${formData.first_name || ''} ${formData.middle_name || ''} ${formData.last_name || ''}`.trim(),
                date_of_birth: formData.date_of_birth,
                email: formData.email,
                citizenship_status: formData.citizenship_status
            }, 1)}

            {formData.addresses && formData.addresses.length > 0 && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-lg)',
                    marginBottom: 'var(--spacing-lg)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>
                            Addresses ({formData.addresses.length})
                        </h3>
                        <button
                            onClick={() => onEdit(2)}
                            style={{
                                background: 'transparent',
                                color: 'var(--primary-color)',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 'var(--font-size-sm)',
                                textDecoration: 'underline'
                            }}
                        >
                            Edit
                        </button>
                    </div>
                    {formData.addresses.map((addr, idx) => (
                        <p key={idx} style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-xs)' }}>
                            {addr.address_type}: {addr.street}, {addr.city}, {addr.state} {addr.zip_code}
                        </p>
                    ))}
                </div>
            )}

            {formData.employment && renderSection('Employment', {
                employer: formData.employment.employer_name,
                job_title: formData.employment.job_title,
                employment_type: formData.employment.employment_type,
                gross_monthly_income: formData.employment.gross_monthly_income
            }, 3)}

            {formData.incomes && formData.incomes.length > 0 && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-lg)',
                    marginBottom: 'var(--spacing-lg)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>
                            Additional Income ({formData.incomes.length})
                        </h3>
                        <button
                            onClick={() => onEdit(4)}
                            style={{
                                background: 'transparent',
                                color: 'var(--primary-color)',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 'var(--font-size-sm)',
                                textDecoration: 'underline'
                            }}
                        >
                            Edit
                        </button>
                    </div>
                    {formData.incomes.map((inc, idx) => (
                        <p key={idx} style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-xs)' }}>
                            {inc.income_type}: {formatCurrency(inc.amount)} ({inc.frequency})
                        </p>
                    ))}
                </div>
            )}

            <div style={{
                background: 'rgba(102, 126, 234, 0.05)',
                border: '1px solid rgba(102, 126, 234, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-lg)',
                marginTop: 'var(--spacing-xl)'
            }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-md)' }}>
                    By submitting this application, you certify that all information provided is accurate and complete.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                    <input type="checkbox" id="terms" style={{ width: '18px', height: '18px' }} required />
                    <label htmlFor="terms" style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }}>
                        I agree to the terms and conditions
                    </label>
                </div>
            </div>
        </div>
    );
};

export default ReviewSubmit;
