import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MousePointer2, Terminal, ChevronRight, Activity, Database, CheckSquare, Layers, Lock, Command } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Navbar - Floating Island
const Navbar = () => {
  const navRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 'top -100',
        end: 99999,
        toggleClass: {
          className: 'bg-background/80 backdrop-blur-xl border-textdark/10 shadow-sm border',
          targets: navRef.current
        }
      });
      // Text logic handling could go here for light/dark transitions
    }, navRef);
    return () => ctx.revert();
  }, []);

  return (
    <nav ref={navRef} className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-4 w-[95%] max-w-5xl rounded-full transition-colors duration-500 text-background mix-blend-difference border border-transparent">
      <div className="font-heading font-bold text-xl tracking-tight">WellnessRAG</div>
      <div className="hidden md:flex gap-8 font-mono text-sm">
        {['Methodology', 'Benchmarks'].map((i) => (
          <a key={i} href={`#${i.toLowerCase()}`} className="lowercase transition-transform hover:-translate-y-[1px]">{i}</a>
        ))}
      </div>

    </nav>
  );
};

// Hero - The Opening Shot
const Hero = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from('.hero-el', {
        y: 40,
        opacity: 0,
        stagger: 0.08,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.2
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative h-[100dvh] w-full bg-textdark flex items-end p-8 md:p-16 overflow-hidden pt-36">
      <div className="absolute inset-0 w-full h-full">
        {/* Unsplash abstract brutalist concrete texture */}
        <img
          src="https://images.unsplash.com/photo-1547820463-bb47fecd8827?q=80&w=2500&auto=format&fit=crop"
          alt="Concrete"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-textdark via-textdark/80 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-4xl text-background">
        <h1 className="hero-el font-heading font-medium tracking-tight text-3xl md:text-5xl uppercase text-primary/80 mb-2">Track the</h1>
        <h2 className="hero-el font-drama italic text-6xl md:text-8xl lg:text-[140px] leading-[0.9] tracking-tighter mb-8">Evolution.</h2>
        <p className="hero-el font-mono text-primary/70 max-w-xl text-lg md:text-xl leading-relaxed mb-10 border-l border-accent pl-4">
          Adaptive risk scoring and mental health analytics powered by hybrid databases. Precision infrastructure for longitudinal signals.
        </p>
        <div className="hero-el">
          <a href="#benchmarks" className="inline-flex bg-primary text-textdark px-8 py-4 rounded-full font-mono font-bold uppercase tracking-widest text-sm items-center gap-3 transition-transform duration-300 hover:scale-[1.03] hover:-translate-y-[2px]">
            Run Benchmarks <Activity className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};



// Philosophy
const Philosophy = () => {
  const philRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from('.phil-line', {
        scrollTrigger: {
          trigger: philRef.current,
          start: 'top 70%',
        },
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 1
      });
    }, philRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={philRef} className="relative py-48 bg-textdark text-background overflow-hidden px-6 md:px-16">
      <img src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=2000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay" />
      <div className="max-w-4xl mx-auto relative z-10 flex flex-col gap-8">
        <p className="phil-line font-mono text-primary/60 uppercase tracking-widest text-sm">Most analytics focuses on: static schema queries.</p>
        <p className="phil-line font-drama italic text-5xl md:text-7xl leading-tight">
          We focus on: <span className="text-accent underline decoration-1 underline-offset-8">adaptive semantic evolution.</span>
        </p>
      </div>
    </section>
  );
};


// Protocol: Sticky Stacking Archive
const ProtocolBox = ({ idx, title, sub, icon: Icon }) => {
  return (
    <div className={`protocol-card w-full h-[80vh] sticky top-[10vh] max-w-4xl mx-auto rounded-[3rem] p-12 flex flex-col justify-between shadow-2xl mb-[10vh] border border-white/5 
      ${idx % 2 === 0 ? 'bg-primary text-textdark' : 'bg-[#1E1C1A] text-primary'}`}>
      <div className="font-mono uppercase tracking-widest flex items-center gap-4 opacity-50">
        <span>Step // 0{idx}</span>
      </div>
      <div className="w-full flex-grow flex items-center justify-center my-8">
        <Icon className={`w-32 h-32 ${idx % 2 === 0 ? 'text-accent' : 'text-primary/20'} animate-pulse`} strokeWidth={1} />
      </div>
      <div>
        <h2 className="font-heading font-medium text-4xl md:text-5xl tracking-tighter mb-4">{title}</h2>
        <p className="font-mono text-lg opacity-70 max-w-xl">{sub}</p>
      </div>
    </div>
  );
}

const Protocol = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.protocol-card');

      cards.forEach((card, index) => {
        if (index === cards.length - 1) return; // Ignore last card
        gsap.to(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 10%",
            endTrigger: cards[index + 1],
            end: "top 20%",
            scrub: true,
          },
          scale: 0.9,
          filter: 'blur(10px)',
          opacity: 0.5
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-32 px-6" id="methodology">
      <div className="mb-24 text-center">
        <h2 className="font-heading font-medium text-sm tracking-widest uppercase mb-4 text-accent border border-accent px-4 py-1 rounded-full inline-block">Methodology</h2>
        <p className="font-drama italic text-5xl">The Execution Blueprint</p>
      </div>

      <div className="relative">
        <ProtocolBox idx={1} title="Data Ingestion & Mapping" sub="Longitudinal surveys and behavioral parameters are integrated into the primary hybrid data lake via structured ingest pipelines." icon={Database} />
        <ProtocolBox idx={2} title="Semantic Risk Modeling" sub="LLMs process free-text wellness inputs, generating high-dimensional vectors stored inside Pinecone for semantic thresholds." icon={Command} />
        <ProtocolBox idx={3} title="Adaptive Strategy Overwrite" sub="When thresholds or weights evolve, the optimizer dynamically selects between Recomputation, Materialized Views, Deltas, or Window calculations." icon={Lock} />
      </div>
    </section>
  );
};


// Run Benchmarks Dashboard
const BenchmarkDashboard = () => {

  const [activeTab, setActiveTab] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [outputs, setOutputs] = useState({});

  const executeBenchmark = async () => {
    setIsRunning(true);
    try {
      const response = await fetch(`http://localhost:3000/api/run/${activeTab}`);
      const data = await response.json();

      let cleanOutput = data.output || data.error;
      // remove the dotenv injection tip line to make output cleaner
      cleanOutput = cleanOutput.replace(/\[dotenv@.*?\n\n/g, '').replace(/\[dotenv@.*?\n/g, '');

      setOutputs(prev => ({
        ...prev,
        [activeTab]: cleanOutput
      }));
    } catch (e) {
      setOutputs(prev => ({
        ...prev,
        [activeTab]: `[ERROR] Failed to reach backend server on port 3000: \n${e.message}\nMake sure backend/server.js is running.`
      }));
    }
    setIsRunning(false);
  };

  const benchmarks = [
    {
      title: "Strategy 1: Full SQL Recompute",
      desc: "Recomputes definition manually against all 1,977 longitudinal student records sequentially.",
      latency: "3.35 ms",
      cost: "O(n)",
    },
    {
      title: "Strategy 2: Materialized Views",
      desc: "Instant lookups. Incurs 16ms penalty upon definition change refresh operations.",
      latency: "0.29 ms",
      cost: "O(1)",
    },
    {
      title: "Strategy 3: Incremental Sync",
      desc: "Issues direct UPDATE delta statements mapped exactly to parameterized weight drift (+0.2).",
      latency: "0.52 ms",
      cost: "O(log n)",
    },
    {
      title: "Strategy 4: Window Matrix",
      desc: "Utilizes non-destructive PARTITION BY aggregations across 50 preceding sequence rows.",
      latency: "5.80 ms",
      cost: "O(n)",
    }
  ];

  return (
    <section className="py-32 bg-primary px-6" id="benchmarks">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-drama italic text-5xl md:text-7xl mb-6 tracking-tighter">Diagnostic<br />Benchmarks</h2>
            <p className="font-mono opacity-60 text-lg mb-10 max-w-sm border-l border-textdark pl-4">Raw telemetry sourced directly from the Postgres / Pinecone execution layer evaluations.</p>

            <div className="flex flex-col gap-4 relative">
              {benchmarks.map((b, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`text-left p-6 rounded-[2rem] border transition-all duration-300 ${activeTab === i ? 'bg-textdark text-background shadow-xl border-transparent transform scale-[1.02]' : 'bg-transparent border-textdark/20 hover:border-textdark/50'}`}
                >
                  <div className="flex justify-between items-center w-full mb-2">
                    <h3 className="font-heading font-medium text-xl">{b.title}</h3>
                    {activeTab === i && <Activity className="w-5 h-5 text-accent animate-pulse" />}
                  </div>
                  <p className="font-mono text-sm opacity-70 mb-4">{b.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="h-full min-h-[650px] bg-textdark rounded-[3rem] p-8 text-primary font-mono relative shadow-2xl flex flex-col border-t-4 border-accent">
            <div className="flex justify-between items-center opacity-50 text-xs mb-8 uppercase tracking-widest border-b border-white/10 pb-4">
              <span>Terminal output // node execute.js</span>
              <span className="bg-accent/20 text-accent px-2 py-1 rounded">LIVE</span>
            </div>

            <div className="flex-grow flex flex-col justify-center">
              <div className="animate-fade-in flex flex-col h-full" key={activeTab}>
                <div className="text-3xl font-heading mb-2">Test: {benchmarks[activeTab].title}</div>
                <div className="text-sm opacity-50 mb-8">Checking index performance...</div>

                {outputs[activeTab] ? (
                  <div className="text-xs bg-black/50 p-6 rounded-2xl whitespace-pre-wrap overflow-y-auto h-[550px] text-green-400 font-mono leading-relaxed border border-white/5 shadow-inner">
                    {outputs[activeTab]}
                  </div>
                ) : (
                  <div className="flex flex-col gap-8">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-accent mb-2">Avg Execution Latency</div>
                      <div className="text-6xl font-heading">{benchmarks[activeTab].latency}</div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-widest text-accent mb-2">Computational Complexity</div>
                      <div className="text-4xl text-primary/80">{benchmarks[activeTab].cost}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={executeBenchmark}
              disabled={isRunning}
              className="w-full py-4 mt-8 bg-primary text-textdark rounded-full font-bold tracking-widest uppercase hover:bg-accent hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isRunning ? (
                <><Activity className="w-5 h-5 animate-spin" /> Executing Script...</>
              ) : (
                <>Execute Benchmark</>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// ERD Modal
const ERDModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-textdark/90 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-background w-full max-w-4xl p-8 rounded-[2rem] shadow-2xl overflow-y-auto max-h-[90vh] border border-textdark/10 relative animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8 border-b border-textdark/10 pb-4">
          <h2 className="font-heading font-bold text-3xl tracking-tighter">System Architecture & ERD</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-textdark/5 hover:bg-accent hover:text-white transition-colors flex items-center justify-center font-mono">
            X
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-sm">
          {/* PostgreSQL Table */}
          <div className="bg-white rounded-xl border border-textdark/10 shadow-sm p-6 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
            <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              PostgreSQL
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
              <div className="font-bold text-blue-800 mb-2 border-b border-slate-200 pb-2">student_health_records</div>
              <ul className="flex flex-col gap-1 text-xs">
                <li className="flex justify-between"><span className="font-bold">id</span> <span className="text-slate-500">PK, SERIAL</span></li>
                <li className="flex justify-between"><span>age</span> <span className="text-slate-500">VARCHAR(255)</span></li>
                <li className="flex justify-between"><span>gender</span> <span className="text-slate-500">VARCHAR(255)</span></li>
                <li className="flex justify-between"><span>university</span> <span className="text-slate-500">VARCHAR(255)</span></li>
                <li className="flex justify-between"><span>department</span> <span className="text-slate-500">VARCHAR(255)</span></li>
                <li className="flex justify-between"><span>academic_year</span> <span className="text-slate-500">VARCHAR(255)</span></li>
                <li className="flex justify-between"><span className="font-bold text-accent">cgpa</span> <span className="text-slate-500">INDEX, VARCHAR(255)</span></li>
                <li className="flex justify-between"><span>scholarship</span> <span className="text-slate-500">VARCHAR(255)</span></li>
                <li className="flex justify-between"><span className="font-bold text-accent">anxiety_score</span> <span className="text-slate-500">INDEX, INT</span></li>
                <li className="flex justify-between"><span>anxiety_label</span> <span className="text-slate-500">VARCHAR(255)</span></li>
                <li className="flex justify-between"><span className="font-bold text-accent">stress_score</span> <span className="text-slate-500">INDEX, INT</span></li>
                <li className="flex justify-between"><span>stress_label</span> <span className="text-slate-500">VARCHAR(255)</span></li>
                <li className="flex justify-between"><span className="font-bold text-accent">depression_score</span> <span className="text-slate-500">INDEX, INT</span></li>
                <li className="flex justify-between"><span>depression_label</span> <span className="text-slate-500">VARCHAR(255)</span></li>
              </ul>
            </div>
          </div>

          {/* Pinecone Index */}
          <div className="bg-white rounded-xl border border-textdark/10 shadow-sm p-6 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-purple-500"></div>
            <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-500" />
              Pinecone Vector DB
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
              <div className="font-bold text-purple-800 mb-2 border-b border-slate-200 pb-2">student-wellness (Index)</div>
              <ul className="flex flex-col gap-1 text-xs">
                <li className="flex justify-between"><span className="font-bold">id</span> <span className="text-slate-500">String (Matches PG)</span></li>
                <li className="flex justify-between"><span>values</span> <span className="text-slate-500">Array&lt;Float&gt; [1536 dim]</span></li>
                <li className="mt-2 font-bold mb-1 border-b border-slate-200 pb-1">metadata object:</li>
                <li className="flex justify-between pl-2"><span>age</span> <span className="text-slate-500">String</span></li>
                <li className="flex justify-between pl-2"><span>university</span> <span className="text-slate-500">String</span></li>
                <li className="flex justify-between pl-2"><span>anxiety_label</span> <span className="text-slate-500">String</span></li>
                <li className="flex justify-between pl-2"><span>cgpa</span> <span className="text-slate-500">String</span></li>
              </ul>
            </div>

            <div className="mt-6 text-xs text-textdark/60 opacity-80 border-l-2 border-accent pl-3">
              <p className="mb-2"><span className="font-bold">Polyglot Relationship:</span></p>
              <p>The vector dataset conceptually `JOIN`s on the relational database via matching <code className="bg-black/5 px-1 rounded">id</code> fields to fuse exact telemetry with semantic NLP evaluations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Footer
const Footer = ({ onOpenERD }) => {
  return (
    <footer className="bg-[#0c0b0a] text-primary pt-32 pb-16 px-6 md:px-16 rounded-t-[4rem] -mt-10 relative z-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 font-mono text-sm border-b border-primary/10 pb-16">
        <div className="md:col-span-2">
          <h2 className="font-heading font-bold text-3xl mb-4 text-white">WellnessRAG</h2>
          <p className="opacity-50 max-w-sm mb-8">Raw precision engineering for next-generation mental health analytics and polyglot risk-scoring data lakes.</p>
          <div className="flex items-center gap-2 px-4 py-2 border border-green-500/30 bg-green-500/5 rounded-full inline-flex text-green-400 text-xs uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Operational
          </div>
        </div>

        <div>
          <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs opacity-50">Stack</h4>
          <ul className="flex flex-col gap-3 opacity-80">
            <li className="hover:text-accent cursor-pointer transition-colors"><a target="_blank" rel="noopener noreferrer" href="https://www.postgresql.org/docs/14/index.html">PostgreSQL 14+</a></li>
            <li className="hover:text-accent cursor-pointer transition-colors"><a target="_blank" rel="noopener noreferrer" href="https://docs.pinecone.io/">Pinecone Vector DB</a></li>
            <li className="hover:text-accent cursor-pointer transition-colors"><a target="_blank" rel="noopener noreferrer" href="https://sbert.net/">Sentence-Transformers</a></li>
            <li className="hover:text-accent cursor-pointer transition-colors"><a target="_blank" rel="noopener noreferrer" href="https://expressjs.com/">Node.js Express</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs opacity-50">Indices</h4>
          <ul className="flex flex-col gap-3 opacity-80">
            <li className="hover:text-accent cursor-pointer transition-colors" onClick={onOpenERD}>Architecture (ERD)</li>
            <li className="hover:text-accent cursor-pointer transition-colors">Source Code</li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-8 flex flex-col md:flex-row justify-between items-center opacity-40 font-mono text-xs">
        <p>© 2026 WellnessRAG</p>
        {/* <p>Built with React + Vite + GSAP</p> */}
      </div>
    </footer>
  );
};

function App() {
  const [isERDOpen, setIsERDOpen] = useState(false);

  return (
    <div className="bg-background selection:bg-accent selection:text-white">
      <Navbar />
      <Hero />
      <Philosophy />
      <Protocol />
      <BenchmarkDashboard />
      <Footer onOpenERD={() => setIsERDOpen(true)} />
      <ERDModal isOpen={isERDOpen} onClose={() => setIsERDOpen(false)} />
    </div>
  );
}

export default App;
