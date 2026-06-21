import { useState } from 'react';

interface TrophyAnimationProps {
    goalTitle?: string | null;
    isOpen: boolean;
    onClose: () => void;
}

const DigitalTrophyReward = ({ goalTitle, isOpen, onClose }: TrophyAnimationProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-3 h-3 rounded-sm animate-confetti"
                        style={{
                            top: `${Math.random() * 40 + 20}%`,
                            left: `${Math.random() * 60 + 20}%`,
                            backgroundColor: ['#fbbf24', '#f59e0b', '#3b82f6', '#ef4444', '#10b981'][i % 5],
                            animationDelay: `${Math.random() * 0.5}s`,
                            transform: `rotate(${Math.random() * 360}deg)`
                        }}
                    />
                ))}
            </div>

            <div className="relative max-w-sm w-full mx-4 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center shadow-2xl shadow-amber-500/10 scale-90 animate-pop-up">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15)_0%,transparent_60%)] rounded-3xl pointer-events-none" />

                <div className="relative flex justify-center mb-6">
                    <div className="absolute w-24 h-24 bg-amber-500/30 rounded-full blur-xl animate-pulse" />
                    <span className="text-8xl select-none filter drop-shadow-[0_10px_10px_rgba(245,158,11,0.3)] animate-float">
                        🏆
                    </span>
                </div>

                <h3 className="text-xs font-black tracking-widest text-amber-500 uppercase mb-2 animate-slide-up">
                    Milestone Unlocked
                </h3>
                <h2 className="text-2xl font-black text-white mb-3 animate-slide-up [animation-delay:100s]">
                    {goalTitle || "Goal Crusher!"}
                </h2>
                <p className="text-slate-400 text-sm mb-8 px-4 animate-slide-up [animation-delay:200s]">
                    You've reached your goal target. Consistency wins every time – your AI is impressed!
                </p>

                <div className="flex flex-col gap-2 animate-slide-up [animation-delay:300s]">
                    <button
                        onClick={() => {
                            alert('Shared achievement!');
                        }}
                        className="w-full py-3 font-bold text-slate-950 bg-linear-to-r from-amber-400 to-yellow-500 rounded-xl hover:opacity-90 active:scale-[0.99] transition-transform shadow-md"
                    >
                        Share Achievement 🚀
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 font-medium text-slate-400 hover:text-white transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DigitalTrophyReward;