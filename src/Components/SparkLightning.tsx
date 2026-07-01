export default function SparkLightning() {
    return (
        <div className="spark-lightning relative inline-flex items-center justify-center">
            <div className="spark-lightning__canvas absolute inset-0 overflow-hidden pointer-events-none">
                <svg viewBox="0 0 500 150" className="spark-lightning__svg" preserveAspectRatio="none">
                    <path
                        d="M120 25 L140 60 L130 75 L150 110 L135 130"
                        className="spark-lightning__bolt spark-lightning__bolt--delay0"
                    />
                    <path
                        d="M245 20 L230 55 L250 85 L235 120"
                        className="spark-lightning__bolt spark-lightning__bolt--delay1"
                    />
                    <path
                        d="M360 35 L345 70 L365 95 L348 130"
                        className="spark-lightning__bolt spark-lightning__bolt--delay2"
                    />
                </svg>
            </div>

            <h1 className="spark-lightning__text">Spark</h1>
        </div>
    );
}
