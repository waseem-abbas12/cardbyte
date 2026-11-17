import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDatabase } from '@/lib/db';
import { ArrowLeft, Clock, ShieldCheck, FileText, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const db = getDatabase();
  const page = (db.customPages || []).find(p => p.slug === params.slug && p.published);
  if (!page) {
    return {
      title: 'Page Not Found | Cardbyte'
    };
  }
  return {
    title: `${page.title} | Cardbyte Pro`,
    description: page.summary || `Read ${page.title} on Cardbyte Digital Gift Card Exchange.`
  };
}

export default function DynamicCustomPage({ params }: PageProps) {
  const db = getDatabase();
  const page = (db.customPages || []).find(p => p.slug === params.slug && p.published);

  if (!page) {
    notFound();
  }

  // Simple Markdown Parser for headers, bullet points, and paragraphs
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-4" />;
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-lg font-bold text-brand-text mt-6 mb-2">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-2xl font-extrabold text-brand-text mt-8 mb-3 pb-2 border-b border-brand-border/60">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }
      if (trimmed.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-3xl font-black text-brand-text mt-6 mb-4">
            {trimmed.replace('# ', '')}
          </h1>
        );
      }
      if (trimmed.startsWith('- ')) {
        return (
          <li key={idx} className="ml-5 list-disc text-sm text-brand-text/90 leading-relaxed my-1">
            {trimmed.replace('- ', '')}
          </li>
        );
      }
      if (/^\d+\.\s/.test(trimmed)) {
        return (
          <li key={idx} className="ml-5 list-decimal text-sm text-brand-text/90 leading-relaxed my-1.5 font-medium">
            {trimmed.replace(/^\d+\.\s/, '')}
          </li>
        );
      }
      return (
        <p key={idx} className="text-sm text-brand-text/85 leading-relaxed my-2">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-brand-muted mb-8">
        <Link href="/" className="hover:text-brand-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>Pages</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-brand-text font-bold truncate">{page.title}</span>
      </nav>

      {/* Main Document Card */}
      <article className="rounded-3xl glass-panel border border-brand-border p-6 sm:p-10 shadow-card">
        
        {/* Header Badge */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-brand-border/60">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/25 text-brand-primary text-xs font-bold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            Official Cardbyte Publication
          </div>

          <div className="flex items-center gap-1.5 text-xs text-brand-muted">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated {new Date(page.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-text tracking-tight mb-4">
          {page.title}
        </h1>

        {page.summary && (
          <p className="text-base text-brand-muted leading-relaxed mb-8 p-4 rounded-2xl bg-brand-surface border border-brand-border/80 font-medium italic">
            "{page.summary}"
          </p>
        )}

        {/* Formatted Body */}
        <div className="prose prose-slate max-w-none text-brand-text">
          {renderFormattedContent(page.content)}
        </div>

        {/* Footer Actions */}
        <div className="mt-12 pt-8 border-t border-brand-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-cardHover border border-brand-border text-brand-text font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Exchange
          </Link>

          <div className="flex items-center gap-1.5 text-brand-success font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Platform Document • Cardbyte Compliance Core</span>
          </div>
        </div>

      </article>
    </div>
  );
}
