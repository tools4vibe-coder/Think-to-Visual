
import React from 'react';
import { Scene } from '../types';
import { Camera, Move, Sun, Heart, Image as ImageIcon, Loader2, ScrollText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SceneCardProps {
  scene: Scene;
  imageUrl?: string;
  isGeneratingImage: boolean;
}

export const SceneCard: React.FC<SceneCardProps> = ({ scene, imageUrl, isGeneratingImage }) => {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all hover:border-indigo-500/50 group"
    >
      <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800/50">
        <AnimatePresence mode="wait">
          {imageUrl ? (
            <motion.img 
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={imageUrl} 
              alt={`Scene ${scene.number}`} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <motion.div 
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 text-slate-700"
            >
              {isGeneratingImage ? (
                <>
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                  <span className="text-sm font-medium animate-pulse">Rendering HD Frame {scene.number}...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-10 h-10" />
                  <span className="text-sm font-medium">Awaiting Visuals</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white">Frame {scene.number}</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h4 className="text-[10px] uppercase text-indigo-400 font-bold tracking-widest mb-2">Narrative Action</h4>
          <p className="text-slate-300 text-sm leading-relaxed min-h-[50px]">
            {scene.description}
          </p>
        </div>

        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2 text-indigo-400">
            <ScrollText className="w-4 h-4" />
            <h4 className="text-[10px] uppercase font-bold tracking-widest">Director's Vision</h4>
          </div>
          <p className="text-slate-400 text-xs italic leading-relaxed">
            {scene.visualNotes}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
            <Camera className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="overflow-hidden">
              <p className="text-[10px] uppercase text-slate-500 font-bold">Shot</p>
              <p className="text-xs text-slate-200 truncate">{scene.shotType}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
            <Move className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="overflow-hidden">
              <p className="text-[10px] uppercase text-slate-500 font-bold">Movement</p>
              <p className="text-xs text-slate-200 truncate">{scene.movement}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
            <Sun className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="overflow-hidden">
              <p className="text-[10px] uppercase text-slate-500 font-bold">Lighting</p>
              <p className="text-xs text-slate-200 truncate">{scene.lighting}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
            <Heart className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="overflow-hidden">
              <p className="text-[10px] uppercase text-slate-500 font-bold">Tone</p>
              <p className="text-xs text-slate-200 truncate">{scene.tone}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
