import React from 'react';
import '../../styles/components.css';

const Button = ({
    children,
    variant = 'primary',
    type = 'button',
    onClick,
    disabled = false,
    loading = false,
    ...props
}) => {
    const className = `btn btn-${variant} ${loading ? 'btn-loading' : ''}`;

    return (
        <button
            type={type}
            className={className}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
