let refreshRate = 60;
let isAnimating = true;
let currentSpeed = 1;
let animationFrameId;
let frameTimeHistory = [];
let motionType = 'sine'; // 'sine' or 'circular'
const MAX_SAMPLES = 120;
const FRAME_HISTORY_SIZE = 60;

// Performance metrics
let frameConsistencyScore = 0;
let animationSmoothnessScore = 0;
let inputLatencyScore = 0;
let frameTimingScore = 0;

async function detectRefreshRate() {
    const methods = [
        detectUsingScreen,
        detectUsingFrameTiming,
        detectUsingRequestAnimationFrame
    ];

    for (const method of methods) {
        const rate = await method();
        if (rate && rate > 0) {
            refreshRate = rate;
            updateDisplays();
            break;
        }
    }
}

async function detectUsingScreen() {
    if (window.screen && window.screen.refresh) {
        return window.screen.refresh;
    }
    return null;
}

async function detectUsingFrameTiming() {
    return new Promise(resolve => {
        if (window.performance && window.performance.now) {
            const samples = [];
            let lastTime = performance.now();
            let frame = 0;

            function sample() {
                const now = performance.now();
                const delta = now - lastTime;
                if (delta > 2) {
                    samples.push(delta);
                }
                lastTime = now;
                frame++;

                if (frame < 60) {
                    requestAnimationFrame(sample);
                } else {
                    const sortedSamples = samples.sort((a, b) => a - b);
                    const medianTime = sortedSamples[Math.floor(sortedSamples.length / 2)];
                    const rate = Math.round(1000 / medianTime);
                    resolve(rate);
                }
            }
            requestAnimationFrame(sample);
        } else {
            resolve(null);
        }
    });
}

async function detectUsingRequestAnimationFrame() {
    return new Promise(resolve => {
        const timestamps = [];
        let lastTimestamp = performance.now();

        function measure(timestamp) {
            const deltaTime = timestamp - lastTimestamp;
            if (deltaTime > 2) {
                timestamps.push(deltaTime);
            }
            lastTimestamp = timestamp;

            if (timestamps.length < MAX_SAMPLES) {
                requestAnimationFrame(measure);
            } else {
                const frameTimeCounts = {};
                let maxCount = 0;
                let modeFrameTime = 0;

                timestamps.forEach(time => {
                    const roundedTime = Math.round(time * 10) / 10;
                    frameTimeCounts[roundedTime] = (frameTimeCounts[roundedTime] || 0) + 1;
                    if (frameTimeCounts[roundedTime] > maxCount) {
                        maxCount = frameTimeCounts[roundedTime];
                        modeFrameTime = roundedTime;
                    }
                });

                const rate = Math.round(1000 / modeFrameTime);
                resolve(rate);
            }
        }
        requestAnimationFrame(measure);
    });
}

function updateDisplays() {
    const frameTime = 1000 / refreshRate;
    
    // Update main metrics
    document.getElementById('refreshRate').textContent = `${refreshRate}Hz`;
    document.getElementById('frameTimeInfo').textContent = `${frameTime.toFixed(2)}ms`;
    document.getElementById('frameConsistency').textContent = `${frameConsistencyScore.toFixed(1)}%`;
    
    // Update performance metrics
    document.getElementById('inputLatency').textContent = `${inputLatencyScore.toFixed(1)}ms`;
    document.getElementById('animationSmoothness').textContent = `${animationSmoothnessScore.toFixed(1)}%`;
    document.getElementById('frameTimingScore').textContent = `${frameTimingScore.toFixed(1)}%`;

    // Update quality indicators
    updateQualityIndicator('refreshRateQuality', refreshRate);
    updateQualityIndicator('frameTimeQuality', frameTime, true);
    updateQualityIndicator('consistencyQuality', frameConsistencyScore);
}

function updateQualityIndicator(elementId, value, lowerIsBetter = false) {
    const element = document.getElementById(elementId);
    let quality;
    let text;

    if (lowerIsBetter) {
        if (value <= 7) quality = 'excellent';
        else if (value <= 12) quality = 'good';
        else quality = 'poor';
    } else {
        if (value >= 120) quality = 'excellent';
        else if (value >= 60) quality = 'good';
        else quality = 'poor';
    }

    element.className = `quality-indicator quality-${quality}`;
    element.textContent = quality.charAt(0).toUpperCase() + quality.slice(1);
}

function calculatePerformanceMetrics(timestamp) {
    // Update frame time history
    if (frameTimeHistory.length >= FRAME_HISTORY_SIZE) {
        frameTimeHistory.shift();
    }
    frameTimeHistory.push(timestamp);

    if (frameTimeHistory.length > 1) {
        // Calculate frame consistency
        const frameTimes = [];
        for (let i = 1; i < frameTimeHistory.length; i++) {
            frameTimes.push(frameTimeHistory[i] - frameTimeHistory[i - 1]);
        }
        const avgFrameTime = frameTimes.reduce((a, b) => a + b) / frameTimes.length;
        const variance = frameTimes.reduce((a, b) => a + Math.pow(b - avgFrameTime, 2), 0) / frameTimes.length;
        frameConsistencyScore = 100 * (1 - Math.min(1, Math.sqrt(variance) / avgFrameTime));

        // Calculate animation smoothness
        const targetFrameTime = 1000 / refreshRate;
        const frameTimeDeviation = frameTimes.reduce((acc, time) => 
            acc + Math.abs(time - targetFrameTime), 0) / frameTimes.length;
        animationSmoothnessScore = 100 * (1 - Math.min(1, frameTimeDeviation / targetFrameTime));

        // Simulate input latency (based on frame time stability)
        inputLatencyScore = avgFrameTime / 2;

        // Calculate frame timing score
        const goodFrames = frameTimes.filter(time => Math.abs(time - targetFrameTime) < 2).length;
        frameTimingScore = (goodFrames / frameTimes.length) * 100;

        updateDisplays();
    }
}

function getAnimationPosition(timestamp, isSmooth) {
    const speed = currentSpeed * (isSmooth ? (refreshRate / 60) : 1);
    const time = timestamp * 0.002 * speed;

    if (motionType === 'circular') {
        return {
            x: Math.cos(time) * 70,
            y: Math.sin(time) * 70
        };
    } else {
        return {
            x: 0,
            y: Math.sin(time) * 70
        };
    }
}

function animate(timestamp) {
    if (!isAnimating) return;

    calculatePerformanceMetrics(timestamp);

    // Standard animation
    const standardPos = getAnimationPosition(timestamp, false);
    document.getElementById('standardBox').style.transform = 
        `translate(${standardPos.x}px, ${standardPos.y}px)`;

    // Smooth animation
    const smoothPos = getAnimationPosition(timestamp, true);
    document.getElementById('smoothBox').style.transform = 
        `translate(${smoothPos.x}px, ${smoothPos.y}px)`;

    animationFrameId = requestAnimationFrame(animate);
}

function toggleAnimation() {
    isAnimating = !isAnimating;
    const toggleBtn = document.getElementById('toggleBtn');
    toggleBtn.textContent = isAnimating ? 'Pause Animation' : 'Start Animation';
    
    if (isAnimating) {
        frameTimeHistory = [];
        animate(performance.now());
    } else {
        cancelAnimationFrame(animationFrameId);
    }
}

function switchSpeed() {
    currentSpeed = currentSpeed === 1 ? 3 : 1;
    const speedBtn = document.getElementById('speedBtn');
    speedBtn.textContent = currentSpeed === 1 ? 'Increase Speed' : 'Decrease Speed';
}

function toggleMotionType() {
    motionType = motionType === 'sine' ? 'circular' : 'sine';
    const motionBtn = document.getElementById('motionBtn');
    motionBtn.textContent = motionType === 'sine' ? 'Switch to Circular' : 'Switch to Sine';
}

// Initialize
detectRefreshRate().then(() => {
    animate(performance.now());
});
