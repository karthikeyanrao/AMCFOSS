import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Loader = ({ onLoadingComplete }) => {
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        // Simulate loading progress from 0% to 100%
        let interval;
        
        const startLoading = () => {
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setIsComplete(true);
                        // Wait a bit after reaching 100% before hiding
                        setTimeout(() => {
                            if (onLoadingComplete) {
                                onLoadingComplete();
                            }
                        }, 500);
                        return 100;
                    }
                    // Faster at the start, slower near the end for realistic feel
                    const increment = prev < 50 ? 2 : prev < 90 ? 1.5 : 0.5;
                    return Math.min(prev + increment, 100);
                });
            }, 30); // Update every 30ms
        };

        // Start loading after a small delay
        const timeout = setTimeout(startLoading, 100);

        return () => {
            clearTimeout(timeout);
            if (interval) clearInterval(interval);
        };
    }, [onLoadingComplete]);

    const logoUrl = "https://raw.githubusercontent.com/karthikeyanrao/AMCFOSS/main/images/amc-foss-logo.png";

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: isComplete ? 0 : 1 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#1a1a2e]"
            style={{ display: isComplete ? 'none' : 'flex' }}
        >
            {/* Background effects */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,136,0.15),transparent_70%)]" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Logo with pulse animation */}
                <motion.div
                    animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.9, 1, 0.9]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="mb-8"
                >
                    <motion.img
                        src={logoUrl}
                        alt="AMC FOSS Logo"
                        className="w-32 h-32 md:w-40 md:h-40 object-contain"
                        style={{
                            filter: 'drop-shadow(0 0 20px rgba(0, 255, 136, 0.6))'
                        }}
                        animate={{
                            filter: [
                                'drop-shadow(0 0 20px rgba(0, 255, 136, 0.6))',
                                'drop-shadow(0 0 30px rgba(0, 255, 136, 0.8))',
                                'drop-shadow(0 0 20px rgba(0, 255, 136, 0.6))'
                            ]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </motion.div>

                {/* Progress Bar */}
                <div className="w-64 md:w-80 h-1 bg-[#1a1a2e] border border-[#00ff88]/30 rounded-full overflow-hidden mb-4">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[#00ff88] to-[#2ecc71]"
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        style={{
                            boxShadow: '0 0 10px rgba(0, 255, 136, 0.6)'
                        }}
                    />
                </div>

                {/* Progress Percentage */}
                <motion.p
                    className="text-[#00ff88] font-mono text-sm md:text-base tracking-widest"
                    animate={{
                        opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity
                    }}
                >
                    {Math.round(progress)}%
                </motion.p>

                {/* Loading text */}
                <motion.p
                    className="mt-4 text-slate-400 text-xs uppercase tracking-[0.3em]"
                    animate={{
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity
                    }}
                >
                    Loading...
                </motion.p>
            </div>
        </motion.div>
    );
};

export default Loader;
