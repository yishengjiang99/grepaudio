export function envelope(ctx, attribute, adrs, startTime = ctx.currentTime) {
    const [attack, decay, release, sustain] = adrs;
    attribute.setValueAtTime(0, startTime);
    attribute.linearRampToValueAtTime(3, startTime + attack);
    attribute.linearRampToValueAtTime(sustain, startTime + decay);
    attribute.exponentialRampToValueAtTime(1.5, startTime + release);
    attribute.linearRampToValueAtTime(0, startTime + startTime + 5 * release);
}
//# sourceMappingURL=envelope.js.map