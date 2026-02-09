import React from 'react';
import '../styles/components.css';

const Sidebar = ({ currentStep, steps, onStepClick, isCollapsed, onToggleCollapse }) => {
    const getStepStatus = (index) => {
        if (index < currentStep) return 'completed';
        if (index === currentStep) return 'active';
        return 'pending';
    };

    return (
        <div style={{
            width: isCollapsed ? '60px' : '280px',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border-color)',
            padding: isCollapsed ? 'var(--spacing-md)' : 'var(--spacing-xl)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
            transition: 'all 0.3s ease-in-out',
            overflowY: 'auto',
            overflowX: 'hidden'
        }}>
            {/* Toggle Button */}
            <button
                onClick={onToggleCollapse}
                style={{
                    position: 'absolute',
                    top: 'var(--spacing-md)',
                    right: isCollapsed ? '50%' : 'var(--spacing-md)',
                    transform: isCollapsed ? 'translateX(50%)' : 'none',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: '16px',
                    transition: 'all 0.3s ease-in-out',
                    zIndex: 10
                }}
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                {isCollapsed ? '→' : '←'}
            </button>

            {/* Brand Header */}
            {!isCollapsed && (
                <div style={{ marginBottom: 'var(--spacing-2xl)', marginTop: 'var(--spacing-xl)' }}>
                    <h1 style={{
                        fontSize: 'var(--font-size-2xl)',
                        fontWeight: 700,
                        background: 'var(--primary-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        marginBottom: 'var(--spacing-xs)'
                    }}>
                        Intake Loan
                    </h1>
                    <p style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--text-muted)'
                    }}>
                        Loan Application Portal
                    </p>
                </div>
            )}

            {/* Vertical Stepper */}
            <div className="stepper" style={{ marginTop: isCollapsed ? 'var(--spacing-2xl)' : '0' }}>
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className={`stepper-item ${getStepStatus(index)}`}
                        onClick={() => onStepClick && onStepClick(index)}
                        style={{
                            padding: isCollapsed ? 'var(--spacing-xs)' : 'var(--spacing-md)',
                            justifyContent: isCollapsed ? 'center' : 'flex-start'
                        }}
                        title={isCollapsed ? step.title : ''}
                    >
                        <div className="stepper-icon">
                            {index < currentStep ? '✓' : index + 1}
                        </div>
                        {!isCollapsed && (
                            <div className="stepper-content">
                                <div className="stepper-title">{step.title}</div>
                                <div className="stepper-description">{step.description}</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            {!isCollapsed && (
                <div style={{
                    marginTop: 'auto',
                    paddingTop: 'var(--spacing-xl)',
                    borderTop: '1px solid var(--border-color)'
                }}>
                    <p style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--text-muted)',
                        textAlign: 'center'
                    }}>
                        Step {currentStep + 1} of {steps.length}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
