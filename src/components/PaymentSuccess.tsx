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
        const orderId = localStorage.getItem('order_id');
        if (orderId) {
            verifyPayment(orderId);
        } else {
            setPaymentStatus({
                code: 400,
                message: 'No order ID found',
                type: 'error'
            });
            setLoading(false);
        }
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

    const verifyPayment = async (orderId: string): Promise<void> => {
        setLoading(true);
        setError(null);
        
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://philippines-warrant-imagine-ventures.trycloudflare.com';
            const response = await fetch(`${API_URL}/api/payment/inquiry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderId })
            });

            const data = await response.json();
            console.log('Payment inquiry response:', data);

            if (!response.ok) {
                handlePaymentStatus({
                    code: response.status,
                    message: data.error || 'Server error',
                    type: 'error'
                });
                return;
            }

            if (data.code === 0 && data.data?.status === 1) {
                // Payment successful, get password
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const verifyResponse = await fetch(`${API_URL}/api/payment/verify/${orderId}`);
                const verifyData = await verifyResponse.json();

                if (verifyData.success) {
                    localStorage.setItem('payment_password', verifyData.password);
                    setPassword(verifyData.password);
                    handlePaymentStatus({
                        code: 200,
                        message: 'Payment verified successfully',
                        type: 'success'
                    });
                } else {
                    handlePaymentStatus({
                        code: 400,
                        message: verifyData.message || 'Payment verification failed',
                        type: 'error'
                    });
                }
            } else if (data.data?.status === 0) {
                // Payment pending
                handlePaymentStatus({
                    code: 202,
                    message: 'Payment is pending. Please wait...',
                    type: 'pending'
                });
            } else {
                // Payment failed or other error
                handlePaymentStatus({
                    code: 400,
                    message: 'Payment has failed',
                    type: 'error'
                });
            }
        } catch (err) {
            console.error('Payment verification error:', err);
            handlePaymentStatus({
                code: 500,
                message: 'Network error. Please check your connection.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCopyPassword = (): void => {
        if (password) {
            navigator.clipboard.writeText(password)
                .then(() => {
                    handlePaymentStatus({
                        code: 200,
                        message: 'Password copied to clipboard',
                        type: 'success'
                    });
                })
                .catch(() => {
                    handlePaymentStatus({
                        code: 400,
                        message: 'Failed to copy password',
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
                            </div>
                        )}

                        <button 
                            onClick={handleBackToHome} 
                            className="back-button"
                        >
                            Back to Home
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess; 
