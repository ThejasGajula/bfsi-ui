import React from 'react';
import Button from '../FormElements/Button';
import OfferCard from './OfferCard';

const DecisionScreen = ({ decision, onConfirm, onDecline, onReset }) => {
  const decisionType = decision?.decision;
  const rejectionReason =
    decision?.reason || 'We could not extend an offer for this application at this time.';
  const hasRequestedTerms = Boolean(decision?.requested);
  const hasCounterTerms = Boolean(decision?.counter);

  if (decisionType === 'APPROVED') {
    return (
      <div className="pipeline-shell fade-in">
        <div className="card decision-screen">
          <div className="decision-hero">
            <span className="decision-badge decision-badge--success">Approved</span>
            <h2 className="card-title">Your application is approved</h2>
            <p className="card-subtitle">Review the confirmed terms and proceed when you are ready.</p>
          </div>

          {hasRequestedTerms ? (
            <div className="offer-cards-grid offer-cards-grid--single">
              <OfferCard
                title="Approved Offer"
                terms={decision.requested}
                isHighlighted
                onAccept={() => onConfirm('requested')}
                ctaLabel="Accept & Proceed"
              />
            </div>
          ) : (
            <div className="decision-summary">
              <p>Your lender approved the application. Detailed offer terms are not available in the live event stream yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (decisionType === 'COUNTER_OFFER') {
    return (
      <div className="pipeline-shell fade-in">
        <div className="card decision-screen">
          <div className="decision-hero">
            <span className="decision-badge">Counter Offer</span>
            <h2 className="card-title">Choose the best offer for your application</h2>
            <p className="card-subtitle">
              Your requested terms were reviewed and we prepared a lender-recommended option as well.
            </p>
          </div>

          {hasRequestedTerms || hasCounterTerms ? (
            <div className="offer-cards-grid">
              <OfferCard
                title="Your Requested Terms"
                terms={decision.requested}
              />
              <OfferCard
                title="Our Counter Offer"
                terms={decision.counter}
                isHighlighted
                ctaLabel="Accept Counter Offer"
                onAccept={() => onConfirm('counter')}
              />
            </div>
          ) : (
            <div className="decision-summary">
              <p>A counter-offer was generated, but the detailed terms were not included in the SSE payload.</p>
            </div>
          )}

          <div className="decision-actions">
            <Button type="button" variant="secondary" onClick={onDecline}>
              Decline All Offers
            </Button>
            <Button type="button" variant="outline" onClick={onReset}>
              Start New Application
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (decisionType === 'DISBURSED') {
    return (
      <div className="pipeline-shell fade-in">
        <div className="card decision-screen">
          <div className="decision-hero">
            <span className="decision-badge decision-badge--success">Disbursed</span>
            <h2 className="card-title">Funds have been disbursed</h2>
            <p className="card-subtitle">
              {decision?.reason || 'Your loan was approved and the disbursement completed successfully.'}
            </p>
          </div>

          <div className="decision-summary">
            <p>
              {decision?.disbursementReceipt?.reference_id
                ? `Reference ID: ${decision.disbursementReceipt.reference_id}`
                : 'Your receipt reference will appear here once the backend includes it in the event payload.'}
            </p>
          </div>

          <div className="decision-actions">
            <Button type="button" variant="primary" onClick={onReset}>
              Start New Application
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pipeline-shell fade-in">
      <div className="card decision-screen decision-screen--rejected">
        <div className="decision-hero">
          <span className="decision-badge decision-badge--error">{decisionType || 'Decision Complete'}</span>
          <h2 className="card-title">Application decision</h2>
          <p className="card-subtitle">{rejectionReason}</p>
        </div>

        <div className="decision-summary">
          <p>You can download a summary for your records or begin a new application when ready.</p>
        </div>

        <div className="decision-actions">
          <Button type="button" variant="secondary" onClick={() => window.alert('Summary download will be available soon.')}>
            Download Summary
          </Button>
          <Button type="button" variant="primary" onClick={onReset}>
            Start New Application
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DecisionScreen;
