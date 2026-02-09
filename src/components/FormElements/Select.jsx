import React from 'react';
import '../../styles/components.css';

const Select = ({
    label,
    name,
    value,
    onChange,
    options = [],
    error,
    placeholder = 'Select an option',
    required = false,
    ...props
}) => {
    return (
        <div className="form-group">
            {label && (
                <label htmlFor={name} className="form-label">
                    {label} {required && <span style={{ color: 'var(--error-color)' }}>*</span>}
                </label>
            )}
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className={`form-select ${error ? 'error' : ''}`}
                required={required}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <span className="form-error">{error}</span>}
        </div>
    );
};

export default Select;
