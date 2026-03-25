import Button from '../FormElements/Button';

const fmt = (value) =>
  Number(value || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const fmtTimestamp = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
};

const ReceiptRow = ({ label, value, highlight = false }) => (
  <div className={`receipt-row${highlight ? ' receipt-row--highlight' : ''}`}>
    <span className="receipt-row-label">{label}</span>
    <span className="receipt-row-value">{value}</span>
  </div>
);

const DisbursementReceiptScreen = ({ receipt, onReset }) => {
  if (!receipt) return null;

  const {
    application_id,
    disbursement_status,
    transaction_id,
    transfer_status,
    transfer_timestamp,
    reconciliation_required,
    approved_amount,
    disbursement_amount,
    origination_fee_deducted,
    interest_rate,
    tenure_months,
    monthly_emi,
    total_interest,
    total_repayment,
    first_emi_date,
    schedule_preview,
    explanation,
  } = receipt;

  return (
    <div className="pipeline-shell fade-in">
      <div className="card receipt-screen">

        {/* ── Header ── */}
        <div className="receipt-hero">
          <span className="decision-badge decision-badge--success">
            {disbursement_status || 'DISBURSED'}
          </span>
          <h2 className="card-title">Funds Disbursed Successfully</h2>
          <p className="card-subtitle">
            Application <strong>{application_id}</strong> · Transaction <strong>{transaction_id}</strong>
          </p>
          {explanation && (
            <p className="receipt-explanation">{explanation}</p>
          )}
        </div>

        {/* ── Info Cards Grid ── */}
        <div className="receipt-cards-grid">

          {/* Transfer Summary */}
          <div className="receipt-card">
            <h3 className="receipt-card-title">Transfer Summary</h3>
            <ReceiptRow label="Transfer Status" value={
              <span className={`receipt-status-badge receipt-status-badge--${transfer_status === 'SUCCESS' ? 'success' : 'error'}`}>
                {transfer_status || '—'}
              </span>
            } />
            <ReceiptRow label="Transaction ID" value={transaction_id || '—'} />
            <ReceiptRow label="Timestamp" value={fmtTimestamp(transfer_timestamp)} />
            <ReceiptRow label="Reconciliation" value={reconciliation_required ? 'Required' : 'Not Required'} />
          </div>

          {/* Loan Terms */}
          <div className="receipt-card">
            <h3 className="receipt-card-title">Loan Terms</h3>
            <ReceiptRow label="Approved Amount" value={fmt(approved_amount)} />
            <ReceiptRow label="Origination Fee" value={fmt(origination_fee_deducted)} />
            <ReceiptRow label="Net Disbursed" value={fmt(disbursement_amount)} highlight />
            <ReceiptRow label="Interest Rate" value={`${interest_rate}% p.a.`} />
            <ReceiptRow label="Tenure" value={`${tenure_months} months`} />
          </div>

          {/* Repayment Summary */}
          <div className="receipt-card">
            <h3 className="receipt-card-title">Repayment Summary</h3>
            <ReceiptRow label="Monthly EMI" value={fmt(monthly_emi)} highlight />
            <ReceiptRow label="First EMI Date" value={fmtDate(first_emi_date)} />
            <ReceiptRow label="Total Interest" value={fmt(total_interest)} />
            <ReceiptRow label="Total Repayment" value={fmt(total_repayment)} />
          </div>

        </div>

        {/* ── Schedule Preview ── */}
        {schedule_preview && schedule_preview.length > 0 && (
          <div className="receipt-schedule">
            <h3 className="receipt-card-title">Repayment Schedule Preview</h3>
            <p className="receipt-schedule-note">
              Showing first 3 installments{tenure_months > 3 ? ` and final installment (#${tenure_months})` : ''}.
            </p>
            <div className="receipt-table-wrapper">
              <table className="receipt-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Due Date</th>
                    <th>Opening Balance</th>
                    <th>EMI</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>Closing Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule_preview.map((inst, idx) => {
                    const isFirst3 = idx < 3;
                    const isLast = idx === schedule_preview.length - 1;
                    const shouldShowEllipsis = idx === 3 && schedule_preview.length > 4;

                    if (shouldShowEllipsis) {
                      return (
                        <tr key="ellipsis" className="receipt-table-ellipsis">
                          <td colSpan={7}>· · ·</td>
                        </tr>
                      );
                    }

                    if (isFirst3 || isLast) {
                      return (
                        <tr key={inst.installment_number} className={isLast ? 'receipt-table-row--last' : ''}>
                          <td>{inst.installment_number}</td>
                          <td>{fmtDate(inst.due_date)}</td>
                          <td>{fmt(inst.opening_balance)}</td>
                          <td>{fmt(inst.emi_amount)}</td>
                          <td>{fmt(inst.principal_component)}</td>
                          <td>{fmt(inst.interest_component)}</td>
                          <td>{fmt(inst.closing_balance)}</td>
                        </tr>
                      );
                    }

                    return null;
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="decision-actions">
          <Button type="button" variant="primary" onClick={onReset}>
            Start New Application
          </Button>
        </div>

      </div>
    </div>
  );
};

export default DisbursementReceiptScreen;
