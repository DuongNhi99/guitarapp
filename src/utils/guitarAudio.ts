export function pluck(freq: number, ctx: AudioContext, vol = 0.75, when = 0): AudioBufferSourceNode {
  const sr = ctx.sampleRate;
  const p = Math.round(sr / freq);
  const n = Math.ceil(2.5 * sr);

  const buf = ctx.createBuffer(1, n, sr);
  const d = buf.getChannelData(0);

  for (let i = 0; i < p; i++) d[i] = Math.random() * 2 - 1;
  for (let i = p; i < n; i++) {
    d[i] = 0.4975 * (d[i - p] + (i > p ? d[i - p - 1] : 0));
  }

  const src = ctx.createBufferSource();
  src.buffer = buf;

  const gain = ctx.createGain();
  gain.gain.value = vol;
  src.connect(gain);
  gain.connect(ctx.destination);
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
      m += buf[i] * buf[i] + buf[i + lag] * buf[i + lag];
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
