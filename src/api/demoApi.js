const DEMO_NETWORK_DELAY_MS = 900;
const COUNTER_OFFER_THRESHOLD = 100000;
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

  return Promise.reject(
    new Error(`No demo mock configured for ${String(config.method).toUpperCase()} ${config.url}`)
  );
}
