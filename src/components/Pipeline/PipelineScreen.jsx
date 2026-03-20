import React, { useEffect, useMemo, useState } from 'react';
import { subscribeToPipeline } from '../../services/pipelineSSE';
import { createInitialStages, markActive, markComplete, markError } from '../../utils/stageHelpers';
import StageBlock from './StageBlock';

const PIPELINE_STAGES = [
  {
    id: 'kyc',
    label: 'Identity Verification (KYC)',
    description: 'Verifying applicant identity against authoritative sources',
    icon: 'ID',
    backendStage: 'kyc',
  },
  {
    id: 'decisioning',
    label: 'Underwriting & Risk Scoring',
    description: 'Running decisioning models against applicant profile',
    icon: 'UW',
    backendStage: 'decisioning',
  },
  {
    id: 'disbursement',
    label: 'Disbursement',
    description: 'Transferring approved funds and generating the receipt',
    icon: 'DS',
    backendStage: 'disbursement',
  },
];

const TOTAL_ESTIMATED_SECONDS = 10;

const getElapsed = (data) => {
  const elapsed = data?.details?.elapsed;
  return typeof elapsed === 'number' ? elapsed : null;
};

const normalizeTerminalDecision = (data) => {
  const details = data?.details || {};
  const decision =
    details.decision ||
    (data.event === 'counter_offer_pending' ? 'COUNTER_OFFER' : null) ||
    (data.event === 'funds_disbursed' ? 'DISBURSED' : null) ||
    (data.event === 'application_declined' || data.event === 'kyc_failed' ? 'REJECTED' : null) ||
    (data.status === 'failed' ? 'ERROR' : 'DECISION_COMPLETE');

  return {
    decision,
    stage: data.stage,
    reason: details.reason || data.message,
    requested: details.requested || details.offer || null,
    counter: details.counter || null,
    disbursementReceipt: details.disbursement_receipt || null,
    application_id: data.application_id,
  };
};

const PipelineScreen = ({ applicationId, onComplete }) => {
  const [stages, setStages] = useState(() => markActive(createInitialStages(PIPELINE_STAGES), 0));
  const [error, setError] = useState(null);

  useEffect(() => {
    setStages(markActive(createInitialStages(PIPELINE_STAGES), 0));
    setError(null);

    const unsubscribe = subscribeToPipeline(
      applicationId,
      ({ event, data }) => {
        setError(null);
        const stageIndex = PIPELINE_STAGES.findIndex((stage) => stage.backendStage === data.stage);
        const elapsed = getElapsed(data);
        const failureReason = data.details?.reason || data.message || 'Verification failed. Please contact support.';

        if (stageIndex !== -1) {
          if (data.status === 'started') {
            setStages((prev) => markActive(prev, stageIndex));
          }

          if (data.status === 'completed') {
            setStages((prev) => {
              const completedStages = markComplete(prev, stageIndex, elapsed);

              if (data.is_terminal || stageIndex === PIPELINE_STAGES.length - 1) {
                return completedStages;
              }

              return markActive(completedStages, stageIndex + 1);
            });
          }

          if (data.status === 'failed') {
            setStages((prev) => markError(prev, stageIndex, failureReason));
          }
        }

        if (!data.is_terminal) {
          return;
        }

        window.setTimeout(() => onComplete(normalizeTerminalDecision(data)), 600);
      },
      (subscriptionError) => {
        setError(subscriptionError);
      }
    );

    return unsubscribe;
  }, [applicationId, onComplete]);

  const completedStages = stages.filter((stage) => stage.status === 'complete').length;
  const activeStage = stages.find((stage) => stage.status === 'active');
  const progressPercentage = (completedStages / PIPELINE_STAGES.length) * 100;
  const estimatedSecondsRemaining = useMemo(() => {
    const remaining = TOTAL_ESTIMATED_SECONDS - stages.reduce((sum, stage) => sum + (stage.elapsed || 0), 0);
    return Math.max(1, Math.round(remaining));
  }, [stages]);

  return (
    <div className="pipeline-shell fade-in">
      <div className="card pipeline-screen">
        <div className="card-header pipeline-header">
          <div>
            <span className="pipeline-kicker">Mission Control</span>
            <h2 className="card-title">Processing Your Application</h2>
            <p className="card-subtitle">
              Application ID: <span className="pipeline-application-id">{applicationId}</span>
            </p>
          </div>
          <div className="pipeline-status-chip">
            {activeStage ? `Active: ${activeStage.label}` : 'Finalising application'}
          </div>
        </div>

        <div className="pipeline-progress-bar" aria-hidden="true">
          <div className="pipeline-progress-fill" style={{ width: `${progressPercentage}%` }} />
        </div>

        <div className="pipeline-stage-list">
          {stages.map((stage, index) => (
            <StageBlock key={stage.id} stage={stage} index={index} />
          ))}
        </div>

        <div className="pipeline-footer">
          <span>
            {error ? 'Connection issue detected. Retrying stream updates...' : `Estimated time remaining: ~${estimatedSecondsRemaining}s`}
          </span>
          <span className={error ? 'pipeline-footer-error' : ''}>
            {error || 'Need help? Contact support for manual review assistance.'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PipelineScreen;
