import React, { useState } from 'react';
import InstagramIcon from './icons/InstagramIcon';
import './InputPanel.css';

const InputPanel = ({ onAnalyze }) => {
    const [username, setUsername] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim()) {
            // Show error message in console
            console.error('ERROR: Please enter a valid Instagram username');
            return;
        }
        
        setIsAnalyzing(true);
        try {
            // Start analysis process
            await onAnalyze(username);
        } catch (error) {
            console.error('Analysis error:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="panel input-panel">
            <div className="panel-header">
                <h2><InstagramIcon className="instagram-icon" /> Instagram Account Intelligence</h2>
            </div>
            <form onSubmit={handleSubmit} className="input-form">
                <div className="input-group">
                    <label htmlFor="username">Target Instagram Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username without @"
                        autoComplete="off"
                        className="input-field"
                        disabled={isAnalyzing}
                    />
                </div>
                <div className="button-container">
                    <button 
                        type="submit" 
                        className="analyze-button"
                        disabled={isAnalyzing}
                    >
                        <span className="button-text">
                            {isAnalyzing ? 'Analyzing...' : 'Analyze Target'}
                        </span>
                        <span className="button-glitch"></span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InputPanel; 