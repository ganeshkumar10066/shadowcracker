import React, { useEffect, useRef } from 'react';

const MatrixBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas dimensions
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Characters to display
        const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        const fontSize = 14;
        const columns = canvas.width / fontSize;

        // Array to track the y position of each column
        const drops = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.floor(Math.random() * canvas.height / fontSize) * -1;
        }

        function drawMatrix() {
            // Semi-transparent black to create fade effect
            ctx.fillStyle = 'rgba(12, 12, 20, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#11ff00';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                // Random character
                const char = characters.charAt(Math.floor(Math.random() * characters.length));

                // Draw the character
                ctx.fillText(char, i * fontSize, drops[i] * fontSize);

                // Move the drop down
                drops[i]++;

                // Reset if off the screen
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) {
                    drops[i] = Math.random() * -20;
                }
            }

            requestAnimationFrame(drawMatrix);
        }

        drawMatrix();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return <canvas ref={canvasRef} className="matrix-bg" />;
};

export default MatrixBackground; 