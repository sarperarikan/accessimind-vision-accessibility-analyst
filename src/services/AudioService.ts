'use client';

export class AudioService {
    private static context: AudioContext | null = null;

    private static getContext() {
        if (!this.context) {
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            this.context = new AudioContextClass();
        }
        return this.context;
    }

    static async playProgressCue(stage: string) {
        const ctx = this.getContext();
        if (ctx.state === 'suspended') {
            await ctx.resume();
        }

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Different frequencies for different stages
        let frequency = 440; // Default A4
        switch (stage) {
            case 'preparing': frequency = 440; break;
            case 'uploading': frequency = 523.25; break; // C5
            case 'analyzing': frequency = 659.25; break; // E5
            case 'thinking': frequency = 783.99; break; // G5
            case 'reporting': frequency = 880; break; // A5
            case 'complete': frequency = 1046.50; break; // C6
        }

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.5);
    }
}
