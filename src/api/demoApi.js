const DEMO_NETWORK_DELAY_MS = 900;
const COUNTER_OFFER_THRESHOLD = 0; // demo always showcases counter offer flow
const demoApplications = new Map();

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function buildResponse(config, data, status = 200) {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config,
    request: {},
  };
}

function getRequestBody(data) {
  if (!data) {
    return {};
  }

  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  return data;
}

function createOfferTerms({ amount, termMonths, monthlyPayment, interestRate }) {
  return {
    amount,
    term_months: termMonths,
    monthly_payment: monthlyPayment,
    interest_rate: interestRate,
  };
}

function createDemoDecision(requestedAmount) {
  const normalizedAmount = Number(requestedAmount) || 0;
  const baseAmount = normalizedAmount || 100000;

  if (baseAmount > COUNTER_OFFER_THRESHOLD) {
    return {
      decision: 'COUNTER_OFFER',
      requested: createOfferTerms({
        amount: baseAmount,
        termMonths: 36,
        monthlyPayment: Math.round(baseAmount * 0.0335),
        interestRate: 10.9,
      }),
      counter: createOfferTerms({
        amount: Math.round(baseAmount * 0.78),
        termMonths: 48,
        monthlyPayment: Math.round(baseAmount * 0.0224),
        interestRate: 12.4,
      }),
    };
  }

  return {
    decision: 'APPROVED',
    requested: createOfferTerms({
      amount: baseAmount,
      termMonths: 36,
      monthlyPayment: Math.round(baseAmount * 0.032),
      interestRate: 8.9,
    }),
  };
}

export function getDemoApplicationScenario(applicationId) {
  return demoApplications.get(applicationId) || null;
}

export async function demoApiAdapter(config) {
  await wait(DEMO_NETWORK_DELAY_MS);

  if (config.url === '/loan_intake/submit_application' && config.method === 'post') {
    const requestBody = getRequestBody(config.data);
    const applicationId = crypto.randomUUID();
    const decision = createDemoDecision(requestBody.requested_amount);

    demoApplications.set(applicationId, {
      applicationId,
      requestedAmount: Number(requestBody.requested_amount) || 0,
      decision,
    });

    return buildResponse(config, {
      application_id: applicationId,
      status: 'submitted',
      message: 'Demo submission completed successfully.',
      decision_preview: decision,
    });
  }

  if (config.url === '/loan_intake/trigger_orchestrator' && config.method === 'post') {
    return buildResponse(config, { status: 'ok', message: 'Demo orchestrator triggered.' });
  }

  if (config.url?.startsWith('/documents/upload/') && config.method === 'post') {
    const file =
      typeof config.data?.get === 'function'
        ? config.data.get('file')
        : null;

    return buildResponse(config, {
      status: 'success',
      application_id:
        typeof config.data?.get === 'function' ? config.data.get('application_id') : null,
      document_type: config.url.split('/').pop(),
      file_name: file?.name || 'demo-file.pdf',
      message: 'Demo upload completed successfully.',
    });
  }

  if (config.url === '/disburse' && config.method === 'post') {
    const body = getRequestBody(config.data);
    const approvedAmount = Number(body.approved_amount) || 10000;
    const tenure = Number(body.approved_tenure_months) || 36;
    const rate = Number(body.interest_rate) || 10.9;
    const disbursementAmount = Number(body.disbursement_amount) || Math.round(approvedAmount * 0.98);
    const originationFee = Math.round((approvedAmount - disbursementAmount) * 100) / 100;

    const monthlyRate = rate / 100 / 12;
    const emi = Math.round(
      (approvedAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
      (Math.pow(1 + monthlyRate, tenure) - 1)
    );
    const totalRepayment = Math.round(emi * tenure);
    const totalInterest = Math.round(totalRepayment - approvedAmount);

    const today = new Date();
    const firstEmiDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const firstEmiDateStr = firstEmiDate.toISOString().split('T')[0];

    const buildInstallment = (n, openingBalance) => {
      const interest = Math.round(openingBalance * monthlyRate * 100) / 100;
      const principal = Math.round((emi - interest) * 100) / 100;
      const closingBalance = Math.max(0, Math.round((openingBalance - principal) * 100) / 100);
      const dueDate = new Date(firstEmiDate);
      dueDate.setMonth(dueDate.getMonth() + n - 1);
      return {
        installment_number: n,
        due_date: dueDate.toISOString().split('T')[0],
        opening_balance: Math.round(openingBalance * 100) / 100,
        emi_amount: emi,
        principal_component: principal,
        interest_component: interest,
        closing_balance: closingBalance,
      };
    };

    const schedulePreview = [];
    let balance = approvedAmount;
    for (let i = 1; i <= Math.min(3, tenure); i++) {
      const inst = buildInstallment(i, balance);
      schedulePreview.push(inst);
      balance = inst.closing_balance;
    }
    if (tenure > 3) {
      const lastDue = new Date(firstEmiDate);
      lastDue.setMonth(lastDue.getMonth() + tenure - 1);
      const lastInterest = Math.round(emi * 0.01 * 100) / 100;
      schedulePreview.push({
        installment_number: tenure,
        due_date: lastDue.toISOString().split('T')[0],
        opening_balance: Math.round((emi - lastInterest) * 100) / 100,
        emi_amount: emi,
        principal_component: Math.round((emi - lastInterest) * 100) / 100,
        interest_component: lastInterest,
        closing_balance: 0,
      });
    }

    return buildResponse(config, {
      application_id: body.application_id,
      disbursement_status: 'DISBURSED',
      approved_amount: approvedAmount,
      disbursement_amount: disbursementAmount,
      origination_fee_deducted: originationFee,
      interest_rate: rate,
      tenure_months: tenure,
      monthly_emi: emi,
      total_interest: totalInterest,
      total_repayment: totalRepayment,
      first_emi_date: firstEmiDateStr,
      transaction_id: `TXN-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
      transfer_status: 'SUCCESS',
      transfer_timestamp: new Date().toISOString(),
      reconciliation_required: false,
      schedule_preview: schedulePreview,
      explanation: body.explanation || 'Loan disbursed successfully.',
    });
  }

  return Promise.reject(
    new Error(`No demo mock configured for ${String(config.method).toUpperCase()} ${config.url}`)
  );
}
