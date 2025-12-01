import React, { useState, useEffect } from 'react';
import { generateRewardImage } from '../services/geminiService';
import { AspectRatio, ImageSize } from '../types';

interface ImageGeneratorProps {
  initialPrompt: string;
  onBack: () => void;
}

const ASPECT_RATIOS: AspectRatio[] = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];
const IMAGE_SIZES: ImageSize[] = ['1K', '2K', '4K'];

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ initialPrompt, onBack }) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [size, setSize] = useState<ImageSize>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // 1. Check for API Key selection (Required for Veo/Advanced Image Models)
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          try {
            await window.aistudio.openSelectKey();
          } catch (e) {
            console.warn("Key selection dialog cancelled or failed", e);
            // We proceed, as the check in services might handle or it might just fail at the API call
          }
        }
      }

      // 2. Generate Image
      const imageData = await generateRewardImage(prompt, aspectRatio, size);
      setGeneratedImage(imageData);

    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("Requested entity was not found")) {
         // Handle race condition or stale key state by re-prompting
         if (window.aistudio) {
             await window.aistudio.openSelectKey();
         }
         setError("Authorization update required. Please try generating again.");
      } else {
        setError("Failed to generate image. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-800 rounded-3xl shadow-2xl border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
          Visual Studio
        </h2>
        <button 
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-colors"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              placeholder="Describe your image..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Aspect Ratio</label>
            <div className="grid grid-cols-4 gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-2 py-2 text-xs font-bold rounded-lg border transition-all ${
                    aspectRatio === ratio
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Resolution</label>
            <div className="flex gap-2">
              {IMAGE_SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-all ${
                    size === s
                      ? 'bg-pink-600 border-pink-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] ${
              isGenerating 
                ? 'bg-slate-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Dreaming...
              </span>
            ) : (
              "Generate Image"
            )}
          </button>
          
          <div className="text-xs text-slate-500 mt-4 leading-relaxed">
            <p>Using <span className="font-mono text-pink-400">gemini-3-pro-image-preview</span>.</p>
            <p className="mt-1">Billing enabled project required.</p>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Billing Docs</a>
          </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-2 bg-black/40 rounded-2xl border border-slate-700/50 flex items-center justify-center relative overflow-hidden min-h-[400px]">
           {generatedImage ? (
             <img 
               src={generatedImage} 
               alt="Generated reward" 
               className="max-w-full max-h-[600px] object-contain shadow-2xl rounded-lg animate-fade-in"
             />
           ) : (
             <div className="text-center p-8">
               {isGenerating ? (
                 <div className="animate-pulse">
                   <div className="h-48 w-48 mx-auto bg-slate-700/50 rounded-full mb-4 blur-xl"></div>
                   <p className="text-slate-400">Creating your masterpiece...</p>
                 </div>
               ) : (
                 <div className="text-slate-600">
                   <svg className="w-24 h-24 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
                   <p className="text-lg font-medium">Ready to generate</p>
                   {error && <p className="text-red-400 mt-2 text-sm max-w-xs mx-auto">{error}</p>}
                 </div>
               )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;