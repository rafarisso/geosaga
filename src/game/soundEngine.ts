/**
 * Efeitos sonoros sintetizados via Web Audio (sem arquivos externos, funciona
 * offline). Cada som é um curto envelope de osciladores/ruído. O contexto é
 * criado de forma preguiçosa, após o primeiro gesto do usuário, para respeitar
 * as políticas de autoplay dos navegadores.
 */
export type SoundName =
  | 'attack'
  | 'hit'
  | 'defeatEnemy'
  | 'hurt'
  | 'special'
  | 'bossAppear'
  | 'bossHit'
  | 'victory'
  | 'gameover';

let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function setMuted(value: boolean): void {
  muted = value;
}

export function isMuted(): boolean {
  return muted;
}

function tone(
  ac: AudioContext,
  type: OscillatorType,
  from: number,
  to: number,
  duration: number,
  gain: number,
  delay = 0,
): void {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  const t0 = ac.currentTime + delay;
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + duration);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

function noise(ac: AudioContext, duration: number, gain: number): void {
  const frames = Math.floor(ac.sampleRate * duration);
  const buffer = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const src = ac.createBufferSource();
  const g = ac.createGain();
  g.gain.value = gain;
  src.buffer = buffer;
  src.connect(g).connect(ac.destination);
  src.start();
}

export function playSound(name: SoundName): void {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  switch (name) {
    case 'attack':
      tone(ac, 'triangle', 520, 880, 0.16, 0.16);
      break;
    case 'hit':
      tone(ac, 'square', 380, 220, 0.1, 0.12);
      break;
    case 'defeatEnemy':
      tone(ac, 'triangle', 600, 1040, 0.14, 0.18);
      tone(ac, 'sine', 900, 1500, 0.18, 0.12, 0.06);
      break;
    case 'hurt':
      tone(ac, 'sawtooth', 300, 90, 0.22, 0.18);
      noise(ac, 0.12, 0.06);
      break;
    case 'special':
      tone(ac, 'sine', 320, 720, 0.3, 0.2);
      tone(ac, 'triangle', 480, 1200, 0.34, 0.14, 0.05);
      break;
    case 'bossAppear':
      tone(ac, 'sawtooth', 160, 70, 0.5, 0.22);
      noise(ac, 0.4, 0.08);
      break;
    case 'bossHit':
      tone(ac, 'square', 260, 160, 0.16, 0.18);
      noise(ac, 0.1, 0.07);
      break;
    case 'victory':
      tone(ac, 'triangle', 523, 523, 0.18, 0.2);
      tone(ac, 'triangle', 659, 659, 0.18, 0.2, 0.16);
      tone(ac, 'triangle', 784, 784, 0.18, 0.2, 0.32);
      tone(ac, 'triangle', 1047, 1047, 0.3, 0.22, 0.48);
      break;
    case 'gameover':
      tone(ac, 'sawtooth', 400, 160, 0.3, 0.18);
      tone(ac, 'sawtooth', 300, 110, 0.4, 0.16, 0.18);
      break;
  }
}
