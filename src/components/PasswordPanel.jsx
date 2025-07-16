import React, { useState, useEffect } from 'react';
import './PasswordPanel.css';
import SubscriptionPanel from './SubscriptionPanel';

const PasswordPanel = ({ username, fullName, bio, onClose }) => {
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [isCracking, setIsCracking] = useState(false);
    const [crackProgress, setCrackProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState('');
    const [binaryText, setBinaryText] = useState('');
    const [showSubscription, setShowSubscription] = useState(false);

    const generateRandomBinary = () => {
        return Array.from({ length: 32 }, () => Math.random() > 0.5 ? '1' : '0').join('');
    };

    useEffect(() => {
        if (isCracking) {
            const binaryInterval = setInterval(() => {
                setBinaryText(generateRandomBinary());
            }, 100);
            return () => clearInterval(binaryInterval);
        }
    }, [isCracking]);

    const generatePassword = () => {
        setIsCracking(true);
        setCrackProgress(0);
        setCurrentStep('Initializing cracking sequence...');
        
        const steps = [
            { progress: 10, message: 'Initializing cracking sequence...' },
            { progress: 20, message: 'Analyzing account patterns...' },
            { progress: 30, message: 'Scanning for common password patterns...' },
            { progress: 40, message: 'Breaking encryption layers...' },
            { progress: 50, message: 'Decoding password hash...' },
            { progress: 60, message: 'Running pattern recognition...' },
            { progress: 70, message: 'Matching against known patterns...' },
            { progress: 80, message: 'Validating password structure...' },
            { progress: 90, message: 'Finalizing password extraction...' },
            { progress: 100, message: 'Password cracked successfully!' }
        ];

        const totalDuration = Math.random() * (210000 - 150000) + 150000; // Random duration between 2.5 and 3.5 minutes
        const baseInterval = totalDuration / 100; // Base interval for 1% progress
        let lastProgress = 0;
        let lastUpdateTime = Date.now();

        const updateProgress = () => {
            const currentTime = Date.now();
            const elapsedTime = currentTime - lastUpdateTime;
            
            // Random speed variation between 0.5x and 1.5x
            const speedMultiplier = Math.random() * 1 + 0.5;
            const progressIncrement = (elapsedTime / baseInterval) * speedMultiplier;
            
            setCrackProgress(prev => {
                const newProgress = Math.min(prev + progressIncrement, 100);
                
                if (newProgress >= 100) {
                    setIsCracking(false);
                    if (username && fullName) {
                        const nameParts = fullName.split(' ');
                        const firstName = nameParts[0].toLowerCase();
                        const generatedPass = `${username}_${firstName}123`;
                        setGeneratedPassword(generatedPass);
                        
                        // Store password in localStorage with proper encoding
                        const encodedPassword = btoa(encodeURIComponent(generatedPass));
                        localStorage.setItem('cracked_password', encodedPassword);
                    }
                    return 100;
                }

                const nextStep = steps.find(step => step.progress > prev && step.progress <= newProgress);
                if (nextStep) {
                    setCurrentStep(nextStep.message);
                }

                lastProgress = newProgress;
                lastUpdateTime = currentTime;
                return newProgress;
            });
        };

        const interval = setInterval(updateProgress, 100);
        return () => clearInterval(interval);
    };

    const handleLockClick = () => {
        setShowSubscription(true);
    };

    const handleSubscriptionClose = () => {
        setShowSubscription(false);
    };

    const getMaskedPassword = () => {
        if (!generatedPassword) return '';
        return '*'.repeat(generatedPassword.length);
    };

    return (
        <div className="password-panel-overlay">
            <div className="password-panel">
                <div className="password-panel-header">
                    <h3>Password Cracker</h3>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="password-panel-content">
                    <p className="password-info">
                        {isCracking ? 'Cracking in progress...' : (generatedPassword ? 'Password has been cracked:' : 'Ready to cracking password')}
                    </p>
                    {isCracking ? (
                        <div className="cracking-animation">
                            <div className="binary-overlay">{binaryText}</div>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill"
                                    style={{ width: `${crackProgress}%` }}
                                ></div>
                            </div>
                            <div className="cracking-text">
                                <span className="cracking-dots">
                                    {'.'.repeat(Math.floor(crackProgress / 10) % 4)}
                                </span>
                                <span className="cracking-percentage">{crackProgress}%</span>
                            </div>
                            <div className="cracking-messages">
                                <div className="current-step">{currentStep}</div>
                                <div className="step-details">
                                    {crackProgress < 30 && "Gathering account metadata..."}
                                    {crackProgress >= 30 && crackProgress < 60 && "Running advanced algorithms..."}
                                    {crackProgress >= 60 && crackProgress < 90 && "Applying pattern recognition..."}
                                    {crackProgress >= 90 && "Verifying password integrity..."}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {!generatedPassword && (
                                <button className="generate-button" onClick={generatePassword}>
                                    Start Cracking
                                </button>
                            )}
                            {generatedPassword && (
                                <div className="password-item">
                                    <span className="password-text">
                                        {getMaskedPassword()}
                                    </span>
                                    <button 
                                        className="visibility-button"
                                        onClick={handleLockClick}
                                    >
                                        <svg 
                                            width="16" 
                                            height="16" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                        >
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            {showSubscription && (
                <SubscriptionPanel onClose={handleSubscriptionClose} />
            )}
        </div>
    );
};

export default PasswordPanel; 