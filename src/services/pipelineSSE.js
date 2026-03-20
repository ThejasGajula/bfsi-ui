import { isDemoMode } from '../config/env';
import { getDemoApplicationScenario } from '../api/demoApi';

const normalizePipelinePayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  return {
    ...payload,
    event: String(payload.event || '').toLowerCase(),
    stage: String(payload.stage || '').toLowerCase(),
    status: String(payload.status || '').toLowerCase(),
    is_terminal: Boolean(payload.is_terminal),
  };
};

export function subscribeToPipeline(applicationId, onEvent, onError) {
  if (!applicationId) {
    onError?.('Missing application ID.');
    return () => {};
  }

  if (isDemoMode) {
    const scenario = getDemoApplicationScenario(applicationId);
    const decision = scenario?.decision || {
      decision: 'APPROVED',
      requested: {
        amount: 100000,
        term_months: 36,
        monthly_payment: 3205,
        interest_rate: 8.9,
      },
    };

    const mockSequence = [
      {
        delay: 2000,
        data: {
          application_id: applicationId,
          event: 'KYC_TRIGGERED',
          stage: 'KYC',
          status: 'started',
          message: 'KYC verification started',
          is_terminal: false,
        },
      },
      {
        delay: 5000,
        data: {
          application_id: applicationId,
          event: 'KYC_PASSED',
          stage: 'KYC',
          status: 'completed',
          message: 'KYC verification completed',
          details: { elapsed: 1.1 },
          is_terminal: false,
        },
      },
      {
        delay: 8000,
        data: {
          application_id: applicationId,
          event: 'UNDERWRITING_STARTED',
          stage: 'DECISIONING',
          status: 'started',
          message: 'Underwriting started',
          is_terminal: false,
        },
      },
      {
        delay: 12000,
        data: {
          application_id: applicationId,
          event: decision.decision === 'COUNTER_OFFER' ? 'COUNTER_OFFER_PENDING' : 'APPLICATION_APPROVED',
          stage: 'DECISIONING',
          status: 'completed',
          message:
            decision.decision === 'COUNTER_OFFER'
              ? 'Underwriting completed: counter offer generated'
              : 'Underwriting completed: application approved',
          details: {
            decision: decision.decision,
            requested: decision.requested,
            counter: decision.counter,
            elapsed: 1.9,
          },
          is_terminal: decision.decision === 'COUNTER_OFFER',
        },
      },
      {
        delay: 15000,
        data: {
          application_id: applicationId,
          event: 'DISBURSEMENT_STARTED',
          stage: 'DISBURSEMENT',
          status: 'started',
          message: 'Disbursement started',
          is_terminal: false,
        },
      },
      {
        delay: 18000,
        data: {
          application_id: applicationId,
          event: 'FUNDS_DISBURSED',
          stage: 'DISBURSEMENT',
          status: 'completed',
          message: 'Disbursement completed',
          details: {
            decision: 'DISBURSED',
            requested: decision.requested,
            disbursement_receipt: {
              reference_id: `demo-${applicationId}`,
            },
            elapsed: 1.2,
          },
          is_terminal: true,
        },
      },
    ].filter(({ data }) => data.event !== 'DISBURSEMENT_STARTED' || decision.decision !== 'COUNTER_OFFER');

    const timers = mockSequence.map(({ delay, data }) =>
      window.setTimeout(() => {
        const normalized = normalizePipelinePayload(data);
        if (normalized) {
          onEvent?.({ event: normalized.event, data: normalized });
        }
      }, delay)
    );

    return () => timers.forEach(window.clearTimeout);
  }

  const es = new EventSource(`${import.meta.env.VITE_API_BASE_URL}/pipeline/stream/${applicationId}`);

  es.onmessage = (e) => {
    try {
      const parsed = normalizePipelinePayload(JSON.parse(e.data));
      if (parsed) {
        onEvent?.({ event: parsed.event, data: parsed });
      }
    } catch {
      onError?.('Received an invalid pipeline event.');
    }
  };

  es.onerror = () => {
    onError?.('Connection lost. Please refresh.');
    es.close();
  };

  return () => es.close();
}
