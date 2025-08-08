import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultCom.css';
import PasswordPanel from './PasswordPanel';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://plot-geek-vehicle-pathology.trycloudflare.com';

const ResultCom = ({ result, isLoading, onPasswordPanelToggle }) => {
    const [showPasswordPanel, setShowPasswordPanel] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState(null);
    const navigate = useNavigate();

    // Extract user data from the new API response format
    const getUserData = () => {

        if (!result || !result.result || !result.result[0] || !result.result[0].user) {

            return null;
        }
        const userData = result.result[0].user;
        
        return userData;
    };

    const userData = getUserData();

    useEffect(() => {

        if (userData?.generated_password) {
            setGeneratedPassword(userData.generated_password);
            localStorage.setItem('generated_password', userData.generated_password);
            
            // Store username in temporary storage
            if (userData.username) {
                localStorage.setItem('temp_username', userData.username);
                // Set expiration time (30 minutes)
                localStorage.setItem('temp_username_expiry', Date.now() + (30 * 60 * 1000));
            }
        }
    }, [userData]);

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
        if (isLoading || !userData?.profile_pic_url) {
            return '/default-avatar.png';
        }
        return userData.profile_pic_url;
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

    if (!result || !userData) {

        return null;
    }

    const renderProfileHeader = () => (
        <div className="profile-header">
            <div className="profile-pic-container">
                <img 
                    src={getProfileImageUrl()}
                    alt={`${userData.username}'s profile`} 
                    className="profile-pic"
                    loading="lazy"
                    decoding="async"
                />
            </div>
            <div className="profile-title">
                <div className="profile-name-section">
                    <h3>{userData.username}</h3>
                    {userData.is_verified && <i className="fas fa-check-circle verified-badge"></i>}
                </div>
                <div className="profile-stats">
                    <div className="stat">
                        <span className="stat-value">{userData.media_count || 0}</span>
                        <span className="stat-label">posts</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">{userData.follower_count || 0}</span>
                        <span className="stat-label">followers</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">{userData.following_count || 0}</span>
                        <span className="stat-label">following</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderBioSection = () => (
        <div className="bio-section">
            <h4>Bio Analysis</h4>
            <p className="full-name">{userData.full_name}</p>
            <p className="bio-text">{userData.biography}</p>
            {userData.category_name && (
                <div className="category-tag">
                    {userData.category_name}
                </div>
            )}
            {userData.external_url && (
                <a 
                    href={userData.external_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="external-link"
                >
                    {userData.external_url}
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
                        {userData.is_business_account ? 'Business' : 
                         userData.is_professional_account ? 'Professional' : 'Personal'}
                    </span>
                </div>
                <div className="metadata-item">
                    <span className="metadata-label">Private Account</span>
                    <span className="metadata-value">{userData.is_private ? 'Yes' : 'No'}</span>
                </div>
                <div className="metadata-item">
                    <span className="metadata-label">Verified</span>
                    <span className="metadata-value">{userData.is_verified ? 'Yes' : 'No'}</span>
                </div>
                <div className="metadata-item">
                    <span className="metadata-label">Highlight Reels</span>
                    <span className="metadata-value">{userData.highlight_reel_count > 0 ? 'Yes' : 'No'}</span>
                </div>
                <div className="metadata-item">
                    <span className="metadata-label">Total Posts</span>
                    <span className="metadata-value">{userData.media_count || 0}</span>
                </div>
                <div className="metadata-item">
                    <span className="metadata-label">Account ID</span>
                    <span className="metadata-value">{userData.id}</span>
                </div>
                {userData.overall_category_name && (
                    <div className="metadata-item">
                        <span className="metadata-label">Category</span>
                        <span className="metadata-value">{userData.overall_category_name}</span>
                    </div>
                )}
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
                    username={userData.username}
                    fullName={userData.full_name}
                    bio={userData.biography}
                    onClose={handlePasswordPanelClose}
                />
            )}
        </div>
    );
};

export default ResultCom; 
