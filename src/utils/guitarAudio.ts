export type GuitarType = "classic" | "steel" | "electric";

export const GUITAR_TYPES: Record<GuitarType, {
  label: string;
  description: string;
  /** Karplus-Strong feedback coefficient — closer to 0.5 = more sustain */
  blend: number;
  /** Low-pass cutoff Hz; 0 = skip filter */
  lpCutoff: number;
  /** High-shelf gain dB applied after KS */
  hfGain: number;
  /** Delay between strings in a strum (seconds) */
  strumDelay: number;
  /** Overall output scale */
  volScale: number;
}> = {
  classic: {
    label: "Classic",
    description: "Nylon ấm",
    blend: 0.4975,
    lpCutoff: 3500,
    hfGain: -3,
    strumDelay: 0.014,
    volScale: 1.0,
  },
  steel: {
    label: "Steel",
    description: "Thép sáng",
    blend: 0.4982,
    lpCutoff: 0,
    hfGain: 5,
    strumDelay: 0.011,
    volScale: 1.1,
  },
  electric: {
    label: "Electric",
    description: "Điện sắc nét",
    blend: 0.4992,
    lpCutoff: 0,
    hfGain: 2,
    strumDelay: 0.009,
    volScale: 1.15,
  },
};

export function pluck(
  freq: number,
  ctx: AudioContext,
  vol = 0.75,
  when = 0,
  type: GuitarType = "classic",
): AudioBufferSourceNode {
  const cfg = GUITAR_TYPES[type];
  const sr  = ctx.sampleRate;
  const p   = Math.round(sr / freq);
  const n   = Math.ceil(2.5 * sr);

  const buf = ctx.createBuffer(1, n, sr);
  const d   = buf.getChannelData(0);

  // Excitation signal — determines initial timbre / attack character
  if (type === "classic") {
    // Sine-windowed noise → soft, rounded nylon attack
    for (let i = 0; i < p; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.sin((i / p) * Math.PI);
    }
  } else if (type === "steel") {
    // Hard flat noise burst → percussive steel attack
    for (let i = 0; i < p; i++) {
      d[i] = Math.random() * 2 - 1;
    }
  } else {
    // Electric: blend noise with a triangular wave for extra harmonic content
    for (let i = 0; i < p; i++) {
      const phase = (i / p) * 4;
      const tri   = 1 - Math.abs((phase % 2) - 1);
      d[i] = (Math.random() * 2 - 1) * 0.65 + (tri * 2 - 1) * 0.35;
    }
  }

  // Karplus-Strong averaging feedback
  for (let i = p; i < n; i++) {
    d[i] = cfg.blend * (d[i - p] + (i > p ? d[i - p - 1] : 0));
  }

  const src  = ctx.createBufferSource();
  src.buffer = buf;

  const gain = ctx.createGain();
  gain.gain.value = vol * cfg.volScale;
  gain.connect(ctx.destination);

  // Build signal chain tail → head, then connect src at the front
  let chain: AudioNode = gain;

  if (type === "electric") {
    // Soft-clip waveshaper for a subtle electric edge
    const ws    = ctx.createWaveShaper();
    const k     = 60;
    const curve = new Float32Array(257);
    for (let i = 0; i < 257; i++) {
      const x  = (i * 2) / 256 - 1;
      curve[i] = ((Math.PI + k) * x) / (Math.PI + k * Math.abs(x));
    }
    ws.curve = curve;
    ws.connect(chain);
    chain = ws;
  }

  if (cfg.hfGain !== 0) {
    const hs          = ctx.createBiquadFilter();
    hs.type           = "highshelf";
    hs.frequency.value = 2000;
    hs.gain.value     = cfg.hfGain;
    hs.connect(chain);
    chain = hs;
  }

  if (cfg.lpCutoff > 0) {
    const lp          = ctx.createBiquadFilter();
    lp.type           = "lowpass";
    lp.frequency.value = cfg.lpCutoff;
    lp.Q.value        = 0.5;
    lp.connect(chain);
    chain = lp;
  }

  src.connect(chain);
  src.start(when);
  return src;
}

export function autoCorrelate(buf: Float32Array<ArrayBuffer>, sampleRate: number): number {
  const n = buf.length;

  let sumSq = 0;
  for (let i = 0; i < n; i++) sumSq += buf[i] * buf[i];
  if (Math.sqrt(sumSq / n) < 0.012) return -1;

  const minLag = Math.floor(sampleRate / 700);
  const maxLag = Math.floor(sampleRate / 60);

  const nsdf = new Float32Array(maxLag + 1);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let ac = 0, m = 0;
    const len = n - lag;
    for (let i = 0; i < len; i++) {
      ac += buf[i] * buf[i + lag];
      m  += buf[i] * buf[i] + buf[i + lag] * buf[i + lag];
    }
    nsdf[lag] = m > 1e-8 ? (2 * ac) / m : 0;
  }

  let d = minLag;
  while (d < maxLag && nsdf[d] > 0) d++;
  while (d < maxLag && nsdf[d] < 0) d++;

  let bestVal = 0, bestLag = -1;
  for (let lag = d; lag <= maxLag; lag++) {
    if (nsdf[lag] > bestVal) { bestVal = nsdf[lag]; bestLag = lag; }
  }

  if (bestLag < 0 || bestVal < 0.4) return -1;

  if (bestLag > minLag && bestLag < maxLag) {
    const c0 = nsdf[bestLag - 1], c1 = nsdf[bestLag], c2 = nsdf[bestLag + 1];
    const denom = 2 * c1 - c2 - c0;
    if (denom !== 0) return sampleRate / (bestLag + (c2 - c0) / (2 * denom));
  }
  return sampleRate / bestLag;
}
