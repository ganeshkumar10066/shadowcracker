import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultCom.css';
import PasswordPanel from './PasswordPanel';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://philippines-warrant-imagine-ventures.trycloudflare.com';

const ResultCom = ({ result, isLoading, onPasswordPanelToggle }) => {
    const [showPasswordPanel, setShowPasswordPanel] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (result?.generated_password) {
            setGeneratedPassword(result.generated_password);
            localStorage.setItem('generated_password', result.generated_password);
            
            // Store username in temporary storage
            if (result.username) {
                localStorage.setItem('temp_username', result.username);
                // Set expiration time (30 minutes)
                localStorage.setItem('temp_username_expiry', Date.now() + (30 * 60 * 1000));
            }
        }
    }, [result]);

    // Add function to get username from temporary storage
    const getTempUsername = () => {
        const username = localStorage.getItem('temp_username');
        const expiry = localStorage.getItem('temp_username_expiry');
        
        if (username && expiry && Date.now() < parseInt(expiry)) {
            return username;
        }
        
        // Clear expired data
        localStorage.removeItem('temp_username');
        localStorage.removeItem('temp_username_expiry');
        return null;
    };

    const getProfileImageUrl = () => {
        if (isLoading || !result?.profile_pic_url) {
            return '/default-avatar.png';
        }
        return result.profile_pic_url;
    };

    const handlePasswordPanelOpen = () => {
        setShowPasswordPanel(true);
        onPasswordPanelToggle(true);
    };

    const handlePasswordPanelClose = () => {
        setShowPasswordPanel(false);
        onPasswordPanelToggle(false);
    };

    if (isLoading) {
        return (
            <div className="result-com">
                <div className="result-com-header">Loading Analysis...</div>
                <div className="result-com-content">
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    if (!result) return null;

    const renderProfileHeader = () => (
        <div className="profile-header">
            <div className="profile-pic-container">
                <img 
                    src={getProfileImageUrl()}
                    alt={`${result.username}'s profile`} 
                    className="profile-pic"
                    loading="lazy"
                    decoding="async"
                />
            </div>
            <div className="profile-title">
                <div className="profile-name-section">
                    <h3>{result.username}</h3>
                    {result.is_verified && <i className="fas fa-check-circle verified-badge"></i>}
                </div>
                <div className="profile-stats">
                    <div className="stat">
                        <span className="stat-value">{result.edge_owner_to_timeline_media?.count || 0}</span>
                        <span className="stat-label">posts</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">{result.edge_followed_by?.count || 0}</span>
                        <span className="stat-label">followers</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">{result.edge_follow?.count || 0}</span>
                        <span className="stat-label">following</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderBioSection = () => (
        <div className="bio-section">
            <h4>Bio Analysis</h4>
            <p className="full-name">{result.full_name}</p>
            <p className="bio-text">{result.biography}</p>
            {result.category_name && (
                <div className="category-tag">
                    {result.category_name}
                </div>
            )}
            {result.external_url && (
                <a 
                    href={result.external_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="external-link"
                >
                    {result.external_url}
                </a>
            )}
        </div>
    );

    const renderMetadataSection = () => (
        <div className="metadata-section">
            <h4>Account Information</h4>
            <div className="metadata-grid">
                <div className="metadata-item">
                    <span className="metadata-label">Account Type</span>
                    <span className="metadata-value">
                        {result.is_business_account ? 'Business' : 
                         result.is_professional_account ? 'Professional' : 'Personal'}
                    </span>
                </div>
                <div className="metadata-item">
                    <span className="metadata-label">Private Account</span>
                    <span className="metadata-value">{result.is_private ? 'Yes' : 'No'}</span>
                </div>
                <div className="metadata-item">
                    <span className="metadata-label">Verified</span>
                    <span className="metadata-value">{result.is_verified ? 'Yes' : 'No'}</span>
                </div>
                <div className="metadata-item">
                    <span className="metadata-label">Highlight Reels</span>
                    <span className="metadata-value">{result.highlight_reel_count}</span>
                </div>
            </div>
        </div>
    );

    const renderConfirmSection = () => (
        <div className="confirm-account-section">
            <button 
                className="confirm-account-button"
                onClick={handlePasswordPanelOpen}
            >
                Crack Password
            </button>
            
        </div>
    );

    return (
        <div className="result-com">
            <div className="result-com-header">Analysis Results</div>
            {renderProfileHeader()}
            <div className="result-com-content">
                {renderBioSection()}
                {renderMetadataSection()}
                {renderConfirmSection()}
            </div>

            {showPasswordPanel && (
                <PasswordPanel
                    username={result.username}
                    fullName={result.full_name}
                    bio={result.biography}
                    onClose={handlePasswordPanelClose}
                />
            )}
        </div>
    );
};

export default ResultCom; 
