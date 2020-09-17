export default function Envelope(
  min,
  max,
  attack,
  decay,
  sustain,
  release,
  param
) {
  this.min = min; //
  this.max = max;
  this.attack = attack;
  this.releaseTimeConstant = release;
  this.sustain = sustain;
  this.decay = decay;
  this.param = param;
}

Envelope.prototype.trigger = function (time) {
  this.attackTime = time + this.attack; //reach attach val at attackTime
  this.decayTime = time + this.attack + this.decay; //reach decay val at decayTime
  this.sustainTime = time + this.attack + this.decay + this.sustain;
  this.rt = time + this.attack + this.decay + this.sustain + this.release;

  this.param.linearRampToValueAtTime(this.max, this.attackTime);
  this.param.linearRampToValueAtTime(this.max * 0.5, this.decayTime);
  this.param.linearRampToValueAtTime(0, this.rt);
};

Envelope.prototype.release = function (time) {
  this.param.exponentialRampToValueAtTime(0, time + this.release);
};
