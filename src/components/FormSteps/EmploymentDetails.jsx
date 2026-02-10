import React from 'react';
import Input from '../FormElements/Input';
import Select from '../FormElements/Select';
import DatePicker from '../FormElements/DatePicker';
import '../../styles/components.css';

const EmploymentDetails = ({ formData, onChange }) => {
    const employment = formData.employment || {};

    const handleEmploymentChange = (e) => {
        const { name, value, type, checked } = e.target;
        const updatedEmployment = {
            ...employment,
            [name]: type === 'checkbox' ? checked : value
        };
        onChange({ target: { name: 'employment', value: updatedEmployment } });
    };

   const employmentTypeOptions = [
  { value: 'salaried', label: 'Salaried' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'retired', label: 'Retired' },
  { value: 'unemployed', label: 'Unemployed' }
];



    const employmentStatusOptions = [
        { value: 'employed', label: 'Employed' },
        { value: 'unemployed', label: 'Unemployed' },
        { value: 'retired', label: 'Retired' },
        { value: 'student', label: 'Student' }
    ];

    return (
        <div className="card fade-in">
            <div className="card-header">
                <h2 className="card-title">Employment Details</h2>
                <p className="card-subtitle">Tell us about your current employment</p>
            </div>

            <div className="form-grid-2">
                <Select
                    label="Employment Type"
                    name="employment_type"
                    value={employment.employment_type || ''}
                    onChange={handleEmploymentChange}
                    options={employmentTypeOptions}
                    required
                />

                <Select
                    label="Employment Status"
                    name="employment_status"
                    value={employment.employment_status || ''}
                    onChange={handleEmploymentChange}
                    options={employmentStatusOptions}
                    required
                />
            </div>

            <div className="form-grid-2">
                <Input
                    label="Employer Name"
                    name="employer_name"
                    value={employment.employer_name || ''}
                    onChange={handleEmploymentChange}
                    required
                />

                <Input
                    label="Job Title"
                    name="job_title"
                    value={employment.job_title || ''}
                    onChange={handleEmploymentChange}
                    required
                />
            </div>

            <div className="form-grid-2">
                <Input
                    label="Employer Phone"
                    name="employer_phone"
                    type="tel"
                    value={employment.employer_phone || ''}
                    onChange={handleEmploymentChange}
                    placeholder="(555) 123-4567"
                />

                <DatePicker
                    label="Start Date"
                    name="start_date"
                    value={employment.start_date || ''}
                    onChange={handleEmploymentChange}
                    max={new Date().toISOString().split('T')[0]}
                />
            </div>

            <Input
                label="Employer Address"
                name="employer_address"
                value={employment.employer_address || ''}
                onChange={handleEmploymentChange}
            />

            <div className="form-grid-2">
                <Input
                    label="Years of Experience"
                    name="experience"
                    type="number"
                    value={employment.experience || ''}
                    onChange={handleEmploymentChange}
                    placeholder="0"
                />

                <Input
                    label="Gross Monthly Income"
                    name="gross_monthly_income"
                    type="number"
                    value={employment.gross_monthly_income || ''}
                    onChange={handleEmploymentChange}
                    placeholder="0"
                    required
                />
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-md)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        name="self_employed_flag"
                        checked={employment.self_employed_flag || false}
                        onChange={handleEmploymentChange}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        Self-Employed
                    </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        name="family_employment"
                        checked={employment.family_employment || false}
                        onChange={handleEmploymentChange}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        Family Employment
                    </span>
                </label>
            </div>
        </div>
    );
};

export default EmploymentDetails;
