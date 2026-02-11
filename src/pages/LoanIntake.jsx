import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Button from '../components/FormElements/Button';
import LoanDetails from '../components/FormSteps/LoanDetails';
import ApplicantInfo from '../components/FormSteps/ApplicantInfo';
import AddressInfo from '../components/FormSteps/AddressInfo';
import EmploymentDetails from '../components/FormSteps/EmploymentDetails';
import IncomeInfo from '../components/FormSteps/IncomeInfo';
import AssetsLiabilities from '../components/FormSteps/AssetsLiabilities';
import ReviewSubmit from '../components/FormSteps/ReviewSubmit';
import DocumentUpload from '../components/FormSteps/DocumentUpload';
import '../styles/components.css';
import apiClient from '../api/client';

const LoanIntake = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ----------------------------
  // MASTER FORM STATE
  // ----------------------------
  const [formData, setFormData] = useState({
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

    documents: {}
  });



  const resetApplication = () => {
  setApplicationId(null);
  setCurrentStep(0);

  setFormData({
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
    documents: {}
  });
};


  // ----------------------------
  // STEPS
  // ----------------------------
  const steps = [
    { title: 'Loan Details', description: 'Basic loan information' },
    { title: 'Applicant Info', description: 'Personal details' },
    { title: 'Address', description: 'Contact information' },
    { title: 'Employment', description: 'Work details' },
    { title: 'Additional Income', description: 'Other income sources' },
    { title: 'Assets & Liabilities', description: 'Financial overview' },
    { title: 'Review & Submit', description: 'Final review' },
    // { title: 'Document Upload', description: 'Upload verification docs' }
  ];

  // ----------------------------
  // CHANGE HANDLER (APPLICANT)
  // ----------------------------

 const [applicationId, setApplicationId] = useState(null);



  const handleLoanChange = (e) => {
  const { name, value } = e.target;

  setFormData(prev => ({
    ...prev,
    loan: {
      ...prev.loan,
      [name]: value
    }
  }));
};

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      applicant: {
        ...prev.applicant,
        [name]: value
      }
    }));
  };

  // ----------------------------
  // NAVIGATION
  // ----------------------------
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (stepIndex) => {
    setCurrentStep(stepIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(v => !v);
  };

  // ----------------------------
  // SUBMIT
  // ----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      request_id: crypto.randomUUID(),
      callback_url: "",
      app_id: crypto.randomUUID(),
      payload: {},

      ...formData.loan,

      requested_amount: Number(formData.loan.requested_amount),
      requested_term_months: Number(formData.loan.requested_term_months),
      preferred_payment_day: Number(formData.loan.preferred_payment_day),

      applicants: [
        {
          ...formData.applicant,

          employment:
            Object.keys(formData.applicant.employment || {}).length === 0
              ? null
              : formData.applicant.employment,

          incomes: formData.applicant.incomes.map(i => ({
            ...i,
            monthly_amount: Number(i.monthly_amount),
          })),

          assets: formData.applicant.assets.map(a => ({
            ...a,
            value: Number(a.value),
          })),

          liabilities: formData.applicant.liabilities.map(l => ({
            ...l,
            outstanding_balance: Number(l.outstanding_balance),
            monthly_payment: Number(l.monthly_payment),
            months_remaining: Number(l.months_remaining),
          })),
        }
      ]
    };

    try {
      const response = await apiClient.post(
  '/loan_intake/submit_application',
  payload
);

const backendApplicationId = response.data.application_id; // 👈 adjust key if needed
setApplicationId(backendApplicationId);
// setApplicationId(response.data.app_id);



      console.log('Loan submitted successfully:', response.data);
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Loan submission failed:', error);
      alert('Submission failed. Please check required fields.');
    }
  };
 
  // ----------------------------
  // STEP RENDER
  // ----------------------------
  const renderStep = () => {
    switch (currentStep) {
      case 0:
          return (
    <LoanDetails
      formData={formData.loan}
      onChange={handleLoanChange}
    />
  );
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
      case 7:
        return <DocumentUpload
  applicationId={applicationId}
  documents={formData.documents}
  onChange={(docs) =>
    setFormData(prev => ({ ...prev, documents: docs }))
  }
/>

      default:
        return null;
    }
  };

  // ----------------------------
  // UI
  // ----------------------------
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
          transition: 'margin-left 0.3s ease-in-out'
        }}
      >
      <form onSubmit={handleSubmit}>
  {applicationId ? (
    <>
      <DocumentUpload
        applicationId={applicationId}
        documents={formData.documents}
        onChange={(docs) =>
          setFormData(prev => ({ ...prev, documents: docs }))
        }
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 'var(--spacing-xl)',
        }}
      >
        <Button
          type="button"
          variant="secondary"
          onClick={resetApplication}
        >
          Close Application
        </Button>
      </div>
    </>
  ) : (
    <>
      {renderStep()}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 'var(--spacing-xl)',
          gap: 'var(--spacing-md)'
        }}
      >
        <Button
          type="button"
          variant="secondary"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          ← Back
        </Button>

        {currentStep === 6 ? (
          <Button type="submit" variant="primary">
            Submit Form
          </Button>
        ) : (
          <Button type="button" variant="primary" onClick={handleNext}>
            Next →
          </Button>
        )}
      </div>
    </>
  )}
</form>


      </div>
    </div>
  );
};

export default LoanIntake;
