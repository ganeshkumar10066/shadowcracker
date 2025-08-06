import React, { useState, useEffect, useRef } from 'react';
import './Console.css'

const Console = ({ isAnalyzing, progress, onLog, backendLogs = [] }) => {
    const [logs, setLogs] = useState([
        { type: 'SYS', message: 'ShadowCracker initialized... Ready for target analysis' },
        { type: 'SYS', message: 'Database connection established' },
        { type: 'SYS', message: 'Algorithms loaded: 8 patterns identified' },
        { type: 'SYS', message: 'Enter Instagram username to begin operation' }
    ]);
    const [visibleLogs, setVisibleLogs] = useState([]);
    const [currentLogIndex, setCurrentLogIndex] = useState(0);
    const consoleRef = useRef(null);

    // Handle backend logs
    useEffect(() => {
        if (backendLogs.length > 0) {
            backendLogs.forEach(log => {
                logToConsole(log.message, log.type || 'INFO');
            });
        }
    }, [backendLogs]);

    // Handle initial logs animation
    useEffect(() => {
        if (currentLogIndex < logs.length) {
            const timer = setTimeout(() => {
                setVisibleLogs(prev => [...prev, logs[currentLogIndex]]);
                setCurrentLogIndex(prev => prev + 1);
            }, 1000); // Show each log after 1 second
            return () => clearTimeout(timer);
        }
    }, [currentLogIndex, logs]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
    }, [visibleLogs]);

    // Handle analysis status
    useEffect(() => {
        if (isAnalyzing) {
            logToConsole('Starting profile analysis...', 'ANALYZE');
            logToConsole('Connecting to Instagram API...', 'API');
            logToConsole('Fetching target profile data...', 'API');
        }
    }, [isAnalyzing]);

    // Listen for console errors
    useEffect(() => {
        const originalConsoleError = console.error;
        console.error = (...args) => {
            originalConsoleError.apply(console, args);
            if (args[0]?.includes('Please enter a valid Instagram username')) {
                logToConsole('ERROR: Please enter a valid Instagram username', 'ERROR');
            }
        };
        return () => {
            console.error = originalConsoleError;
        };
    }, []);

    const logToConsole = (message, type = 'INFO') => {
        const newLog = { type, message };
        setLogs(prev => [...prev, newLog]);
        setVisibleLogs(prev => [...prev, newLog]);
        if (onLog) {
            onLog(newLog);
        }
    };

    const handleSuccess = () => {
        logToConsole('Profile analysis completed successfully!', 'SUCCESS');
    };

    const getStatusColor = (type) => {
        switch (type) {
            case 'SYS':
                return '#00ff00' // Matrix green
            case 'ERROR':
                return '#ff0000' // Red
            case 'CONN':
                return '#00ffff' // Cyan
            case 'API':
                return '#00ff00' // Magenta
            case 'ANALYZE':
                return '#00ff00' // Yellow
            case 'ALGO':
                return '#ff8800' // Orange
            case 'SUCCESS':
                return '#00ff00' // Green for success
            default:
                return '#00ff00' // Default to Matrix green
        }
    }

    return (
        <div className="panel output-panel">
            <h2>Operation Console</h2>
            <div className="console" ref={consoleRef}>
                {visibleLogs.map((log, index) => (
                    <div key={index} className="terminal-line" style={{ color: getStatusColor(log.type) }}>
                        [{log.type}] &gt; {log.message}
                    </div>
                ))}
            </div>
            {isAnalyzing && (
                <div className="progress-container">
                    <div className="progress-bar" style={{ 
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, #00ff00 0%,#49dd05 50%,#3dee07 100%)',
                        boxShadow: '0 0 10pxhsl(120, 100.00%, 50.00%)',
                        transition: 'width 0.3s ease-in-out'
                    }}></div>
                </div>
            )}
            <div className="status-bar">
                <span>Status: <span id="status">{isAnalyzing ? 'Processing' : 'Idle'}</span></span>
                <span>DB: <span className="blink"> ● </span>Connected</span>
            </div>
        </div>
    );
};

export default Console 