import React from 'react';

const Spinner = () => <span className="stage-spinner" aria-hidden="true" />;

const CheckIcon = () => (
  <svg className="stage-check-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M4 10.5L8 14.5L16 6.5" />
  </svg>
);

const StageBlock = ({ stage, index }) => (
  <div
    className={`stage-block stage-block--${stage.status}`}
    style={{ animationDelay: `${index * 120}ms` }}
  >
    <div className="stage-icon" aria-hidden="true">
      {stage.icon}
    </div>

    <div className="stage-content">
      <span className="stage-label">{stage.label}</span>
      <span className="stage-description">{stage.description}</span>
      {stage.status === 'complete' && stage.elapsed !== null ? (
        <span className="stage-time">{stage.elapsed.toFixed(1)}s</span>
      ) : null}
      {stage.status === 'error' && stage.errorMessage ? (
        <span className="stage-error">{stage.errorMessage}</span>
      ) : null}
    </div>

    <div className="stage-status-icon" aria-live="polite">
      {stage.status === 'active' ? <Spinner /> : null}
      {stage.status === 'complete' ? <CheckIcon /> : null}
      {stage.status === 'error' ? <span className="stage-error-icon">X</span> : null}
    </div>
  </div>
);

export default StageBlock;
