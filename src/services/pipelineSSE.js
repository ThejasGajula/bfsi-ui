import { isDemoMode } from "../config/env";
import { getDemoApplicationScenario } from "../api/demoApi";

const normalizePipelinePayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  return {
    ...payload,
    event: String(payload.event || "").toLowerCase(),
    stage: String(payload.stage || "").toLowerCase(),
    status: String(payload.status || "").toLowerCase(),
    is_terminal: Boolean(payload.is_terminal),
  };
};

export function subscribeToPipeline(applicationId, onEvent, onError) {
  if (!applicationId) {
    onError?.("Missing application ID.");
    return () => {};
  }

  if (isDemoMode) {
    const scenario = getDemoApplicationScenario(applicationId);
    const decision = scenario?.decision || {
      decision: "APPROVED",
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
          event: "KYC_TRIGGERED",
          stage: "KYC",
          status: "started",
          message: "KYC verification started",
          is_terminal: false,
        },
      },
      {
        delay: 5000,
        data: {
          application_id: applicationId,
          event: "KYC_PASSED",
          stage: "KYC",
          status: "completed",
          message: "KYC verification completed",
          details: { elapsed: 1.1 },
          is_terminal: false,
        },
      },
      {
        delay: 8000,
        data: {
          application_id: applicationId,
          event: "UNDERWRITING_STARTED",
          stage: "DECISIONING",
          status: "started",
          message: "Underwriting started",
          is_terminal: false,
        },
      },
      {
        delay: 12000,
        data:
          decision.decision === "COUNTER_OFFER"
            ? {
                application_id: applicationId,
                event: "COUNTER_OFFER_PENDING",
                stage: "DECISIONING",
                status: "completed",
                message: "Underwriting completed: counter offer generated",
                is_terminal: true,
                details: {
                  decision: "COUNTER_OFFER",
                  reason:
                    "Your requested amount exceeds our lending capacity based on your income and debt-to-income ratio.",
                  counter_offer_options: [
                    {
                      offer_id: "OPT_1",
                      label: "Reduced Amount",
                      principal_amount: decision.counter.amount,
                      tenure_months: decision.counter.term_months,
                      interest_rate: decision.counter.interest_rate,
                      monthly_emi: decision.counter.monthly_payment,
                      disbursement_amount: Math.round(
                        decision.counter.amount * 0.99,
                      ),
                      total_repayment:
                        decision.counter.monthly_payment *
                        decision.counter.term_months,
                    },
                    {
                      offer_id: "OPT_2",
                      label: "Extended Tenure",
                      principal_amount: Math.round(
                        decision.counter.amount * 0.9,
                      ),
                      tenure_months: decision.counter.term_months + 12,
                      interest_rate: decision.counter.interest_rate + 0.5,
                      monthly_emi: Math.round(
                        decision.counter.monthly_payment * 0.8,
                      ),
                      disbursement_amount: Math.round(
                        decision.counter.amount * 0.89,
                      ),
                      total_repayment:
                        Math.round(decision.counter.monthly_payment * 0.8) *
                        (decision.counter.term_months + 12),
                    },
                    {
                      offer_id: "OPT_3",
                      label: "Lower Interest Rate",
                      principal_amount: Math.round(
                        decision.counter.amount * 0.8,
                      ),
                      tenure_months: decision.counter.term_months,
                      interest_rate: decision.counter.interest_rate - 0.5,
                      monthly_emi: Math.round(
                        decision.counter.monthly_payment * 0.7,
                      ),
                      disbursement_amount: Math.round(
                        decision.counter.amount * 0.79,
                      ),
                      total_repayment:
                        Math.round(decision.counter.monthly_payment * 0.7) *
                        decision.counter.term_months,
                    },
                  ],
                },
              }
            : {
                application_id: applicationId,
                event: "APPLICATION_APPROVED",
                stage: "DECISIONING",
                status: "completed",
                message: "Underwriting completed: application approved",
                is_terminal: true,
                details: {
                  decision: "APPROVE",
                  reason:
                    "Applicant meets all credit criteria with strong repayment history.",
                  approved_amount: decision.requested.amount,
                  approved_tenure_months: decision.requested.term_months,
                  interest_rate: decision.requested.interest_rate,
                  monthly_emi: decision.requested.monthly_payment,
                  processing_fee: Math.round(decision.requested.amount * 0.01),
                  terms_summary: `Loan of $${Number(decision.requested.amount).toLocaleString()} at ${decision.requested.interest_rate}% for ${decision.requested.term_months} months. EMI: $${Number(decision.requested.monthly_payment).toLocaleString()}/month.`,
                },
              },
      },
    ];

    const timers = mockSequence.map(({ delay, data }) =>
      window.setTimeout(() => {
        const normalized = normalizePipelinePayload(data);
        if (normalized) {
          onEvent?.({ event: normalized.event, data: normalized });
        }
      }, delay),
    );

    return () => timers.forEach(window.clearTimeout);
  }

  const es = new EventSource(
    `${import.meta.env.VITE_API_ORCHESTRATOR_URL}/pipeline_updates/${applicationId}`,
  );

  let terminalClosed = false;

  es.onmessage = (e) => {
    try {
      const parsed = normalizePipelinePayload(JSON.parse(e.data));
      if (parsed) {
        onEvent?.({ event: parsed.event, data: parsed });
        if (parsed.is_terminal) {
          terminalClosed = true;
          es.close(); // close cleanly on terminal event
        }
      }
    } catch {
      onError?.("Received an invalid pipeline event.");
    }
  };

  es.onerror = () => {
    if (!terminalClosed) {
      onError?.("Connection lost. Please refresh.");
    }
    es.close();
  };

  return () => es.close();
}
