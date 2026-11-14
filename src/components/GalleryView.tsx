'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Camera, X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import type { GalleryPhoto } from '@/data/galleryData';
import { Skeleton } from '@/components/ui/Skeleton';

export default function GalleryView() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const categories = ['All', 'Tournaments', 'Awards', 'Blitz Night', 'Club Room'];

  useEffect(() => {
    let isMounted = true;
    async function fetchPhotos() {
      try {
        setLoading(true);
        const res = await fetch('/api/gallery');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.photos)) {
            setPhotos(data.photos);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch gallery photos:', err);
      }
      if (isMounted) {
        setPhotos([]);
        setLoading(false);
      }
    }
    fetchPhotos();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPhotos = activeCategory === 'All'
    ? photos
    : photos.filter(p => p.category === activeCategory);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null || filteredPhotos.length === 0) return;
      if (e.key === 'Escape') setSelectedPhotoIndex(null);
      if (e.key === 'ArrowRight') {
        setSelectedPhotoIndex((prev) =>
          prev !== null ? (prev + 1) % filteredPhotos.length : null
        );
      }
      if (e.key === 'ArrowLeft') {
        setSelectedPhotoIndex((prev) =>
          prev !== null ? (prev - 1 + filteredPhotos.length) % filteredPhotos.length : null
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, filteredPhotos.length]);

  const activePhoto = (selectedPhotoIndex !== null && filteredPhotos[selectedPhotoIndex])
    ? filteredPhotos[selectedPhotoIndex]
    : null;

  return (
    <div className="min-h-screen bg-bg text-fg font-ui selection:bg-accent selection:text-on-accent">
      <Navbar />

      <main id="main-content" className="pt-28 pb-20">
        
        {/* HEADER SECTION */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="p-7 sm:p-10 rounded-md bg-surface border border-border">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-accent">
                <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                <span>COLLEGIATE TOURNAMENT MEMORIES</span>
              </div>
              <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-fg tracking-tight leading-tight">
                Photo Gallery <span className="text-accent">&amp;</span> Highlights
              </h1>
              <p className="text-sm sm:text-base text-fg-muted leading-relaxed font-body">
                A visual archive of 64-square encounters, trophy ceremonies, blitz night showdowns, and post-game analyses at Jalpaiguri Government Engineering College.
              </p>
            </div>
          </div>
        </section>

        {/* CATEGORY FILTER PILLS */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => {
              const count = !loading ? (cat === 'All' ? photos.length : photos.filter(p => p.category === cat).length) : null;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xs text-xs font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap border ${
                    activeCategory === cat
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface text-fg-muted hover:text-fg border-border hover:border-border-strong'
                  }`}
                >
                  {cat}
                  {count !== null ? ` (${count})` : ''}
                </button>
              );
            })}
          </div>
        </section>

        {/* PHOTO GRID */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="rounded-md overflow-hidden bg-surface border border-border"
                >
                  <Skeleton className="aspect-[4/3] w-full rounded-none border-0 border-b border-border" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))
            ) : filteredPhotos.length === 0 ? (
              <div className="col-span-full py-16 px-6 text-center rounded-md bg-surface border border-border space-y-4">
                <div className="w-14 h-14 rounded-sm bg-surface-elevated border border-border flex items-center justify-center mx-auto text-accent">
                  <Camera className="w-7 h-7 opacity-70" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-heading text-fg">
                    No Gallery Photos Found
                  </h3>
                  <p className="text-sm text-fg-muted max-w-md mx-auto font-body">
                    {activeCategory === 'All'
                      ? 'Tournament photo archives are being updated by the media coordinator.'
                      : `No moments currently catalogued under "${activeCategory}".`}
                  </p>
                </div>
                {activeCategory !== 'All' && (
                  <button
                    type="button"
                    onClick={() => setActiveCategory('All')}
                    className="text-xs font-mono font-semibold text-accent hover:underline cursor-pointer"
                  >
                    View all categories →
                  </button>
                )}
              </div>
            ) : (
              filteredPhotos.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setSelectedPhotoIndex(index)}
                  className="group relative rounded-md overflow-hidden bg-surface border border-border hover:border-border-strong cursor-pointer transition-colors text-left flex flex-col"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#111114] border-b border-border">
                    <img
                      src={photo.imageSrc}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Scrimmed Tag Pills Over Photograph for Guaranteed Contrast */}
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-xs bg-[#09090B]/85 border border-white/15 text-[10px] font-mono font-bold uppercase tracking-wider text-[#D4AF7C]">
                      {photo.tag}
                    </div>

                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-xs bg-[#09090B]/85 border border-white/15 text-[10px] font-mono font-medium text-[#FAFAFA] flex items-center gap-1">
                      <Calendar className="w-3 h-3" aria-hidden="true" />
                      <span>{photo.date}</span>
                    </div>
                  </div>

                  {/* Card Caption Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between w-full">
                    <div>
                      <h3 className="font-heading font-bold text-base text-fg group-hover:text-accent transition-colors line-clamp-1 mb-1.5">
                        {photo.title}
                      </h3>
                      <p className="text-xs text-fg-muted font-body line-clamp-2 leading-relaxed">
                        {photo.description}
                      </p>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] font-mono text-fg-muted">
                      <span className="font-semibold text-fg truncate pr-2">{photo.tournamentName}</span>
                      <span className="text-accent shrink-0 group-hover:translate-x-0.5 transition-transform">
                        Inspect →
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        {/* LIGHTBOX MODAL */}
        {activePhoto && selectedPhotoIndex !== null && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={activePhoto.title}
            className="fixed inset-0 z-50 bg-scrim/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
            onClick={() => setSelectedPhotoIndex(null)}
          >
            <div
              style={{ boxShadow: 'var(--shadow-md)' }}
              className="relative max-w-5xl w-full max-h-[90vh] bg-surface border border-border-strong rounded-md overflow-hidden flex flex-col animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              
              <button
                type="button"
                onClick={() => setSelectedPhotoIndex(null)}
                className="absolute top-4 right-4 z-20 min-w-[40px] min-h-[40px] rounded-sm bg-[#09090B]/80 hover:bg-accent hover:text-on-accent border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close photo preview"
              >
                <X className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedPhotoIndex((selectedPhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-sm bg-[#09090B]/80 hover:bg-accent hover:text-on-accent border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedPhotoIndex((selectedPhotoIndex + 1) % filteredPhotos.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-sm bg-[#09090B]/80 hover:bg-accent hover:text-on-accent border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Next photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="relative w-full h-[55vh] sm:h-[65vh] bg-[#09090B] flex items-center justify-center overflow-hidden border-b border-border">
                <img
                  src={activePhoto.imageSrc}
                  alt={activePhoto.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              <div className="p-6 bg-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider bg-accent text-on-accent">
                      {activePhoto.tag}
                    </span>
                    <span className="text-xs font-mono text-fg-muted">{activePhoto.date}</span>
                    <span className="text-xs font-mono text-fg-muted">• {activePhoto.tournamentName}</span>
                  </div>
                  <h2 className="font-heading font-bold text-lg text-fg">
                    {activePhoto.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-fg-muted font-body mt-1 max-w-3xl leading-relaxed">
                    {activePhoto.description}
                  </p>
                </div>

                <div className="text-xs font-mono text-fg-muted whitespace-nowrap self-end sm:self-center">
                  Photo {selectedPhotoIndex + 1} / {filteredPhotos.length}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
