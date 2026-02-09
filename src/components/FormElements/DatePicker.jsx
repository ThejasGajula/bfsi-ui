import React from 'react';
import '../../styles/components.css';

const DatePicker = ({
    label,
    name,
    value,
    onChange,
    error,
    required = false,
    min,
    max,
    ...props
}) => {
    return (
        <div className="form-group">
            {label && (
                <label htmlFor={name} className="form-label">
                    {label} {required && <span style={{ color: 'var(--error-color)' }}>*</span>}
                </label>
            )}
            <input
                id={name}
                name={name}
                type="date"
                value={value}
                onChange={onChange}
                min={min}
                max={max}
                className={`form-input ${error ? 'error' : ''}`}
                required={required}
                {...props}
            />
            {error && <span className="form-error">{error}</span>}
        </div>
    );
};

export default DatePicker;
