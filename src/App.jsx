import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MatrixBackground from './components/MatrixBackground'
import Header from './components/Header'
import InputPanel from './components/InputPanel'
import Console from './components/Console'
import ResultCom from './components/ResultCom'
import Footer from './components/Footer'
import PaymentSuccess from './components/PaymentSuccess'
import { fetchProfile } from './services/instagramService'
import './index.css'

const HomePage = () => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState([]);
    const [result, setResult] = useState(null);
    const [showPasswordPanel, setShowPasswordPanel] = useState(false);

    const handleLog = (log) => {
        setLogs(prev => [...prev, log]);
    };

    const handlePasswordPanelToggle = (show) => {
        setShowPasswordPanel(show);
    };

    const analyzeInstagram = async (username) => {
        if (!username.trim()) {
            console.error('ERROR: Please enter a valid Instagram username');
            handleLog({ type: 'ERROR', message: 'Please enter a valid Instagram username' });
            return;
        }

        setIsAnalyzing(true);
        setProgress(0);
        setResult(null);

        try {
            handleLog({ type: 'SYS', message: `Initiating analysis for target: @${username}` });
            handleLog({ type: 'CONN', message: 'Connecting to Instagram public API...' });
            setProgress(10);

            await new Promise(resolve => setTimeout(resolve, 1000));
            handleLog({ type: 'API', message: 'Accessing public information...' });
            setProgress(20);

            const response = await fetchProfile(username);
            setProgress(40);

            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch profile data');
            }

            handleLog({ type: 'API', message: 'Public information retrieved successfully' });
            handleLog({ type: 'ANALYZE', message: 'Analyzing target profile structure...' });
            setProgress(60);

            await new Promise(resolve => setTimeout(resolve, 1000));

            handleLog({ type: 'ALGO', message: 'Applying password pattern analysis...' });
            setProgress(80);

            await new Promise(resolve => setTimeout(resolve, 1500));

            handleLog({ type: 'ALGO', message: 'Password patterns identified' });
            setProgress(90);

            handleLog({ type: 'SYS', message: 'Analysis complete!' });
            setProgress(100);

            setResult(response.data);

            handleLog({ type: 'SYS', message: `Analysis results for @${username}:` });
            handleLog({ type: 'SYS', message: `Full Name: ${response.data.fullName}` });
            if (response.data.keywords) {
                handleLog({ type: 'SYS', message: `Bio Keywords: ${response.data.keywords.join(', ')}` });
            }
            if (response.data.password) {
                handleLog({ type: 'SYS', message: `Password Pattern: ${response.data.password}` });
            }

        } catch (error) {
            handleLog({ type: 'ERROR', message: `Error during analysis: ${error.message}` });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="app-container">
            <MatrixBackground />
            <div className="content-wrapper">
                {!showPasswordPanel && <Header />}
                <main className="main-content">
                    <InputPanel onAnalyze={analyzeInstagram} />
                    <Console isAnalyzing={isAnalyzing} progress={progress} onLog={handleLog} />
                    <ResultCom 
                        result={result} 
                        isLoading={isAnalyzing} 
                        onPasswordPanelToggle={handlePasswordPanelToggle}
                    />
                </main>
                {!showPasswordPanel && <Footer />}
            </div>
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
            </Routes>
        </Router>
    );
};

export default App;
