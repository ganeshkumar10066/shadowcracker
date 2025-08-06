import React, { useState, useEffect } from 'react';
import './SubscriptionPanel.css';
import { calculatePrice } from '../services/pricingService';
import { processPayment } from '../services/paymentService';

const SubscriptionPanel = ({ onClose, userData: initialUserData }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [paymentMessage, setPaymentMessage] = useState('');
    const [userData, setUserData] = useState(initialUserData);
    const [priceData, setPriceData] = useState(null);
    const [isLoadingPrice, setIsLoadingPrice] = useState(true);

    // Fallback: if initialUserData is not provided, try to get username from localStorage
    useEffect(() => {
        if (!initialUserData) {
            const tempUsername = localStorage.getItem('temp_username');
            if (tempUsername) {
                setUserData({ username: tempUsername });
            }
        }
    }, [initialUserData]);

    // Add effect to handle body class and fetch user data
    useEffect(() => {
        // Add class to body when component mounts
        document.body.classList.add('subscription-panel-open');
        
        // Fetch user data from localStorage if not provided
        const fetchUserData = async () => {
            const tempUsername = localStorage.getItem('temp_username');
            const expiry = localStorage.getItem('temp_username_expiry');
            
            if (tempUsername && expiry && Date.now() < parseInt(expiry)) {
                try {
                    // Removed fetchProfile as per edit hint
                    // const response = await fetchProfile(tempUsername);
                    // if (response.success) {
                    //     setUserData(response.data);
                    // }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        if (!userData) {
            fetchUserData();
        }
        
        // Remove class when component unmounts
        return () => {
            document.body.classList.remove('subscription-panel-open');
        };
    }, [userData]);

    // Add effect to fetch price when user data changes
    useEffect(() => {
        const fetchPrice = async () => {
    
            if (userData) {
                setIsLoadingPrice(true);
                try {
                    const price = await calculatePrice(userData);
            
                    setPriceData(price);
                } catch (error) {
                    console.error('Error fetching price:', error);
                } finally {
                    setIsLoadingPrice(false);
                }
            }
        };

        fetchPrice();
    }, [userData]);

    const handleTransfer = async () => {

        try {
            if (!userData) {
                setPaymentStatus('error');
                setPaymentMessage('User data not available. Please try again.');
                return;
            }

            setIsProcessing(true);
            setPaymentStatus('processing');
            setPaymentMessage('Processing payment...');

            // Always fetch the latest price from backend before payment using calculatePrice
            const latestPriceData = await calculatePrice(userData);
    
            const latestPrice = latestPriceData?.finalPrice || latestPriceData?.price || null;

            if (!latestPrice) {
                setPaymentStatus('error');
                setPaymentMessage('Could not fetch latest price. Please try again.');
                setIsProcessing(false);
                return;
            }

            // Pass finalPrice in userData
            const result = await processPayment({ ...userData, finalPrice: latestPrice });

            if (result.success) {
                setPaymentStatus('success');
                setPaymentMessage(result.message);
                // Open payment URL in the same window
                window.location.href = result.url;
            } else {
                setPaymentStatus('error');
                setPaymentMessage(result.message);
            }
        } catch (error) {
            console.error('Payment error:', error);
            setPaymentStatus('error');
            setPaymentMessage('Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="subscription-panel-overlay">
            <div className="subscription-panel">
                <div className="subscription-panel-header">
                    <h3>Password Access</h3>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="subscription-content">
                    <div className="subscription-plans">
                        <div className="plan-card">
                            <div className="plan-price">
                                {isLoadingPrice ? (
                                    'Loading...'
                                ) : priceData ? (
                                    <>
                                        {Number(priceData.finalPrice).toLocaleString()}
                                        <span style={{ fontSize: '0.7em', marginLeft: '5px' }}>₹</span>
                                    </>
                                ) : (
                                    <span style={{ color: 'red' }}>
                                        Price not available. <br />
                                        <span style={{ fontSize: '0.8em' }}>Please try again later.</span>
                                    </span>
                                )}
                            </div>
                            <div className="plan-description">
                                Please complete your payment to unlock the result instantly.
                                <br/><br/>
                                <span style={{ color: '#00ff00' }}>✔️</span> Secure payment gateway
                                <br/>
                                <span style={{ color: '#00ff00' }}>✔️</span> Instant access
                                <br/>
                                <span style={{ color: '#00ff00' }}>✔️</span> Guaranteed delivery
                            </div>
                            {paymentStatus === 'processing' ? (
                                <div className="payment-processing">
                                    <div className="loading-spinner"></div>
                                    {paymentMessage}
                                </div>
                            ) : paymentStatus === 'success' ? (
                                <div className="payment-success">
                                    {paymentMessage}
                                </div>
                            ) : paymentStatus === 'error' ? (
                                <div className="payment-error">
                                    {paymentMessage}
                                </div>
                            ) : (
                                <button 
                                    className="subscribe-button"
                                    onClick={handleTransfer}
                                    disabled={isProcessing || !userData || isLoadingPrice || !priceData}
                                >
                                    {isProcessing ? 'Processing...' : 'Transfer Now'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPanel; 