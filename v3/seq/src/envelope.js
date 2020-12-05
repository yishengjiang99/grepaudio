"use strict";
exports.__esModule = true;
exports.envelope = void 0;
function envelope(attribute, adrs, opts) {
    var attack = adrs[0], decay = adrs[1], release = adrs[2], sustain = adrs[3];
    var maxVolume = opts.maxVolume || 3;
    var _a = opts || {}, onRelease = _a.onRelease, duration = _a.duration;
    var ctx = new AudioContext();
    return {
        triggerAttack: function () {
            attribute.linearRampToValueAtTime(maxVolume, ctx.currentTime + attack);
            attribute.linearRampToValueAtTime(maxVolume * sustain, ctx.currentTime + attack + decay);
        },
        triggerRelease: function () {
            attribute.linearRampToValueAtTime(0, ctx.currentTime + release);
            onRelease && setTimeout(onRelease, release);
        },
        triggerAttackRelease: function () {
            attribute.linearRampToValueAtTime(maxVolume, ctx.currentTime + attack);
            attribute.linearRampToValueAtTime(maxVolume * sustain, ctx.currentTime + attack + decay);
            setTimeout(function () {
                attribute.linearRampToValueAtTime(0, ctx.currentTime + release);
                onRelease && setTimeout(onRelease, release);
            }, duration * 1000 - attack - decay - release);
        }
    };
}
exports.envelope = envelope;
