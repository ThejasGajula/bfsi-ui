import axios from 'axios';
import { demoApiAdapter } from './demoApi';
import { isDemoMode } from '../config/env';

const disbursementClient = axios.create({
  baseURL: import.meta.env.VITE_API_DISBURSEMENT_URL || 'http://localhost:8003',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
  ...(isDemoMode ? { adapter: demoApiAdapter } : {}),
});

/**
 * POST /disburse
 * Accepts flat pre-resolved loan terms and returns a DisbursementReceipt.
 *
 * @param {Object} payload
 * @param {string} payload.application_id
 * @param {number} payload.approved_amount
 * @param {number} payload.approved_tenure_months
 * @param {number} payload.interest_rate
 * @param {number} payload.disbursement_amount
 * @param {string} [payload.explanation]
 */
export async function callDisburse(payload) {
  const response = await disbursementClient.post('/disburse', payload);
  return response.data;
}
