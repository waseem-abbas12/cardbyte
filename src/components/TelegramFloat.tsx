'use client';

import React, { useState, useEffect } from 'react';
import { Send, MessageCircle, X } from 'lucide-react';

export default function TelegramFloat() {
  const [telegramUrl, setTelegramUrl] = useState('https://t.me/cardbyte_support');
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(json => {
        if (json?.data?.siteSettings?.telegramSupport) {
          setTelegramUrl(json.data.siteSettings.telegramSupport);
        }
      })
      .catch(() => {});

    // Automatically hide tooltip after 8s
    const timer = setTimeout(() => setShowTooltip(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      
      {/* Speech Bubble / Tooltip */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl glass-panel border border-brand-border shadow-xl text-xs font-bold text-brand-text animate-in fade-in slide-in-from-right-4">
          <span className="w-2 h-2 rounded-full bg-brand-success animate-ping"></span>
          <span>Online Moderator: Need Help?</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-brand-muted hover:text-brand-text ml-1 cursor-pointer"
            aria-label="Close tooltip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Button */}
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Moderator on Telegram"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#0088cc] to-[#29b6f6] text-white shadow-xl shadow-[#0088cc]/30 hover:shadow-2xl hover:shadow-[#0088cc]/50 hover:scale-110 active:scale-95 transition-all duration-300"
      >
        {/* Pulsing ring */}
        <span className="absolute inset-0 rounded-full bg-[#0088cc] animate-ping opacity-25 pointer-events-none"></span>

        <Send className="w-6 h-6 -translate-x-0.5 translate-y-0.5 group-hover:rotate-12 transition-transform duration-300 fill-white text-white" />
        
        {/* Status Dot */}
        <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-brand-bg shadow-sm"></span>
      </a>

    </div>
  );
}
