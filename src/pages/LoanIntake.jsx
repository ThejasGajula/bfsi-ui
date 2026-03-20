import React, { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../api/client';
import Sidebar from '../components/Sidebar';
import Button from '../components/FormElements/Button';
import ApplicantInfo from '../components/FormSteps/ApplicantInfo';
import AssetsLiabilities from '../components/FormSteps/AssetsLiabilities';
import EmploymentDetails from '../components/FormSteps/EmploymentDetails';
import AddressInfo from '../components/FormSteps/AddressInfo';
import IncomeInfo from '../components/FormSteps/IncomeInfo';
import LoanDetails from '../components/FormSteps/LoanDetails';
import ReviewSubmit from '../components/FormSteps/ReviewSubmit';
import DocumentUpload from '../components/FormSteps/DocumentUpload';
import DecisionScreen from '../components/Pipeline/DecisionScreen';
import PipelineScreen from '../components/Pipeline/PipelineScreen';
import '../styles/components.css';
import '../styles/pipeline.css';

const initialFormData = {
  loan: {
    loan_type: '',
    credit_type: 'individual',
    loan_purpose: '',
    requested_amount: '',
    requested_term_months: '',
    preferred_payment_day: '',
    origination_channel: '',
    application_status: 'submitted',
  },
  applicant: {
    applicant_role: 'primary',
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    ssn_no: '',
    ssn_last4: '',
    itin_number: '',
    citizenship_status: '',
    email: '',
    addresses: [],
    employment: {},
    incomes: [],
    assets: [],
    liabilities: [],
  },
  documents: {},
};

const steps = [
  { title: 'Loan Details', description: 'Basic loan information' },
  { title: 'Applicant Info', description: 'Personal details' },
  { title: 'Address', description: 'Contact information' },
  { title: 'Employment', description: 'Work details' },
  { title: 'Additional Income', description: 'Other income sources' },
  { title: 'Assets & Liabilities', description: 'Financial overview' },
  { title: 'Review & Submit', description: 'Final review' },
];

const LoanIntake = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [applicationId, setApplicationId] = useState(null);
  const [documentsComplete, setDocumentsComplete] = useState(false);
  const [pipelineComplete, setPipelineComplete] = useState(false);
  const [pipelineDecision, setPipelineDecision] = useState(null);

  const resetApplication = useCallback(() => {
    setApplicationId(null);
    setDocumentsComplete(false);
    setPipelineComplete(false);
    setPipelineDecision(null);
    setCurrentStep(0);
    setFormData(initialFormData);
  }, []);

  const handleLoanChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      loan: {
        ...prev.loan,
        [name]: value,
      },
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'documents') {
      setFormData((prev) => ({
        ...prev,
        documents: value,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      applicant: {
        ...prev.applicant,
        [name]: value,
      },
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((step) => step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (stepIndex) => {
    setCurrentStep(stepIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleCollapse = () => {
    setIsCollapsed((value) => !value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      request_id: crypto.randomUUID(),
      callback_url: '',
      app_id: crypto.randomUUID(),
      payload: {},
      ...formData.loan,
      requested_amount: Number(formData.loan.requested_amount),
      requested_term_months: Number(formData.loan.requested_term_months),
      preferred_payment_day: Number(formData.loan.preferred_payment_day),
      applicants: [
        {
          ...formData.applicant,
          ssn_no: formData.applicant.ssn_no,
          ssn_last4: formData.applicant.ssn_no
            ? formData.applicant.ssn_no.replace(/\D/g, '').slice(-4)
            : '',
          employment:
            Object.keys(formData.applicant.employment || {}).length === 0
              ? null
              : formData.applicant.employment,
          incomes: formData.applicant.incomes.map((income) => ({
            ...income,
            monthly_amount: Number(income.monthly_amount),
          })),
          assets: formData.applicant.assets.map((asset) => ({
            ...asset,
            value: Number(asset.value),
          })),
          liabilities: formData.applicant.liabilities.map((liability) => ({
            ...liability,
            outstanding_balance: Number(liability.outstanding_balance),
            monthly_payment: Number(liability.monthly_payment),
            months_remaining: Number(liability.months_remaining),
          })),
        },
      ],
    };

    try {
      const response = await apiClient.post('/loan_intake/submit_application', payload);
      const backendApplicationId = response.data.application_id || crypto.randomUUID();

      setApplicationId(backendApplicationId);
      setDocumentsComplete(false);
      setPipelineComplete(false);
      setPipelineDecision(null);
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Loan submission failed:', error);

      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          error.response.data.detail.forEach((entry) => {
            toast.error(entry.msg || entry);
          });
        } else {
          toast.error(error.response.data.detail);
        }
      } else {
        toast.error('Submission failed. Please try again.');
      }
    }
  };

  const handlePipelineComplete = useCallback((decision) => {
    setPipelineDecision(decision);
    setPipelineComplete(true);
  }, []);

  const handleDocumentsComplete = useCallback(() => {
    setDocumentsComplete(true);
    toast.success('Documents uploaded successfully. Starting verification.');
  }, []);

  const handleDecisionConfirm = useCallback(
    (choice) => {
      const selectedTerms = choice === 'counter' ? pipelineDecision?.counter : pipelineDecision?.requested;
      console.log('Offer accepted:', { applicationId, choice, selectedTerms });
      toast.success('Offer selection captured. API confirmation can be wired in next.');
    },
    [applicationId, pipelineDecision]
  );

  const handleDecisionDecline = useCallback(() => {
    toast.info('All offers declined. Starting a new application.');
    resetApplication();
  }, [resetApplication]);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <LoanDetails formData={formData.loan} onChange={handleLoanChange} />;
      case 1:
        return <ApplicantInfo formData={formData.applicant} onChange={handleChange} />;
      case 2:
        return <AddressInfo formData={formData.applicant} onChange={handleChange} />;
      case 3:
        return <EmploymentDetails formData={formData.applicant} onChange={handleChange} />;
      case 4:
        return <IncomeInfo formData={formData.applicant} onChange={handleChange} />;
      case 5:
        return <AssetsLiabilities formData={formData.applicant} onChange={handleChange} />;
      case 6:
        return <ReviewSubmit formData={formData} onEdit={handleStepClick} />;
      default:
        return null;
    }
  };

  if (applicationId && pipelineComplete && pipelineDecision) {
    return (
      <div style={{ minHeight: '100vh', padding: 'var(--spacing-2xl)' }}>
        <DecisionScreen
          decision={pipelineDecision}
          onConfirm={handleDecisionConfirm}
          onDecline={handleDecisionDecline}
          onReset={resetApplication}
        />
      </div>
    );
  }

  if (applicationId && !documentsComplete) {
    return (
      <div style={{ minHeight: '100vh', padding: 'var(--spacing-2xl)' }}>
        <DocumentUpload
          formData={formData}
          onChange={handleChange}
          applicationId={applicationId}
          onContinue={handleDocumentsComplete}
        />
      </div>
    );
  }

  if (applicationId && documentsComplete && !pipelineComplete) {
    return (
      <div style={{ minHeight: '100vh', padding: 'var(--spacing-2xl)' }}>
        <PipelineScreen applicationId={applicationId} onComplete={handlePipelineComplete} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        currentStep={currentStep}
        steps={steps}
        onStepClick={handleStepClick}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      <div
        style={{
          marginLeft: isCollapsed ? '60px' : '280px',
          flex: 1,
          padding: 'var(--spacing-2xl)',
          maxWidth: '1200px',
          transition: 'margin-left 0.3s ease-in-out',
        }}
      >
        <form onSubmit={handleSubmit}>
          {renderStep()}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 'var(--spacing-xl)',
              gap: 'var(--spacing-md)',
            }}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>

            {currentStep === 6 ? (
              <Button type="submit" variant="primary">
                Submit Form
              </Button>
            ) : (
              <Button type="button" variant="primary" onClick={handleNext}>
                Next
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanIntake;
