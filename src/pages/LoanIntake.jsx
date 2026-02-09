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

const LoanIntake = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [formData, setFormData] = useState({
        // Loan details
        loan_type: '',
        credit_type: 'individual',
        loan_purpose: '',
        requested_amount: '',
        requested_term_months: '',
        preferred_payment_day: '',
        origination_channel: '',
        application_status: 'submitted',

        // Applicant info
        applicant_role: 'primary',
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        date_of_birth: '',
        ssn_last4: '',
        itin_number: '',
        citizenship_status: '',
        email: '',

        // Arrays
        addresses: [],
        incomes: [],
        assets: [],
        liabilities: [],
        documents: {},

        // Employment (nested object)
        employment: {}
    });

    const steps = [
        { title: 'Loan Details', description: 'Basic loan information' },
        { title: 'Applicant Info', description: 'Personal details' },
        { title: 'Address', description: 'Contact information' },
        { title: 'Employment', description: 'Work & income' },
        { title: 'Additional Income', description: 'Other income sources' },
        { title: 'Assets & Liabilities', description: 'Financial overview' },
        { title: 'Review & Submit', description: 'Final review' },
        { title: 'Document Upload', description: 'Upload verification docs' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleStepClick = (stepIndex) => {
        setCurrentStep(stepIndex);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleToggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Build the payload matching the backend structure
        const payload = {
            request_id: crypto.randomUUID(),
            callback_url: '',
            app_id: crypto.randomUUID(),
            payload: {},
            loan_type: formData.loan_type,
            credit_type: formData.credit_type,
            loan_purpose: formData.loan_purpose,
            requested_amount: parseFloat(formData.requested_amount) || 0,
            requested_term_months: parseInt(formData.requested_term_months) || 0,
            preferred_payment_day: parseInt(formData.preferred_payment_day) || 0,
            origination_channel: formData.origination_channel,
            application_status: 'submitted',
            applicants: [
                {
                    applicant_role: formData.applicant_role,
                    first_name: formData.first_name,
                    middle_name: formData.middle_name,
                    last_name: formData.last_name,
                    suffix: formData.suffix,
                    date_of_birth: formData.date_of_birth,
                    ssn_last4: formData.ssn_last4,
                    itin_number: formData.itin_number,
                    citizenship_status: formData.citizenship_status,
                    email: formData.email,
                    addresses: formData.addresses,
                    employment: formData.employment,
                    incomes: formData.incomes,
                    assets: formData.assets,
                    liabilities: formData.liabilities,
                    documents: formData.documents
                }
            ]
        };

        console.log('Submitting loan application:', payload);
        alert('Application submitted successfully! Check console for payload.');
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return <LoanDetails formData={formData} onChange={handleChange} />;
            case 1:
                return <ApplicantInfo formData={formData} onChange={handleChange} />;
            case 2:
                return <AddressInfo formData={formData} onChange={handleChange} />;
            case 3:
                return <EmploymentDetails formData={formData} onChange={handleChange} />;
            case 4:
                return <IncomeInfo formData={formData} onChange={handleChange} />;
            case 5:
                return <AssetsLiabilities formData={formData} onChange={handleChange} />;
            case 6:
                return <ReviewSubmit formData={formData} onEdit={handleStepClick} />;
            case 7:
                return <DocumentUpload formData={formData} onChange={handleChange} />;
            default:
                return null;
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar
                currentStep={currentStep}
                steps={steps}
                onStepClick={handleStepClick}
                isCollapsed={isCollapsed}
                onToggleCollapse={handleToggleCollapse}
            />

            <div style={{
                marginLeft: isCollapsed ? '60px' : '280px',
                flex: 1,
                padding: 'var(--spacing-2xl)',
                maxWidth: '1200px',
                width: '100%',
                transition: 'margin-left 0.3s ease-in-out'
            }}>
                <form onSubmit={handleSubmit}>
                    {renderStep()}

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: 'var(--spacing-xl)',
                        gap: 'var(--spacing-md)'
                    }}>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleBack}
                            disabled={currentStep === 0}
                        >
                            ← Back
                        </Button>

                        {currentStep === steps.length - 1 ? (
                            <Button type="submit" variant="primary">
                                Submit Application
                            </Button>
                        ) : (
                            <Button type="button" variant="primary" onClick={handleNext}>
                                Next →
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoanIntake;
