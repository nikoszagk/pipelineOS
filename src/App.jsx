import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ============ utils & motion ============ */
const cn = (...c) => c.filter(Boolean).join(" ");
const pageFade = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.45, ease: "easeOut" } } };
const headerStagger = { hidden: { opacity: 0, y: -8 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } } };
const gridStagger = { hidden: { opacity: 0, y: 10 }, show: (i=0)=>({ opacity:1,y:0,transition:{duration:.4,ease:"easeOut",delay:.05*i}}) };
const switchEnter = { opacity: 0, y: 14 }, switchCenter = { opacity: 1, y: 0 }, switchExit = { opacity: 0, y: -14 };

/* ============ ripple ============ */
function useRipple() {
  const [r, setR] = useState({ x: 0, y: 0, show: false });
  const ref = useRef(null);
  const upd = (e) => {
    const rect = ref.current?.getBoundingClientRect(); if (!rect) return;
    setR({ x: e.clientX - rect.left, y: e.clientY - rect.top, show: true });
  };
  return { ref, ripple: r, onEnter: upd, onMove: upd, onLeave: () => setR((s)=>({ ...s, show:false })) };
}
function RippleLayer({ ripple, rounded = "rounded-[36px]", disabled = false }) {
  return (
    <motion.span
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${rounded}`}
      style={{
        WebkitMaskImage: `radial-gradient(180px 180px at ${ripple.x}px ${ripple.y}px, black 20%, transparent 60%)`,
        maskImage: `radial-gradient(180px 180px at ${ripple.x}px ${ripple.y}px, black 20%, transparent 60%)`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: disabled ? 0 : ripple.show ? 0.25 : 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
    >
      <div className={`absolute inset-0 ${rounded} backdrop-blur-[6px]`} />
      <div
        className={`absolute inset-0 ${rounded} bg-[radial-gradient(120px_120px_at_var(--x)_var(--y),rgba(255,255,255,0.35),transparent_60%)]`}
        style={{ "--x": `${ripple.x}px`, "--y": `${ripple.y}px` }}
      />
    </motion.span>
  );
}

/* ============ glass ============ */
function GlassCard({ children, className = "", rippleDisabled = false, layoutId }) {
  const { ref, ripple, onEnter, onMove, onLeave } = useRipple();
  const Wrapper = layoutId ? motion.div : "div";
  return (
    <Wrapper
      {...(layoutId ? { layoutId, layout: true } : {})}
      ref={ref} onMouseEnter={onEnter} onMouseMove={onMove} onMouseLeave={onLeave}
      className={cn(
        "relative overflow-hidden",
        "rounded-[36px] bg-white/30 p-6 ring-1 ring-white/40",
        "backdrop-blur-3xl shadow-[0_12px_48px_rgba(31,38,135,0.35)] border border-white/30",
        "transition-all duration-300 hover:bg-white/40",
        className
      )}
    >
      <RippleLayer ripple={ripple} disabled={rippleDisabled} />
      <div className="relative z-10">{children}</div>
    </Wrapper>
  );
}
function InnerCard({ children, className = "", title, hint, offline = false }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] p-5",
        "bg-white/50 ring-1 ring-white/60 backdrop-blur-2xl",
        "shadow-[0_8px_28px_rgba(31,38,135,0.2)] transition",
        offline ? "saturate-[.7] grayscale-[.2] opacity-70" : "hover:bg-white/60",
        className
      )}
    >
      {(title || hint) && (
        <div className="mb-3 flex items-center justify-between">
          {title && <div className="text-xs font-semibold opacity-75">{title}</div>}
          {hint && <div className="text-[11px] opacity-60">{hint}</div>}
        </div>
      )}
      {offline && (
        <div className="pointer-events-none absolute right-3 top-3 z-20 rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-medium text-white/95">
          Offline
        </div>
      )}
      {children}
      {offline && <div className="pointer-events-none absolute inset-0 rounded-[28px] backdrop-brightness-95" />}
    </div>
  );
}

/* ============ Dynamic Island ============ */
function DynamicIsland({ np, wifi, btDeviceName, btBattery }) {
  const { ref, ripple, onEnter, onMove, onLeave } = useRipple();
  const isActive = np.isReady && (np.isPlaying || np.current > 0) && wifi;
  const pct = np.duration > 0 ? Math.min(100, Math.max(0, (np.current / np.duration) * 100)) : 0;
  const status = !wifi ? "Offline" : btDeviceName ? `BT • ${btDeviceName}${btBattery != null ? ` (${btBattery}%)` : ""}` : "Online • nickzagkanas.dev";
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-50 flex justify-center"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 6px)" }}
    >
      <motion.div
        ref={ref} onMouseEnter={onEnter} onMouseMove={onMove} onMouseLeave={onLeave}
        layout
        className="pointer-events-auto relative overflow-hidden flex items-center justify-center text-white shadow-2xl shadow-black/50 ring-1 ring-white/10 backdrop-blur-2xl scale-95 sm:scale-100 max-w-[92%]"
        initial={false}
        animate={{ borderRadius: isActive ? 24 : 28, backgroundColor: "rgba(0,0,0,0.8)", paddingLeft:16,paddingRight:16,paddingTop:8,paddingBottom:8 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        <RippleLayer ripple={ripple} rounded="rounded-[28px]" />
        <div className="relative z-10 flex items-center gap-3 min-w-0">
          <motion.span
            className="shrink-0 h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: wifi ? "#34d399" : "#f87171" }}
            animate={isActive ? { scale:[1,1.25,1], boxShadow:["0 0 0px #34d39955","0 0 10px #34d39988","0 0 0px #34d39955"] } : { scale:1, boxShadow:"0 0 0px transparent" }}
            transition={{ duration: 1.4, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
          />
          <AnimatePresence mode="wait" initial={false}>
            {isActive ? (
              <motion.div key="player" className="flex items-center gap-3 min-w-0" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.22 }}>
                <div className="h-6 w-6 overflow-hidden rounded-md ring-1 ring-white/20"><div className="h-full w-full bg-gradient-to-br from-indigo-400 to-fuchsia-400" /></div>
                <div className="min-w-0">
                  <div className="truncate text-[11px] font-medium leading-snug">Now Playing — {np.title || "Piano"}</div>
                  <div className="mt-1 h-1.5 w-28 rounded-full bg-white/20 overflow-hidden">
                    <motion.div className="h-1.5 rounded-full bg-white/70" style={{ width: `${pct}%` }} layout transition={{ type: "tween", duration: 0.2 }} />
                  </div>
                </div>
                <button onClick={np.toggle} className="ml-1 rounded-full p-1.5 ring-1 ring-white/20 hover:bg-white/10" title={np.isPlaying ? "Pause" : "Play"}>{np.isPlaying ? "⏸️" : "▶️"}</button>
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.22 }} className="text-xs opacity-80 text-center">
                {status}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

/* ============ toggles ============ */
function Toggle({ label, on, onChange }) {
  return (
    <button onClick={onChange} className={cn("group inline-flex items-center gap-3 rounded-[28px] px-3.5 py-3 ring-1 ring-black/5 backdrop-blur", on ? "bg-white/80" : "bg-white/30")} aria-pressed={on}>
      <span className={cn("h-7 w-12 rounded-full transition-colors relative", on ? "bg-emerald-400/90" : "bg-black/10")}>
        <span className="absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all" style={{ left: on ? "1.625rem" : "0.25rem" }} />
      </span>
      <span className="text-xs font-medium opacity-80">{label}</span>
    </button>
  );
}

/* ============ Now Playing ============ */
function NowPlaying({ np, online }) {
  const seekClick = (e) => {
    if (!online) return;
    const bar = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - bar.left) / bar.width;
    if (np.duration) {
      const t = Math.max(0, Math.min(np.duration, pct * np.duration));
      if (np.audioRef.current) np.audioRef.current.currentTime = t;
      np.setCurrent(t);
    }
  };
  const fmt = (s) => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`;
  const seekPercent = np.duration ? Math.min(100, Math.max(0, (np.current / np.duration) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 text-xs font-semibold opacity-75">{online ? "Now Playing" : "Now Playing — Offline"}</div>
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 overflow-hidden rounded-[18px] ring-1 ring-black/5"><div className="h-full w-full bg-gradient-to-br from-indigo-400 to-fuchsia-400" /></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate text-sm font-semibold">{np.title}</div>
            {!online && <span className="text-[10px] rounded-full bg-black/10 px-2 py-[2px]">music paused</span>}
          </div>
          <div className="truncate text-xs opacity-70">Nick • Solo Piano</div>
          <div className="mt-2">
            <div className={cn("relative h-2 w-full rounded-full", online ? "bg-black/10 cursor-pointer" : "bg-black/5 cursor-not-allowed")} onClick={seekClick}>
              <div className="absolute left-0 top-0 h-2 rounded-full bg-black/40" style={{ width: `${seekPercent}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-[10px] opacity-60">
              <span>{fmt(np.current)}</span><span>{fmt(np.duration)}</span>
            </div>
          </div>
        </div>
        <button
          onClick={np.toggle}
          disabled={!np.isReady || !online}
          className={cn("rounded-full p-2 ring-1 ring-black/5 hover:bg-black/5 disabled:opacity-50", !online && "cursor-not-allowed")}
          title={np.isPlaying ? "Pause" : "Play"}
        >
          {np.isPlaying ? "⏸️" : "▶️"}
        </button>
      </div>
      <p className="mt-3 text-sm opacity-80">{online ? "A calm piano theme to match the liquid-glass vibe." : "Offline — playback controls disabled."}</p>
    </div>
  );
}

/* ============ Activity Rings (RANDOM, Apple colors, smooth shuffle) ============ */
function ActivityRingsRandom() {
  const COLORS = { move: "#FF3B30", exercise: "#34C759", stand: "#00C7BE" };
  const seedFromDate = () => {
    const d = new Date();
    return Number(`${d.getFullYear()}${d.getMonth()+1}${d.getDate()}`);
  };
  const mulberry32 = (a) => () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const mkData = (seed) => {
    const rnd = mulberry32(seed);
    const goals = { move: 600, exercise: 30, stand: 12 };
    const val = (g) => Math.max(0, Math.round(g * (0.55 + rnd() * 0.6))); // 55–115%
    return {
      move: { value: val(goals.move), goal: goals.move },
      exercise: { value: val(goals.exercise), goal: goals.exercise },
      stand: { value: val(goals.stand), goal: goals.stand },
    };
  };
  const [seed, setSeed] = useState(seedFromDate());
  const data = mkData(seed);
  const pct = (v, g) => Math.max(0, Math.min(1, v / g));
  const p1 = pct(data.move.value, data.move.goal);
  const p2 = pct(data.exercise.value, data.exercise.goal);
  const p3 = pct(data.stand.value, data.stand.goal);
  const c = { outer: 46, mid: 32, inner: 18 };
  const CIRC = (r) => 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-4 sm:gap-6">
      <svg viewBox="0 0 120 120" className="h-20 w-20 sm:h-24 sm:w-24">
        <circle cx="60" cy="60" r={c.outer} strokeWidth="12" className="fill-none opacity-15" stroke="currentColor" />
        <circle cx="60" cy="60" r={c.mid}   strokeWidth="12" className="fill-none opacity-15" stroke="currentColor" />
        <circle cx="60" cy="60" r={c.inner} strokeWidth="12" className="fill-none opacity-15" stroke="currentColor" />

        {/* Move */}
        <motion.circle
          cx="60" cy="60" r={c.outer} strokeWidth="12" fill="none"
          stroke={COLORS.move} strokeLinecap="round" strokeDasharray={CIRC(c.outer)}
          animate={{ strokeDashoffset: (1 - p1) * CIRC(c.outer) }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          transform="rotate(-90 60 60)"
        />
        {/* Exercise */}
        <motion.circle
          cx="60" cy="60" r={c.mid} strokeWidth="12" fill="none"
          stroke={COLORS.exercise} strokeLinecap="round" strokeDasharray={CIRC(c.mid)}
          animate={{ strokeDashoffset: (1 - p2) * CIRC(c.mid) }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          transform="rotate(-90 60 60)"
        />
        {/* Stand */}
        <motion.circle
          cx="60" cy="60" r={c.inner} strokeWidth="12" fill="none"
          stroke={COLORS.stand} strokeLinecap="round" strokeDasharray={CIRC(c.inner)}
          animate={{ strokeDashoffset: (1 - p3) * CIRC(c.inner) }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          transform="rotate(-90 60 60)"
        />
      </svg>

      <div className="min-w-0 text-xs">
        <div className="text-sm font-semibold">Daily Rings</div>
        <div className="opacity-80">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.move }} />
            Move {data.move.value}/{data.move.goal} kcal
          </span>{" • "}
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.exercise }} />
            Exercise {data.exercise.value}/{data.exercise.goal} min
          </span>{" • "}
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.stand }} />
            Stand {data.stand.value}/{data.stand.goal} h
          </span>
        </div>
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="mt-2 rounded-full bg-white/70 px-3 py-1 ring-1 ring-black/10 hover:bg-white w-full sm:w-auto"
          title="Randomize today's rings"
        >
          Shuffle
        </button>
      </div>
    </div>
  );
}

/* ============ Weather (Athens, respects Wi-Fi) ============ */
function WeatherCard({ online }) {
  const [temp, setTemp] = useState(null);
  const [cond, setCond] = useState(online ? "Loading..." : "Offline");

  useEffect(() => {
    if (!online) { setCond("Offline"); setTemp(null); return; }
    setCond("Loading...");
    fetch("https://api.open-meteo.com/v1/forecast?latitude=37.9838&longitude=23.7275&current=temperature_2m,weather_code&timezone=auto")
      .then((res) => res.json())
      .then((data) => {
        const t = data?.current?.temperature_2m;
        const code = data?.current?.weather_code;
        if (typeof t === "number") setTemp(Math.round(t));
        const codes = { 0:"Clear sky",1:"Mainly clear",2:"Partly cloudy",3:"Cloudy",45:"Foggy",48:"Rime fog",51:"Drizzle",53:"Drizzle",55:"Drizzle",61:"Rain",63:"Rain",65:"Rain",71:"Snow",73:"Snow",75:"Snow",95:"Thunderstorm" };
        if (code !== undefined) setCond(codes[code] || "Weather");
      })
      .catch(() => setCond("Unavailable"));
  }, [online]);

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-semibold">Athens</div>
        <div className="text-xs opacity-70">{cond}</div>
      </div>
      <div className="text-3xl font-semibold">{temp !== null ? `${temp}°` : "--"}</div>
    </div>
  );
}

/* ============ Focus Session (redesigned, badge on offline) ============ */
function FocusSession({ calm, onEnd, rain, online, isTouch }) {
  const [dur, setDur] = useState(25 * 60);
  const [left, setLeft] = useState(dur);
  const [running, setRunning] = useState(false);
  const { rainOn, setRainOn, rainVol, setRainVol, rainSupported } = rain;

  useEffect(() => setLeft(dur), [dur]);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) { clearInterval(id); setRunning(false); onEnd?.(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, onEnd]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const pct = Math.max(0, Math.min(1, 1 - left / dur));

  return (
    <GlassCard className="relative p-0 rounded-[40px]" rippleDisabled={isTouch} layoutId="focusSwitchCard">
      {!online && (
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute left-0 right-0 top-0 z-20 grid place-items-center">
          <div className="mt-3 rounded-full bg-black/80 px-3 py-1 text-[11px] font-medium text-white/95 ring-1 ring-white/10">
            Offline mode — live data & media are paused
          </div>
        </motion.div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_25rem_at_40%_10%,rgba(255,255,255,0.35),transparent)]" />

      <div className="relative flex flex-col gap-6 sm:gap-8 p-6 sm:p-8 md:p-12">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-[22px] ring-1 ring-black/5 overflow-hidden">
            <div className="h-full w-full bg-gradient-to-br from-indigo-400 to-fuchsia-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Focus Session</h1>
            <p className="text-xs sm:text-sm opacity-70">Pomodoro • Ambient rain • Notifications muted</p>
          </div>
        </div>

        <div className="text-base sm:text-lg opacity-90">
          Set your pace, hit start, and let the environment melt away. When the timer ends, you’ll pop back to the site.
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          <InnerCard title="Timer" hint="Pomodoro" className="md:col-span-2">
            <div className="grid items-center gap-6 md:grid-cols-[auto_1fr]">
              <div className="relative h-32 w-32 sm:h-36 sm:w-36">
                <svg viewBox="0 0 160 160" className="h-32 w-32 sm:h-36 sm:w-36 rotate-[-90deg]">
                  <circle cx="80" cy="80" r="64" strokeWidth="14" className="fill-none opacity-20" stroke="currentColor" />
                  <circle cx="80" cy="80" r="64" strokeWidth="14" className="fill-none text-black/70"
                    strokeDasharray={2*Math.PI*64} strokeDashoffset={(1 - pct) * 2*Math.PI*64} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-xl sm:text-2xl font-semibold">{fmt(left)}</div>
                </div>
              </div>

              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap gap-2">
                  {[15, 25, 50].map((m) => (
                    <button
                      key={m}
                      onClick={() => { setDur(m * 60); setRunning(false); setLeft(m*60); }}
                      className={cn("rounded-full px-3 py-1 text-xs ring-1 ring-black/10", dur === m * 60 ? "bg-black/90 text-white" : "bg-white/70 hover:bg-white")}
                    >
                      {m}m
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setRunning((v) => !v)} className="rounded-[28px] bg-black/90 text-white px-5 py-2 text-sm ring-1 ring-black/5 hover:bg-black">
                    {running ? "Pause" : "Start"}
                  </button>
                  <button onClick={() => { setLeft(dur); setRunning(false); }} className="rounded-[28px] bg-white/70 px-5 py-2 text-sm ring-1 ring-black/10 hover:bg-white">
                    Reset
                  </button>
                </div>

                <div className="mt-3 text-[11px] opacity-60">Tip: keep your hands on the work — we’ll keep the vibes steady.</div>
              </div>
            </div>
          </InnerCard>

          <InnerCard title="Ambient Rain" hint={rainSupported ? "Loops seamlessly" : "Unavailable"}>
            <div className="flex flex-col items-center justify-center gap-3">
              <button
                onClick={() => rainSupported && setRainOn((v) => !v)}
                className={cn("rounded-[28px] px-4 py-2 text-sm ring-1 ring-black/10", rainOn ? "bg-black/90 text-white" : "bg-white/70 hover:bg-white")}
                title={rainSupported ? (rainOn ? "Stop rain" : "Play rain") : "Unavailable"}
              >
                {rainSupported ? (rainOn ? "Stop Rain" : "Play Rain") : "Rain N/A"}
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[11px] opacity-70">Volume</span>
                <input type="range" min="0" max="1" step="0.01" value={rainVol} onChange={(e) => setRainVol(Number(e.target.value))} className="w-36 accent-black" disabled={!rainOn}/>
              </div>
              <motion.div className="mt-2 h-24 w-24 rounded-full ring-1 ring-black/10 bg-white/60" animate={calm ? { scale:[1,1.08,1] } : { scale:[1,1.12,1] }} transition={{ duration: calm ? 7 : 5, repeat: Infinity }}/>
            </div>
          </InnerCard>
        </div>
      </div>
    </GlassCard>
  );
}

/* ============ Page ============ */
export default function IOSPersonalSite() {
  const [wifi, setWifi] = useState(true);
  const [focus, setFocus] = useState(false);

  // Detect touch to lighten effects on phones
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    try { setIsTouch(window.matchMedia && window.matchMedia("(pointer:coarse)").matches); } catch {}
  }, []);

  // Bluetooth
  const btSupported = typeof navigator !== "undefined" && "bluetooth" in navigator;
  const [bt, setBt] = useState(false);
  const [btDeviceName, setBtDeviceName] = useState("");
  const [btBattery, setBtBattery] = useState(null);
  const [btConnecting, setBtConnecting] = useState(false);

  // Now Playing
  const audioRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [title] = useState("Piano");

  // Ambient rain
  const rainRef = useRef(null);
  const [rainOn, setRainOn] = useState(false);
  const [rainVol, setRainVol] = useState(0.25);
  const rainSupported = true;

  useEffect(() => {
    const a = new Audio("/piano.mp3"); a.preload = "auto"; audioRef.current = a;
    const onLoaded = () => { setDuration(a.duration || 0); setIsReady(true); };
    const onTime = () => setCurrent(a.currentTime || 0);
    const onEnd = () => { setIsPlaying(false); setCurrent(0); };
    a.addEventListener("loadedmetadata", onLoaded); a.addEventListener("timeupdate", onTime); a.addEventListener("ended", onEnd);

    const r = new Audio("/rain.mp3"); r.loop = true; r.volume = rainVol; rainRef.current = r;
    return () => {
      a.pause();
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
      r.pause();
    };
  }, []);
  useEffect(()=>{ if (rainRef.current) rainRef.current.volume = rainVol; },[rainVol]);
  useEffect(()=>{
    const r = rainRef.current; if (!r) return;
    if (!wifi) { r.pause(); setRainOn(false); return; }
    if (rainOn) { r.play().catch(()=>{}); } else { r.pause(); }
  },[rainOn,wifi]);
  useEffect(()=>{ if (audioRef.current) audioRef.current.volume = focus ? 0.15 : 1; },[focus]);

  const toggleWifi = () => {
    setWifi((prev) => {
      const next = !prev;
      if (!next) {
        if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
        if (rainRef.current) { rainRef.current.pause(); setRainOn(false); }
      }
      return next;
    });
  };

  const connectBT = async () => {
    if (!btSupported) return;
    try {
      setBtConnecting(true);
      const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true, optionalServices: ["battery_service"] });
      setBt(true); setBtDeviceName(device.name || "Bluetooth device");
      try {
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService("battery_service");
        const char = await service.getCharacteristic("battery_level");
        const v = await char.readValue();
        setBtBattery(v.getUint8(0));
        device.addEventListener("gattserverdisconnected", () => { setBt(false); setBtDeviceName(""); setBtBattery(null); });
      } catch {}
    } catch { setBt(false); }
    finally { setBtConnecting(false); }
  };
  const disconnectBT = () => { setBt(false); setBtDeviceName(""); setBtBattery(null); };

  const togglePlay = async () => {
    if (!wifi) return;
    const a = audioRef.current; if (!a) return;
    if (isPlaying) { a.pause(); setIsPlaying(false); }
    else { try { await a.play(); setIsPlaying(true); } catch {} }
  };

  const nowPlayingProps = { audioRef, isReady, isPlaying, current, duration, setCurrent, title, toggle: togglePlay };

  return (
    <motion.div
      variants={pageFade}
      initial="hidden"
      animate="show"
      className={cn(
        "min-h-screen antialiased text-black/90 selection:bg-black/10 overflow-x-hidden",
        focus && "saturate-[.85]"
      )}
      style={{ fontFamily:"ui-sans-serif, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial" }}
    >
      {/* background */}
      <motion.div className="fixed inset-0 -z-10" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#f7f7f8] via-[#eef1f5] to-[#e6ebf1]" />
        <div className="absolute -inset-[20%] -z-10 bg-[radial-gradient(60rem_40rem_at_20%_-10%,rgba(99,102,241,0.15),transparent),radial-gradient(60rem_40rem_at_110%_10%,rgba(236,72,153,0.14),transparent),radial-gradient(60rem_40rem_at_50%_110%,rgba(16,185,129,0.12),transparent)] blur-3xl" />
      </motion.div>

      {/* island */}
      <DynamicIsland np={nowPlayingProps} wifi={wifi} btDeviceName={btSupported ? btDeviceName : ""} btBattery={btSupported ? btBattery : null} />

      {/* top bar */}
      <motion.div className="mx-auto max-w-6xl px-4 sm:px-6 pt-24 sm:pt-28" variants={headerStagger} initial="hidden" animate="show">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[20px] bg-black/5 ring-1 ring-black/10 backdrop-blur flex items-center justify-center">🍎</div>
            <span className="text-sm font-semibold tracking-wide opacity-90">NickOS</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Toggle label="Wi-Fi" on={wifi} onChange={toggleWifi} />
            {btSupported ? (
              <Toggle label={btConnecting ? "BT…" : "BT"} on={bt} onChange={() => (bt ? disconnectBT() : connectBT())} />
            ) : (
              <span className="rounded-[28px] px-3.5 py-3 text-xs ring-1 ring-black/10 bg-white/50">BT N/A (Safari)</span>
            )}
            <Toggle label="Focus" on={focus} onChange={() => setFocus((v) => !v)} />
          </div>
        </div>
      </motion.div>

      {/* content switcher */}
      <div className="relative">
        <AnimatePresence mode="wait" initial={false}>
          {focus ? (
            <motion.div key="focus" initial={switchEnter} animate={switchCenter} exit={switchExit} transition={{ duration: 0.35, ease: "easeOut" }} className="mx-auto max-w-6xl px-4 sm:px-6 pb-24 pt-8 sm:pt-10" layout>
              <FocusSession calm={focus} onEnd={() => setFocus(false)} rain={{ rainOn, setRainOn, rainVol, setRainVol, rainSupported }} online={wifi} isTouch={isTouch} />
            </motion.div>
          ) : (
            <motion.div key="normal" initial={switchEnter} animate={switchCenter} exit={switchExit} transition={{ duration: 0.35, ease: "easeOut" }} className="mx-auto max-w-6xl px-4 sm:px-6" layout>
              <motion.div className="pb-16 pt-12" layoutId="focusSwitchCard">
                <GlassCard className="relative overflow-hidden p-0 rounded-[40px]" rippleDisabled={isTouch}>
                  {!wifi && (
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute left-0 right-0 top-0 z-20 grid place-items-center">
                      <div className="mt-3 rounded-full bg-black/80 px-3 py-1 text-[11px] font-medium text-white/95 ring-1 ring-white/10">
                        Offline mode — live data & media are paused
                      </div>
                    </motion.div>
                  )}
                  <div className="absolute inset-0 bg-[radial-gradient(60rem_25rem_at_40%_10%,rgba(255,255,255,0.35),transparent)]" />

                  <div className="relative flex flex-col gap-8 p-8 md:p-12">
                    {/* header */}
                    <div className="flex items-center gap-4">
                      <img
                        alt="Nick avatar"
                        src={`data:image/svg+xml;utf8,${encodeURIComponent(
                          "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><defs><linearGradient id='g' x1='0' x2='1'><stop stop-color='#60a5fa'/><stop offset='1' stop-color='#a78bfa'/></linearGradient></defs><rect width='100%' height='100%' rx='24' fill='url(#g)'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-family='Helvetica,Arial' font-size='60' fill='white'>NZ</text></svg>"
                        )}`}
                        className="h-14 w-14 sm:h-16 sm:w-16 rounded-[22px] ring-1 ring-black/5"
                      />
                      <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Nick Zagkanas</h1>
                        <p className="text-sm opacity-70">Senior DevOps • IoT • Athens</p>
                      </div>
                    </div>

                    <div className="text-base sm:text-lg opacity-90">
                      Building smooth developer experiences and robust platforms. I like automation that feels like magic ✨
                    </div>

                    {/* inner widgets */}
                    <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
                      <motion.div custom={0} variants={gridStagger} initial="hidden" animate="show" className="md:col-span-2">
                        <InnerCard title="Now Playing" offline={!wifi}>
                          <NowPlaying np={nowPlayingProps} online={wifi} />
                        </InnerCard>
                      </motion.div>

                      <motion.div custom={1} variants={gridStagger} initial="hidden" animate="show">
                        <InnerCard title="Weather" offline={!wifi}>
                          <WeatherCard online={wifi} />
                        </InnerCard>
                      </motion.div>

                      <motion.div custom={2} variants={gridStagger} initial="hidden" animate="show">
                        <InnerCard title="Activity" offline={!wifi}>
                          <ActivityRingsRandom />
                        </InnerCard>
                      </motion.div>

                      <motion.div custom={3} variants={gridStagger} initial="hidden" animate="show">
                        <InnerCard title="Stack I love" offline={!wifi}>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs opacity-90">
                            {["Terraform","Puppet","K8s","Proxmox","Grafana","Jenkins","Azure","ArcGIS"].map((t)=>(
                              <span key={t} className="rounded-full bg-black/10 px-3 py-1">{t}</span>
                            ))}
                          </div>
                        </InnerCard>
                      </motion.div>

                      <motion.div custom={4} variants={gridStagger} initial="hidden" animate="show">
                        <InnerCard title="Availability" offline={!wifi}>
                          <p className="mt-1 text-sm opacity-80">Open to senior platform/DevOps roles & consulting. Based in Athens, remote-friendly.</p>
                        </InnerCard>
                      </motion.div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* footer */}
              <motion.div id="contact" className="pb-20" variants={gridStagger} initial="hidden" animate="show">
                <GlassCard>
                  <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold">Let’s build something smooth.</div>
                      <div className="text-xs opacity-70">DMs open • nick@example.com</div>
                    </div>
                    <div className="flex gap-3 flex-col sm:flex-row sm:items-center sm:justify-end">
                      <a className="w-full sm:w-auto rounded-[28px] bg-black/90 px-4 py-2 text-sm text-white ring-1 ring-black/5 hover:bg-black" href="#">Say hi</a>
                      <a className="w-full sm:w-auto rounded-[28px] bg-white/50 px-4 py-2 text-sm ring-1 ring-white/50 hover:bg-white/70 backdrop-blur-xl" href="#">Download CV</a>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
