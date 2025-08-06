import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';

interface PaymentStatus {
    code: number;
    message: string;
    type: 'success' | 'error' | 'pending';
}

const PaymentSuccess: React.FC = () => {
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
    const navigate = useNavigate();

    // Error message mapping
    const errorMessages = {
        'Connection error': 'Unable to connect to the payment server. Please check your internet connection and try again.',
        'Timeout error': 'The request took too long to complete. Please try again.',
        'Received HTML response instead of JSON': 'Server returned an invalid response. Please try again later.',
        'Invalid order ID': 'Please enter a valid order ID.',
        'Payment not found': 'No payment found for this order ID. Please check and try again.',
        'Payment pending': 'Your payment is still being processed. Please wait a moment and try again.',
        'Payment failed': 'The payment verification failed. Please contact support if this persists.',
        'Server error': 'An error occurred on our server. Please try again later.',
        'Network error': 'Network connection error. Please check your internet connection.',
        'default': 'An unexpected error occurred. Please try again.'
    };

    useEffect(() => {
        verifyPayment();
    }, []);

    const getErrorMessage = (error: string): string => {
        return errorMessages[error as keyof typeof errorMessages] || errorMessages.default;
    };

    const handlePaymentStatus = (status: PaymentStatus) => {
        setPaymentStatus(status);
        
        // Add animation class based on status
        const statusElement = document.querySelector('.payment-status-animation');
        if (statusElement) {
            statusElement.classList.remove('success-animation', 'error-animation', 'pending-animation');
            statusElement.classList.add(`${status.type}-animation`);
        }
    };

    const verifyPayment = async (): Promise<void> => {
        setLoading(true);
        setError(null);
        
        // Check if password is already stored in localStorage
        const storedPassword = localStorage.getItem('generated_password');
        
        if (storedPassword) {
            // Password found in localStorage, show it directly
            setPassword(storedPassword);
            handlePaymentStatus({
                code: 200,
                message: 'Payment completed successfully! Your password is ready.',
                type: 'success'
            });
        } else {
            // No password found in localStorage
            handlePaymentStatus({
                code: 400,
                message: 'No payment password found. Please complete your payment first.',
                type: 'error'
            });
        }
        
        setLoading(false);
    };

    const handleCopyPassword = (): void => {
        if (password) {
            navigator.clipboard.writeText(password)
                .then(() => {
                    handlePaymentStatus({
                        code: 200,
                        message: 'Password copied to clipboard!',
                        type: 'success'
                    });
                    
                    // Auto-hide the success message after 3 seconds
                    setTimeout(() => {
                        handlePaymentStatus({
                            code: 200,
                            message: 'Payment completed successfully! Your password is ready.',
                            type: 'success'
                        });
                    }, 3000);
                })
                .catch(() => {
                    handlePaymentStatus({
                        code: 400,
                        message: 'Failed to copy password. Please copy manually.',
                        type: 'error'
                    });
                });
        }
    };



    const handleBackToHome = (): void => {
        navigate('/');
    };

    const renderPaymentStatus = () => {
        if (!paymentStatus) return null;

        return (
            <div className={`payment-status-animation ${paymentStatus.type}-animation`}>
                {paymentStatus.type === 'success' && (
                    <div className="success-checkmark">
                        <div className="check-icon">
                            <span className="icon-line line-tip"></span>
                            <span className="icon-line line-long"></span>
                        </div>
                    </div>
                )}
                {paymentStatus.type === 'error' && (
                    <div className="error-x">
                        <div className="x-line line-left"></div>
                        <div className="x-line line-right"></div>
                    </div>
                )}
                {paymentStatus.type === 'pending' && (
                    <div className="loading-spinner">
                        <div className="spinner-circle"></div>
                    </div>
                )}
                <p className="status-message">
                    {paymentStatus.type === 'error' 
                        ? getErrorMessage(paymentStatus.message)
                        : paymentStatus.message}
                </p>
            </div>
        );
    };

    return (
        <div className="payment-success-container">
            <div className="success-card">
                <h1>Payment Status</h1>
                
                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <>
                        {renderPaymentStatus()}

                        {password && paymentStatus?.type === 'success' && (
                            <div className="password-section">
                                <p>Your account password:</p>
                                <div className="password-display">
                                    <input 
                                        type="text" 
                                        value={password} 
                                        readOnly 
                                        className="password-input"
                                    />
                                    <button 
                                        onClick={handleCopyPassword} 
                                        className="copy-button"
                                    >
                                        Copy
                                    </button>
                                </div>
                                <div className="button-group">
                                    <button 
                                        onClick={handleBackToHome} 
                                        className="back-button"
                                    >
                                        Back to Home
                                    </button>
                                </div>
                            </div>
                        )}

                        {!password && (
                            <div className="button-group">
                                <button 
                                    onClick={handleBackToHome} 
                                    className="back-button"
                                >
                                    Back to Home
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess; 