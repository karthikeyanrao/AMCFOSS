import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e] px-4 text-center relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,255,136,0.10),transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(46,204,113,0.12),transparent_55%)]" />
                <div className="absolute -left-24 top-16 h-[30rem] w-[30rem] rounded-full bg-[#00ff88]/15 blur-3xl" />
                <div className="absolute -right-24 bottom-10 h-[26rem] w-[26rem] rounded-full bg-[#2ecc71]/20 blur-3xl" />
            </div>

            <div className="max-w-2xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                >
                    <motion.h1 
                        className="text-9xl font-bold mb-4 bg-gradient-to-r from-[#00ff88] via-[#2ecc71] to-[#27ae60] bg-clip-text text-transparent"
                        animate={{
                            textShadow: [
                                "0 0 20px rgba(0, 255, 136, 0.5)",
                                "0 0 40px rgba(0, 255, 136, 0.8)",
                                "0 0 20px rgba(0, 255, 136, 0.5)"
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        404
                    </motion.h1>
                    <h2 className="text-3xl font-bold text-white mb-6">
                        Page Not Found
                    </h2>
                    <p className="text-slate-300 mb-8 text-lg max-w-md mx-auto">
                        The page you're looking for doesn't exist or has been moved. Let's get you back to building with FOSS!
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 rounded-full border border-[#00ff88]/40 bg-[#00ff88]/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#00ff88] transition hover:border-[#00ff88]/60 hover:bg-[#00ff88]/20 hover:shadow-lg hover:shadow-[#00ff88]/30"
                    >
                        <i className="fas fa-home"></i>
                        Return Home
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default NotFound;
