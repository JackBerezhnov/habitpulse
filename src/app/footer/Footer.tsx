import React from 'react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="footer footer-center p-6 bg-base-300 text-base-content">
            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-primary">⚡</span>
                    <span className="font-semibold">HabitPulse</span>
                </div>
                <p className="text-sm opacity-70">
                    Build better habits, level up your life
                </p>
                <p className="text-xs opacity-50">
                    © {currentYear} HabitPulse. Made with ❤️ for habit builders
                </p>
            </div>
        </footer>
    );
};

export default Footer;
