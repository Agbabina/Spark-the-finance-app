interface SparkLightningProps {
    compact?: boolean;
    className?: string;
}

export default function SparkLightning({ compact = false, className = "" }: SparkLightningProps) {
    const containerClass = compact ? "spark-lightning spark-lightning--compact" : "spark-lightning";
    const textClass = compact ? "spark-lightning__text spark-lightning__text--compact" : "spark-lightning__text";
    const svgViewBox = compact ? "0 0 320 100" : "0 0 500 150";

    return (
        <div className={`${containerClass} ${className}`}>
            <div className="spark-lightning__canvas absolute inset-0 overflow-hidden pointer-events-none">
                <svg viewBox={svgViewBox} className="spark-lightning__svg" preserveAspectRatio="none">
                    <path
                        d="M72 22 L92 52 L82 67 L102 95 L88 115"
                        className="spark-lightning__bolt spark-lightning__bolt--delay0"
                    />
                    <path
                        d="M155 18 L140 50 L160 76 L145 105"
                        className="spark-lightning__bolt spark-lightning__bolt--delay1"
                    />
                    <path
                        d="M235 30 L220 65 L240 90 L225 118"
                        className="spark-lightning__bolt spark-lightning__bolt--delay2"
                    />
                </svg>
            </div>

            <span className={textClass}>Spark</span>
        </div>
    );
}
