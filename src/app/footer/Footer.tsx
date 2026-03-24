import React from 'react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="mt-auto pixel-panel p-4 text-center">
            <p className="text-[0.5rem] text-[#524c7d]">
                © {currentYear} HabitPulse. Made with ❤️ for habit builders by{' '}
                <span className="text-[#e6b636]">Jack Sighton</span> 🔥
            </p>
        </footer>
    );
};

export default Footer;
