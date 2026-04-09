
import React, { useState, useEffect } from 'react';
import { Scene, AppStatus } from './types';
import { generateStoryboardData, generateSceneImage } from './geminiService';
import { SceneCard } from './components/SceneCard';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Film, Clapperboard, Sparkles, Trash2, AlertCircle, 
  User, ShieldCheck, RefreshCw, Zap, Lock, 
  SunMedium, Target, Crown, Key, ExternalLink 
} from 'lucide-react';

const App: React.FC = () => {
  const [story, setStory] = useState('');
  const [characterProfile, setCharacterProfile] = useState<string>('');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [images, setImages] = useState<Record<number, string>>({});
  const [status, setStatus] = useState<AppStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [generatingImageIndices, setGeneratingImageIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    // If we have an environment variable key, we can proceed
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'PLACEHOLDER_API_KEY') {
      if (status === 'unauthorized') setStatus('idle');
      return;
    }

    // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      setStatus('unauthorized');
    } else if (status === 'unauthorized') {
      setStatus('idle');
    }
  };

  const handleSelectKey = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    setStatus('idle');
  };

  const handleGenerate = async () => {
    if (!story.trim()) return;

    setStatus('analyzing');
    setError(null);
    setScenes([]);
    setImages({});
    setCharacterProfile('');
    setGeneratingImageIndices(new Set());

    try {
      const data = await generateStoryboardData(story);
      setCharacterProfile(data.characterProfile);
      setScenes(data.scenes);
      setStatus('visualizing');

      for (const scene of data.scenes) {
        // Longer stagger for Pro Thinking Mode
        if (scene.number > 1) await new Promise(r => setTimeout(r, 4000));

        setGeneratingImageIndices(prev => new Set(Array.from(prev).concat(scene.number)));
        try {
          const imageUrl = await generateSceneImage(scene.prompt);
          setImages(prev => ({ ...prev, [scene.number]: imageUrl }));
        } catch (imgErr: any) {
          console.error(`Pro Image Error: ${scene.number}`, imgErr);
          if (imgErr.message.includes("re-select")) {
            setStatus('unauthorized');
            throw imgErr;
          }
        } finally {
          setGeneratingImageIndices(prev => {
            const next = new Set(prev);
            next.delete(scene.number);
            return next;
          });
        }
      }
      setStatus('completed');
    } catch (err: any) {
      setError(err.message || 'Pro generation failed. Ensure your key has billing enabled.');
      setStatus('error');
    }
  };

  const handleClear = () => {
    setStory('');
    setScenes([]);
    setImages({});
    setCharacterProfile('');
    setStatus('idle');
    setError(null);
  };

  if (status === 'unauthorized') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-indigo-500/30 rounded-3xl p-8 text-center shadow-2xl">
          <div className="bg-indigo-600/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/30">
            <Crown className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Pro Access Required</h2>
          <p className="text-slate-400 mb-8 leading-relaxed text-sm">
            To use the <span className="text-indigo-400 font-bold italic">Nano Banana Pro</span> model with thinking mode and HD resolution, you must select an API key from a paid GCP project.
          </p>
          <div className="space-y-4">
            <button
              onClick={handleSelectKey}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20"
            >
              <Key className="w-5 h-5" />
              Select Pro API Key
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              className="text-slate-500 text-xs hover:text-indigo-400 flex items-center justify-center gap-1 transition-colors"
            >
              Billing Documentation <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-20 selection:bg-indigo-500/30">
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Clapperboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">SceneScribe <span className="text-indigo-400 font-light italic">Pro</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20 text-[10px] font-bold uppercase tracking-widest">
              <Zap className="w-3 h-3 fill-amber-400" />
              Thinking Mode Active
            </div>
            <button onClick={handleSelectKey} className="text-slate-500 hover:text-white transition-colors">
              <Key className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-600/10 px-4 py-2 rounded-full border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-tighter mb-4">
            <Crown className="w-3.5 h-3.5" />
            Powered by Nano Banana Pro
          </div>
          <h2 className="text-4xl md:text-5xl font-serif mb-4 text-white">Pro <span className="text-indigo-500">Identity-Locked</span> Stills</h2>
          <p className="text-slate-400 text-lg">780p HD visuals with advanced reasoning for unmatched cinematic consistency.</p>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1 shadow-2xl focus-within:ring-2 focus-within:ring-indigo-500/30">
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Describe your character and narrative. Pro models will think deeply about the scene composition..."
              className="w-full bg-slate-950 text-slate-100 border-0 rounded-xl p-6 min-h-[180px] focus:ring-0 resize-none text-lg leading-relaxed"
            />
            <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between border-t border-slate-800/40 bg-slate-900/50 rounded-b-xl">
              <div className="flex items-center gap-2 text-slate-500 text-sm italic">
                <Target className="w-4 h-4" />
                <span>HD (1K/780p) Rendering Enabled</span>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button onClick={handleClear} className="px-6 py-3 border border-slate-700 text-slate-400 rounded-xl hover:bg-slate-800 transition-all">
                  Reset
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={status === 'analyzing' || status === 'visualizing' || !story.trim()}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 flex items-center gap-2 transition-all"
                >
                  {status === 'analyzing' ? 'Pro Thinking...' : status === 'visualizing' ? 'Capturing HD...' : 'Start Pro Production'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-8 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-400"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        <AnimatePresence>
          {characterProfile && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto mb-12"
            >
              <div className="bg-slate-900/60 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
                <div className="flex items-center gap-3 mb-4 text-indigo-400">
                  <User className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">Master Identity Blueprint</h3>
                </div>
                <p className="text-slate-200 font-medium text-lg leading-relaxed">{characterProfile}</p>
                <div className="mt-4 flex items-center gap-2 text-[10px] text-emerald-400 font-bold tracking-widest uppercase">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Deep Identity Anchoring Success
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {scenes.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
              {scenes.map((scene, index) => (
                <motion.div
                  key={scene.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <SceneCard 
                    scene={scene} 
                    imageUrl={images[scene.number]}
                    isGeneratingImage={generatingImageIndices.has(scene.number)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default App;
