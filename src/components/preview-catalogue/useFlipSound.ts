import { useCallback, useEffect, useRef } from "react";

/**
 * Bruit de page synthétisé à la volée.
 *
 * Un vrai tournage de page n'est pas un souffle : c'est de l'air grave, une
 * vibration irrégulière des fibres, puis la feuille qui se pose. Trois couches
 * donc, et surtout pas de bruit blanc — au-delà de 4 kHz on n'entend qu'un
 * « tss » métallique.
 *
 * Synthèse plutôt que fichier : rien à héberger, et chaque page sonne
 * légèrement différemment.
 */

/** Bruit brun : bruit blanc intégré, spectre en 1/f² — le grave du papier. */
function brownNoise(ctx: BaseAudioContext, frames: number) {
  const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < frames; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.045 * white) / 1.045;
    d[i] = last * 3.2;
  }
  return buf;
}

/**
 * Bruit « fibre » : bruit rose granulé par une enveloppe aléatoire lente.
 * C'est cette irrégularité qui fait entendre du papier plutôt qu'un souffle.
 */
function fibreNoise(ctx: BaseAudioContext, frames: number) {
  const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let b0 = 0,
    b1 = 0,
    b2 = 0;
  let grain = 0;
  let grainLen = 0;
  let amp = 0;
  for (let i = 0; i < frames; i++) {
    // approximation de bruit rose (Paul Kellet)
    const w = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + w * 0.099046;
    b1 = 0.963 * b1 + w * 0.2965164;
    b2 = 0.57555 * b2 + w * 1.0526913;
    const pink = (b0 + b1 + b2 + w * 0.1848) * 0.22;

    // grains de 3 à 14 ms, amplitude aléatoire : le froissement
    if (grain <= 0) {
      grainLen = Math.floor(ctx.sampleRate * (0.003 + Math.random() * 0.011));
      grain = grainLen;
      amp = 0.35 + Math.random() * 0.65;
    }
    const g = grain / grainLen;
    d[i] = pink * amp * Math.sin(Math.PI * (1 - g));
    grain--;
  }
  return buf;
}

/**
 * Enregistrements réels, s'ils sont présents dans public/sounds/.
 * Un vrai échantillon sonne toujours mieux qu'une synthèse : dès qu'un fichier
 * est déposé là, il est utilisé et la synthèse ne sert plus que de repli.
 * Plusieurs variantes évitent l'effet « même bruit à chaque page ».
 *
 * Seul le fichier réellement présent est listé : référencer un fichier absent
 * ne casse rien (la synthèse prend le relais) mais pollue la console de 404.
 * Pour ajouter une variante, déposez le fichier puis ajoutez son URL ici.
 */
const SAMPLES = [
  "/sounds/page-flip-1.ogg",
];

type Clip = { buffer: AudioBuffer; offset: number; duration: number };

/**
 * Recadrage automatique : on cherche l'attaque et la fin utile du son.
 * Les enregistrements libres contiennent souvent une seconde de silence ;
 * sans cela, la page se tourne bien avant qu'on entende quoi que ce soit.
 */
function trim(buffer: AudioBuffer): Clip {
  const d = buffer.getChannelData(0);
  const sr = buffer.sampleRate;
  const win = Math.max(1, Math.floor(sr * 0.005)); // fenêtres de 5 ms

  let peak = 0;
  const env: number[] = [];
  for (let i = 0; i < d.length; i += win) {
    let m = 0;
    for (let j = i; j < Math.min(i + win, d.length); j++) {
      const v = Math.abs(d[j]);
      if (v > m) m = v;
    }
    env.push(m);
    if (m > peak) peak = m;
  }
  if (peak < 0.01) return { buffer, offset: 0, duration: buffer.duration };

  const onThresh = peak * 0.12;
  const offThresh = peak * 0.04;

  let a = env.findIndex((v) => v >= onThresh);
  if (a < 0) a = 0;
  let b = a;
  for (let i = a; i < env.length; i++) if (env[i] >= offThresh) b = i;

  // une pincée d'air avant l'attaque, un peu de queue après
  const start = Math.max(0, (a * win) / sr - 0.012);
  const end = Math.min(buffer.duration, ((b + 1) * win) / sr + 0.06);
  const duration = Math.max(0.12, Math.min(0.9, end - start));
  return { buffer, offset: start, duration };
}

export function useFlipSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const busRef = useRef<GainNode | null>(null);
  const clipsRef = useRef<Clip[]>([]);

  // Le contexte audio ne peut naître que d'un geste utilisateur.
  useEffect(() => {
    if (!enabled) return;
    const unlock = () => {
      if (!ctxRef.current) {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;
        const ctx = new Ctor();
        // Bus de sortie : un peu de corps, et on coupe l'aigu sifflant.
        const bus = ctx.createGain();
        bus.gain.value = 0.9;
        const tame = ctx.createBiquadFilter();
        tame.type = "lowpass";
        tame.frequency.value = 4200;
        tame.Q.value = 0.5;
        bus.connect(tame);
        tame.connect(ctx.destination);
        ctxRef.current = ctx;
        busRef.current = bus;

        // Chargement optionnel des échantillons : absents, on ne dit rien.
        void Promise.all(
          SAMPLES.map(async (url) => {
            try {
              const res = await fetch(url);
              if (!res.ok) return null;
              return await ctx.decodeAudioData(await res.arrayBuffer());
            } catch {
              return null;
            }
          }),
        ).then((bufs) => {
          clipsRef.current = bufs.filter((b): b is AudioBuffer => !!b).map(trim);
        });
      }
      ctxRef.current?.resume();
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [enabled]);

  return useCallback(() => {
    if (!enabled) return;
    const ctx = ctxRef.current;
    const bus = busRef.current;
    if (!ctx || !bus || ctx.state !== "running") return;

    const now = ctx.currentTime;
    const rate = 0.92 + Math.random() * 0.18; // légère variation d'une page à l'autre

    // Un échantillon réel est disponible : on le joue, la synthèse s'efface.
    const pool = clipsRef.current;
    if (pool.length) {
      const clip = pool[Math.floor(Math.random() * pool.length)];
      const src = ctx.createBufferSource();
      src.buffer = clip.buffer;
      src.playbackRate.value = rate;
      const g = ctx.createGain();
      // fondus très courts : évite le clic au point de coupe
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.9, now + 0.008);
      const end = now + clip.duration / rate;
      g.gain.setValueAtTime(0.9, end - 0.04);
      g.gain.linearRampToValueAtTime(0.0001, end);
      src.connect(g).connect(bus);
      src.start(now, clip.offset, clip.duration);
      return;
    }

    /* ── 1. l'air déplacé : grave, long, doux ───────────────── */
    const airDur = 0.42 * rate;
    const air = ctx.createBufferSource();
    air.buffer = brownNoise(ctx, Math.floor(ctx.sampleRate * airDur));
    const airLp = ctx.createBiquadFilter();
    airLp.type = "lowpass";
    airLp.frequency.setValueAtTime(1500, now);
    airLp.frequency.exponentialRampToValueAtTime(260, now + airDur);
    airLp.Q.value = 0.8;
    const airGain = ctx.createGain();
    airGain.gain.setValueAtTime(0.0001, now);
    airGain.gain.exponentialRampToValueAtTime(0.5, now + 0.07 * rate);
    airGain.gain.exponentialRampToValueAtTime(0.0001, now + airDur);
    air.connect(airLp).connect(airGain).connect(bus);
    air.start(now);
    air.stop(now + airDur);

    /* ── 2. les fibres : froissement irrégulier ─────────────── */
    const fibDur = 0.34 * rate;
    const fib = ctx.createBufferSource();
    fib.buffer = fibreNoise(ctx, Math.floor(ctx.sampleRate * fibDur));
    const fibBp = ctx.createBiquadFilter();
    fibBp.type = "bandpass";
    fibBp.Q.value = 0.55;
    fibBp.frequency.setValueAtTime(1900, now);
    fibBp.frequency.exponentialRampToValueAtTime(620, now + fibDur);
    const fibGain = ctx.createGain();
    fibGain.gain.setValueAtTime(0.0001, now);
    fibGain.gain.exponentialRampToValueAtTime(0.3, now + 0.05 * rate);
    fibGain.gain.exponentialRampToValueAtTime(0.0001, now + fibDur);
    fib.connect(fibBp).connect(fibGain).connect(bus);
    fib.start(now + 0.01);
    fib.stop(now + 0.01 + fibDur);

    /* ── 3. la feuille qui se pose : bref, mat ──────────────── */
    const tapAt = now + (0.24 + Math.random() * 0.05) * rate;
    const tapDur = 0.09;
    const tap = ctx.createBufferSource();
    tap.buffer = fibreNoise(ctx, Math.floor(ctx.sampleRate * tapDur));
    const tapLp = ctx.createBiquadFilter();
    tapLp.type = "lowpass";
    tapLp.frequency.value = 1100 + Math.random() * 400;
    const tapGain = ctx.createGain();
    tapGain.gain.setValueAtTime(0.0001, tapAt);
    tapGain.gain.exponentialRampToValueAtTime(0.26, tapAt + 0.012);
    tapGain.gain.exponentialRampToValueAtTime(0.0001, tapAt + tapDur);
    tap.connect(tapLp).connect(tapGain).connect(bus);
    tap.start(tapAt);
    tap.stop(tapAt + tapDur);
  }, [enabled]);
}
