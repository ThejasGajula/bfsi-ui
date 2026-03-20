# Loan Application Pipeline UI — Frontend Specification

## Overview

After the user clicks **Submit Form** on the Review & Submit step (step 6), and once the backend returns an `application_id`, the app transitions away from the multi-step form entirely and shows a **Pipeline Processing Screen**. This screen visualises the backend agent pipeline in real time via SSE (Server-Sent Events), then presents a **Decision Screen** with offer options when processing completes.

This spec covers:
1. Pipeline Processing Screen (animated stage blocks + SSE integration)
2. Decision Screen (counter offer / confirm offer)
3. Mock SSE data layer (drop-in replaceable with real SSE later)
4. Component structure for modular development

---

## Visual Design Direction

Match the existing dark UI (`--bg-primary` deep navy, `--accent-gradient` purple-to-blue, glass-card style). The pipeline screen should feel like a **mission control dashboard** — authoritative, calm, with purposeful motion. Each stage block lights up sequentially with a glow pulse when active, dims with a checkmark when done, and shows a red error state if rejected.

Fonts: keep whatever the existing app uses. If undefined, use `'DM Mono'` for stage labels (technical feel) and `'Sora'` for headings.

Animation principles:
- Staggered block reveals on mount (CSS `animation-delay`)  
- Active stage pulses with a breathing glow (`box-shadow` keyframe)
- Completed stages slide in a checkmark icon
- Progress bar at the top fills across the whole pipeline

---

## 1. Pipeline Processing Screen

### Trigger
Rendered immediately after `handleSubmit` succeeds and `applicationId` is set. Replace the current `DocumentUpload` post-submit view with this screen.

In `LoanIntake.jsx`, after `setApplicationId(backendApplicationId)` is called, set a new piece of state:
```js
const [pipelineComplete, setPipelineComplete] = useState(false);
const [pipelineDecision, setPipelineDecision] = useState(null); // full decision payload
```

The render logic becomes:
```
if applicationId && !pipelineComplete  → <PipelineScreen>
if applicationId && pipelineComplete   → <DecisionScreen>
else                                   → multi-step form
```

### Component: `PipelineScreen`

**File:** `src/components/Pipeline/PipelineScreen.jsx`

**Props:**
```ts
{
  applicationId: string,
  onComplete: (decision: DecisionPayload) => void
}
```

**Internally manages:**
- `stages`: array of stage objects (see below)
- `currentStageIndex`: number — which stage is active
- `error`: string | null
- SSE subscription lifecycle

### Stage Definitions

```js
const PIPELINE_STAGES = [
  {
    id: 'kyc',
    label: 'Identity Verification (KYC)',
    description: 'Verifying applicant identity against authoritative sources',
    icon: '🛡️',
    sseEvent: 'kyc_complete'
  },
  {
    id: 'document_check',
    label: 'Document Analysis',
    description: 'Parsing and validating uploaded documents',
    icon: '📄',
    sseEvent: 'document_check_complete'
  },
  {
    id: 'credit_pull',
    label: 'Credit Bureau Pull',
    description: 'Fetching Experian credit profile',
    icon: '📊',
    sseEvent: 'credit_pull_complete'
  },
  {
    id: 'underwriting',
    label: 'Underwriting & Risk Scoring',
    description: 'Running decisioning models against applicant profile',
    icon: '⚖️',
    sseEvent: 'underwriting_complete'
  },
  {
    id: 'offer_generation',
    label: 'Offer Generation',
    description: 'Calculating approved terms and counter-offer options',
    icon: '💡',
    sseEvent: 'offer_ready'
  }
];
```

### Stage Block UI

Each stage is rendered as a card with 4 possible visual states:

| State       | Visual Treatment |
|-------------|-----------------|
| `pending`   | Muted, dimmed opacity (~40%), no animation |
| `active`    | Full brightness, pulsing glow border, spinner icon, label highlighted |
| `complete`  | Checkmark icon (animated draw), border turns success green, label shows elapsed time |
| `error`     | Red border, ❌ icon, error message shown below label |

```jsx
// Stage block structure
<div className={`stage-block stage-block--${stage.status}`}>
  <div className="stage-icon">{stage.icon}</div>
  <div className="stage-content">
    <span className="stage-label">{stage.label}</span>
    <span className="stage-description">{stage.description}</span>
    {stage.status === 'complete' && <span className="stage-time">{stage.elapsed}s</span>}
    {stage.status === 'error' && <span className="stage-error">{stage.errorMessage}</span>}
  </div>
  <div className="stage-status-icon">
    {stage.status === 'active' && <Spinner />}
    {stage.status === 'complete' && <CheckIcon />}
    {stage.status === 'error' && <span>✗</span>}
  </div>
</div>
```

### Top Progress Bar

A single horizontal bar spanning the full width of the card header.  
Fill % = `(completedStages / totalStages) * 100`  
Animated with CSS `transition: width 0.6s ease`.

### Layout
```
[Card Header: "Processing Your Application" + progress bar]
[Stage Block 1]
[Stage Block 2]
...
[Stage Block N]
[Footer: "Estimated time remaining: ~Xs" | on error: "Contact support" link]
```

---

## 2. Mock SSE Layer

**File:** `src/services/pipelineSSE.js`

This module exports one function and is the ONLY place that needs to change when switching from mock to real SSE.

```js
/**
 * Subscribes to the pipeline SSE stream for a given applicationId.
 * In mock mode, fires events on a timer.
 * In real mode, connects to the backend SSE endpoint.
 *
 * @param {string} applicationId
 * @param {function} onEvent - called with { event: string, data: object }
 * @param {function} onError - called with error string
 * @returns {function} unsubscribe - call to clean up
 */
export function subscribeToPipeline(applicationId, onEvent, onError) {
  // --- MOCK MODE ---
  // Replace the body of this function with real EventSource when ready:
  //
  // const es = new EventSource(`/api/pipeline/stream/${applicationId}`);
  // es.onmessage = (e) => onEvent(JSON.parse(e.data));
  // es.onerror = () => onError('Connection lost');
  // return () => es.close();

  const MOCK_SEQUENCE = [
    { delay: 1500,  event: 'kyc_complete',             data: { status: 'PASS', elapsed: 1.4 } },
    { delay: 3000,  event: 'document_check_complete',   data: { status: 'PASS', elapsed: 1.5 } },
    { delay: 5000,  event: 'credit_pull_complete',      data: { status: 'PASS', score: 720, elapsed: 1.9 } },
    { delay: 8000,  event: 'underwriting_complete',     data: { status: 'PASS', decision: 'COUNTER_OFFER', elapsed: 2.8 } },
    { delay: 10000, event: 'offer_ready',               data: {
        decision: 'COUNTER_OFFER',
        requested: { amount: 100000, term_months: 36, monthly_payment: 3042, interest_rate: 9.5 },
        counter:   { amount: 75000,  term_months: 48, monthly_payment: 1958, interest_rate: 11.2 },
        elapsed: 1.6
      }
    }
  ];

  const timers = MOCK_SEQUENCE.map(({ delay, event, data }) =>
    setTimeout(() => onEvent({ event, data }), delay)
  );

  return () => timers.forEach(clearTimeout);
}
```

**To switch to real SSE:** delete the mock body and uncomment the `EventSource` block. No other file changes needed.

---

## 3. PipelineScreen Internal Logic

```js
useEffect(() => {
  // Mark first stage as active
  setStages(prev => markActive(prev, 0));

  const unsubscribe = subscribeToPipeline(
    applicationId,
    ({ event, data }) => {
      const stageIndex = PIPELINE_STAGES.findIndex(s => s.sseEvent === event);
      
      if (event === 'offer_ready') {
        setStages(prev => markComplete(prev, stageIndex, data.elapsed));
        // Small delay for UX: let final checkmark animate before transitioning
        setTimeout(() => onComplete(data), 1200);
        return;
      }

      if (data.status === 'PASS') {
        setStages(prev => {
          const updated = markComplete(prev, stageIndex, data.elapsed);
          return markActive(updated, stageIndex + 1);
        });
      } else {
        setStages(prev => markError(prev, stageIndex, 'Verification failed. Please contact support.'));
        onComplete({ decision: 'REJECTED', stage: PIPELINE_STAGES[stageIndex].id });
      }
    },
    (err) => {
      setError(err);
    }
  );

  return unsubscribe;
}, [applicationId]);
```

Helper functions `markActive`, `markComplete`, `markError` are pure functions that return a new stages array — keep them in a `src/utils/stageHelpers.js` file.

---

## 4. Decision Screen

**File:** `src/components/Pipeline/DecisionScreen.jsx`

**Props:**
```ts
{
  decision: DecisionPayload,
  onConfirm: (choice: 'requested' | 'counter') => void,
  onDecline: () => void,
  onReset: () => void   // maps to existing resetApplication()
}
```

### Decision Payload Shape (from mock / real SSE `offer_ready` event)
```ts
{
  decision: 'APPROVED' | 'COUNTER_OFFER' | 'DECLINED' | 'REJECTED',
  requested?: OfferTerms,
  counter?: OfferTerms,
}

type OfferTerms = {
  amount: number,
  term_months: number,
  monthly_payment: number,
  interest_rate: number
}
```

### States to Handle

#### A. APPROVED
Show a single offer card with green confirmation styling. One button: **"Accept & Proceed"** → calls `onConfirm('requested')`.

#### B. COUNTER_OFFER
Show two offer cards side by side (or stacked on mobile):

```
┌──────────────────────────┐   ┌──────────────────────────┐
│  Your Requested Terms    │   │   Our Counter Offer       │
│  ─────────────────────   │   │  ─────────────────────    │
│  Amount:    $100,000     │   │  Amount:    $75,000       │
│  Term:      36 months    │   │  Term:      48 months     │
│  Rate:      9.5% APR     │   │  Rate:      11.2% APR     │
│  Monthly:   $3,042/mo    │   │  Monthly:   $1,958/mo     │
│                          │   │                           │
│  [Accept Requested]      │   │  [Accept Counter Offer]   │
└──────────────────────────┘   └──────────────────────────┘
            [Decline All Offers]
```

Clicking either Accept button calls `onConfirm('requested')` or `onConfirm('counter')`.  
Clicking Decline calls `onDecline()` — you can show a confirmation modal or toast then call `onReset()`.

#### C. DECLINED / REJECTED
Show a rejection screen with the reason (from pipeline error stage if available), a "Download Summary" placeholder button, and a "Start New Application" button → `onReset()`.

### Offer Card Component

**File:** `src/components/Pipeline/OfferCard.jsx`

```jsx
const OfferCard = ({ title, terms, isHighlighted, onAccept, ctaLabel }) => (
  <div className={`offer-card ${isHighlighted ? 'offer-card--highlighted' : ''}`}>
    <h3>{title}</h3>
    <dl className="offer-terms">
      <OfferRow label="Loan Amount"    value={`$${terms.amount.toLocaleString()}`} />
      <OfferRow label="Term"           value={`${terms.term_months} months`} />
      <OfferRow label="Interest Rate"  value={`${terms.interest_rate}% APR`} />
      <OfferRow label="Monthly Payment" value={`$${terms.monthly_payment.toLocaleString()}/mo`} large />
    </dl>
    <button className="btn btn--primary" onClick={onAccept}>{ctaLabel}</button>
  </div>
);
```

The counter offer card should be `isHighlighted=true` (recommended by lender). The requested offer card is neutral.

---

## 5. CSS Additions

Add to `src/styles/components.css` (or a new `src/styles/pipeline.css` imported in `LoanIntake.jsx`):

```css
/* Stage blocks */
.stage-block {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  margin-bottom: 12px;
  transition: all 0.4s ease;
  opacity: 0.4;
}
.stage-block--active {
  opacity: 1;
  border-color: var(--primary-color);
  box-shadow: 0 0 16px rgba(79, 172, 254, 0.25);
  animation: stagePulse 2s ease-in-out infinite;
}
.stage-block--complete {
  opacity: 1;
  border-color: var(--success-color);
}
.stage-block--error {
  opacity: 1;
  border-color: var(--error-color);
}

@keyframes stagePulse {
  0%, 100% { box-shadow: 0 0 12px rgba(79, 172, 254, 0.2); }
  50%       { box-shadow: 0 0 28px rgba(79, 172, 254, 0.5); }
}

/* Progress bar */
.pipeline-progress-bar {
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  margin-bottom: 28px;
  overflow: hidden;
}
.pipeline-progress-fill {
  height: 100%;
  background: var(--accent-gradient);
  transition: width 0.6s ease;
}

/* Offer cards */
.offer-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 24px;
}
@media (max-width: 680px) {
  .offer-cards-grid { grid-template-columns: 1fr; }
}
.offer-card {
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 28px;
}
.offer-card--highlighted {
  border-color: var(--primary-color);
  box-shadow: 0 0 24px rgba(79, 172, 254, 0.2);
}
.offer-terms {
  margin: 20px 0;
  display: grid;
  row-gap: 12px;
}
```

---

## 6. File Structure Summary

```
src/
├── components/
│   └── Pipeline/
│       ├── PipelineScreen.jsx     ← SSE listener + animated stage list
│       ├── StageBlock.jsx         ← Individual stage card (pending/active/complete/error)
│       ├── DecisionScreen.jsx     ← Offer display + accept/decline actions
│       └── OfferCard.jsx          ← Reusable offer term card
├── services/
│   └── pipelineSSE.js            ← Mock SSE (swap body for real EventSource)
├── utils/
│   └── stageHelpers.js           ← Pure functions: markActive, markComplete, markError
└── styles/
    └── pipeline.css              ← All pipeline + decision screen styles
```

---

## 7. Integration Checklist for `LoanIntake.jsx`

- [ ] Add `pipelineComplete` and `pipelineDecision` state variables
- [ ] After `setApplicationId(...)` succeeds in `handleSubmit`, do NOT immediately show `DocumentUpload`; instead show `PipelineScreen`
- [ ] Pass `onComplete={(decision) => { setPipelineDecision(decision); setPipelineComplete(true); }}` to `PipelineScreen`
- [ ] When `pipelineComplete && pipelineDecision`, render `<DecisionScreen>`
- [ ] Wire `onReset` in `DecisionScreen` to existing `resetApplication()`
- [ ] `onConfirm` can log the choice or call a new API endpoint — stub it for now

---

## 8. Mock → Real SSE Swap Guide (for later)

When the backend SSE endpoint is ready:

1. Open `src/services/pipelineSSE.js`
2. Delete the mock `MOCK_SEQUENCE` block and the `timers` array
3. Uncomment:
   ```js
   const es = new EventSource(`${import.meta.env.VITE_API_BASE_URL}/pipeline/stream/${applicationId}`);
   es.onmessage = (e) => {
     const parsed = JSON.parse(e.data);
     onEvent({ event: parsed.event, data: parsed });
   };
   es.onerror = () => onError('Connection lost. Please refresh.');
   return () => es.close();
   ```
4. Ensure the backend emits named events matching the `sseEvent` strings in `PIPELINE_STAGES`

No other files need changes.

---

## 9. Notes

- The `DocumentUpload` step can optionally be moved before the pipeline screen (upload docs first, then submit triggers pipeline). The current code structure already supports this — `applicationId` is set after submit, documents are uploaded against it. The pipeline screen should only start after documents are confirmed uploaded. Adjust the trigger in `LoanIntake.jsx` accordingly if needed.
- All monetary values should use `toLocaleString('en-US', { style: 'currency', currency: 'USD' })` for formatting.
- The `Spinner` component can be a simple CSS border-animation circle — no library needed.
- `CheckIcon` should be an SVG `<path>` with `stroke-dasharray` + `stroke-dashoffset` animation for the "drawing" effect.