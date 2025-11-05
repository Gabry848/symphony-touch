class AudioVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.bufferLength = 0;
        this.animationId = null;
        this.isActive = false;
        this.visualizationMode = 'bars'; // bars, circular, wave

        this.setupCanvas();
    }

    setupCanvas() {
        // Set canvas size
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        // Handle window resize
        window.addEventListener('resize', () => {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
        });
    }

    initialize(howlerSound) {
        if (!howlerSound) return;

        try {
            // Get the Howler.js audio context
            const HowlerContext = Howler.Howler.ctx;

            if (!HowlerContext) {
                console.error('Audio context not available');
                return;
            }

            this.audioContext = HowlerContext;

            // Create analyser node
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);

            // Connect to Howler's master gain
            const masterGain = Howler.Howler.masterGain;
            if (masterGain) {
                // Disconnect and reconnect to insert our analyser
                masterGain.disconnect();
                masterGain.connect(this.analyser);
                this.analyser.connect(this.audioContext.destination);
            }

            this.isActive = true;
            this.draw();
        } catch (error) {
            console.error('Error initializing visualizer:', error);
        }
    }

    draw() {
        if (!this.isActive || !this.analyser) return;

        this.animationId = requestAnimationFrame(this.draw.bind(this));

        this.analyser.getByteFrequencyData(this.dataArray);

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw based on selected mode
        switch (this.visualizationMode) {
            case 'bars':
                this.drawBars();
                break;
            case 'circular':
                this.drawCircular();
                break;
            case 'wave':
                this.drawWave();
                break;
        }
    }

    drawBars() {
        const barWidth = (this.canvas.width / this.bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < this.bufferLength; i++) {
            barHeight = (this.dataArray[i] / 255) * this.canvas.height * 0.8;

            // Create gradient
            const gradient = this.ctx.createLinearGradient(0, this.canvas.height, 0, this.canvas.height - barHeight);
            gradient.addColorStop(0, '#8a2be2');
            gradient.addColorStop(0.5, '#da70d6');
            gradient.addColorStop(1, '#ff00ff');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);

            // Add glow effect
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#8a2be2';

            x += barWidth + 1;
        }

        this.ctx.shadowBlur = 0;
    }

    drawCircular() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.6;

        for (let i = 0; i < this.bufferLength; i++) {
            const angle = (i / this.bufferLength) * Math.PI * 2;
            const amplitude = (this.dataArray[i] / 255) * radius * 0.5;

            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + amplitude);
            const y2 = centerY + Math.sin(angle) * (radius + amplitude);

            // Create gradient for each line
            const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(0, 'rgba(138, 43, 226, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 0, 255, 0.8)');

            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }

        // Draw center circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(138, 43, 226, 0.3)';
        this.ctx.fill();
        this.ctx.strokeStyle = '#da70d6';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    }

    drawWave() {
        this.analyser.getByteTimeDomainData(this.dataArray);

        const sliceWidth = this.canvas.width / this.bufferLength;
        let x = 0;

        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = '#8a2be2';
        this.ctx.beginPath();

        for (let i = 0; i < this.bufferLength; i++) {
            const v = this.dataArray[i] / 128.0;
            const y = (v * this.canvas.height) / 2;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
        this.ctx.stroke();

        // Add glow
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#da70d6';
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    setMode(mode) {
        if (['bars', 'circular', 'wave'].includes(mode)) {
            this.visualizationMode = mode;
        }
    }

    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    resume() {
        if (!this.isActive && this.analyser) {
            this.isActive = true;
            this.draw();
        }
    }
}

module.exports = AudioVisualizer;
