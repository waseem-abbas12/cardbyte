'use client';

import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, CheckCircle2, MessageSquarePlus, X, ThumbsUp, Send } from 'lucide-react';
import { ReviewItem } from '@/lib/types';
import { DEFAULT_REVIEWS } from '@/lib/db';

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<ReviewItem[]>(DEFAULT_REVIEWS);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CARDS' | 'KEYS'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form State
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [cardBrand, setCardBrand] = useState('Steam Wallet $100');
  const [payoutMethod, setPayoutMethod] = useState('USDT (TRC20)');
  const [amountUsd, setAmountUsd] = useState('80');
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(json => {
        if (json?.data?.reviews && Array.isArray(json.data.reviews)) {
          setReviews(json.data.reviews);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) {
      alert('Please fill in your name and comment.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: authorName.trim(),
          rating,
          cardBrand: cardBrand.trim(),
          payoutMethod: payoutMethod.trim(),
          amountUsd: parseFloat(amountUsd) || 50,
          comment: comment.trim()
        })
      });
      const data = await res.json();
      if (data.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setShowModal(false);
          setSubmitSuccess(false);
          setAuthorName('');
          setComment('');
        }, 2500);
      }
    } catch {
      alert('Network error submitting review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = reviews.filter(r => {
    if (activeFilter === 'CARDS') return !r.cardBrand.toLowerCase().includes('key');
    if (activeFilter === 'KEYS') return r.cardBrand.toLowerCase().includes('key');
    return true;
  });

  return (
    <section className="py-20 bg-brand-surface/40 border-t border-brand-border relative overflow-hidden" id="reviews">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header & Rating Overview */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold tracking-wide uppercase mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Trader Feedback
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-text tracking-tight">
              What Sellers Say About Cardbyte
            </h2>
            <p className="text-sm sm:text-base text-brand-muted mt-2 max-w-xl">
              Authentic reviews from retail sellers and OTC counterparties who trade gift vouchers and game licenses daily.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Score pill */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl glass-panel border border-brand-border">
              <div className="text-3xl font-black text-brand-text font-mono">4.98</div>
              <div>
                <div className="flex text-amber-400 text-sm">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-[11px] text-brand-muted mt-0.5">Based on 1,400+ payouts</div>
              </div>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-primary/20 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-brand-border/60 pb-3">
          {[
            { id: 'ALL', label: 'All Reviews' },
            { id: 'CARDS', label: 'Gift Cards' },
            { id: 'KEYS', label: 'Game Keys' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(r => (
            <div
              key={r.id}
              className="p-6 rounded-3xl glass-panel border border-brand-border/80 hover:border-brand-primary/40 transition-all flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg"
            >
              <div>
                {/* Reviewer Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center font-bold text-sm text-brand-primary overflow-hidden">
                      {r.avatar ? (
                        <img src={r.avatar} alt={r.authorName} className="w-full h-full object-cover" />
                      ) : (
                        r.authorName.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-brand-text">{r.authorName}</span>
                        {r.isVerifiedBuyer && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-brand-success border border-emerald-500/25">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Verified
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-brand-muted">
                        {new Date(r.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex text-amber-400">
                    {[...Array(r.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Traded Asset Tag */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-brand-surface border border-brand-border text-brand-text">
                    {r.cardBrand}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-brand-success">
                    ${r.amountUsd.toFixed(2)} USD
                  </span>
                  <span className="text-[10px] text-brand-muted">
                    via {r.payoutMethod}
                  </span>
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-brand-text/90 leading-relaxed italic">
                  "{r.comment}"
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-brand-border/60 flex items-center justify-between text-[11px] text-brand-muted">
                <span className="flex items-center gap-1 text-brand-success">
                  <ShieldCheck className="w-3 h-3 text-brand-success" />
                  Verified Settlement
                </span>
                <span className="flex items-center gap-1 text-brand-muted hover:text-brand-text transition-colors">
                  <ThumbsUp className="w-3 h-3" />
                  Helpful
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Write a Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-brand-border p-6 sm:p-8 shadow-2xl bg-brand-bg">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-brand-muted hover:text-brand-text hover:bg-brand-surface transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-brand-text mb-1">
              Submit Seller Review
            </h3>
            <p className="text-xs text-brand-muted mb-6">
              Share your trade experience with the Cardbyte seller community.
            </p>

            {submitSuccess ? (
              <div className="p-6 rounded-2xl bg-brand-successGlow border border-brand-success/30 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-brand-success mx-auto" />
                <h4 className="text-base font-bold text-brand-text">Review Received!</h4>
                <p className="text-xs text-brand-muted">
                  Thank you! Your feedback will appear publicly once verified by our moderation team.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-brand-text block mb-1.5">
                    Your Name or Trader Handle
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex K. or TraderPro"
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-brand-text block mb-1.5">
                      Rating
                    </label>
                    <select
                      value={rating}
                      onChange={e => setRating(parseInt(e.target.value))}
                      className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-primary"
                    >
                      <option value={5}>★★★★★ (5/5 Excellent)</option>
                      <option value={4}>★★★★☆ (4/5 Great)</option>
                      <option value={3}>★★★☆☆ (3/5 Average)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-brand-text block mb-1.5">
                      Traded Card / Key
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Steam $100 or EA FC 25"
                      value={cardBrand}
                      onChange={e => setCardBrand(e.target.value)}
                      className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-brand-text block mb-1.5">
                      Payout Rail
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. USDT (TRC20)"
                      value={payoutMethod}
                      onChange={e => setPayoutMethod(e.target.value)}
                      className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-brand-text block mb-1.5">
                      Payout Amount ($ USD)
                    </label>
                    <input
                      type="number"
                      placeholder="80"
                      value={amountUsd}
                      onChange={e => setAmountUsd(e.target.value)}
                      className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-brand-text block mb-1.5">
                    Your Review & Experience
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Tell other sellers how smooth the verification and payout was..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl p-3 text-sm text-brand-text focus:outline-none focus:border-brand-primary resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Submitting...' : 'Post Review for Moderation'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
