'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { 
  Camera, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Trophy, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { GALLERY_PHOTOS, GalleryPhoto } from '@/data/galleryData';

export default function GalleryView() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const categories = ['All', 'Tournaments', 'Awards', 'Blitz Night', 'Club Room'];

  const filteredPhotos = activeCategory === 'All' 
    ? GALLERY_PHOTOS 
    : GALLERY_PHOTOS.filter(p => p.category === activeCategory);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
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

  const activePhoto = selectedPhotoIndex !== null ? filteredPhotos[selectedPhotoIndex] : null;

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F5F5] font-['Inter',sans-serif] selection:bg-[#D4AF7C] selection:text-[#0B0F14]">
      <Navbar />

      <main id="main-content" className="pt-28 pb-20">
        
        {/* HEADER SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#12161D] to-[#0D1016] border border-white/10 overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 text-xs font-bold uppercase tracking-widest text-[#D4AF7C] mb-4">
                <Camera className="w-3.5 h-3.5" />
                <span>Collegiate Tournament Memories</span>
              </div>
              <h1 className="font-['Montserrat',sans-serif] font-black text-3xl sm:text-5xl text-[#F5F5F5] tracking-tight leading-tight mb-4">
                Photo Gallery <span className="text-[#D4AF7C]">&</span> Highlights
              </h1>
              <p className="text-sm sm:text-base text-[#A0A6B0] leading-relaxed font-['Poppins',sans-serif]">
                A visual journey through fierce 64-square encounters, trophy celebrations, blitz night showdowns, and post-game analyses at Jalpaiguri Government Engineering College.
              </p>
            </div>
          </div>
        </section>

        {/* CATEGORY FILTER PILLS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-[#D4AF7C] to-[#E6C98A] text-[#0B0F14] font-bold shadow-lg shadow-[#D4AF7C]/20'
                    : 'bg-[#12161D] text-[#A0A6B0] hover:text-[#F5F5F5] hover:bg-white/5 border border-white/10'
                }`}
              >
                {cat}
                {cat === 'All' ? ` (${GALLERY_PHOTOS.length})` : ''}
              </button>
            ))}
          </div>
        </section>

        {/* PHOTO GRID */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhotoIndex(index)}
                className="group relative rounded-3xl overflow-hidden bg-[#12161D] border border-white/10 hover:border-[#D4AF7C]/50 shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/60">
                  <img
                    src={photo.imageSrc}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[11px] font-bold text-[#D4AF7C]">
                    {photo.tag}
                  </div>

                  {/* Date badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[11px] font-medium text-[#A0A6B0] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{photo.date}</span>
                  </div>

                  {/* Dark gradient overlay at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#12161D] via-[#12161D]/80 to-transparent" />
                </div>

                {/* Details */}
                <div className="p-5 relative z-10 -mt-6">
                  <h3 className="font-['Montserrat',sans-serif] font-bold text-base text-[#F5F5F5] group-hover:text-[#D4AF7C] transition-colors line-clamp-1 mb-1.5">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-[#A0A6B0] line-clamp-2 leading-relaxed">
                    {photo.description}
                  </p>
                  
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-[#A0A6B0]">
                    <span className="font-semibold text-white/80">{photo.tournamentName}</span>
                    <span className="text-[#D4AF7C] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      View photo →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LIGHTBOX MODAL */}
        {activePhoto && selectedPhotoIndex !== null && (
          <div 
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelectedPhotoIndex(null)}
          >
            <div 
              className="relative max-w-5xl w-full max-h-[90vh] bg-[#12161D] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedPhotoIndex(null)}
                className="absolute top-4 right-4 z-20 min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-black/60 hover:bg-white/20 border border-white/20 text-[#F5F5F5] flex items-center justify-center transition cursor-pointer active:scale-95"
                aria-label="Close photo preview"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Prev / Next Buttons */}
              <button
                type="button"
                onClick={() => setSelectedPhotoIndex((selectedPhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/70 hover:bg-[#D4AF7C] hover:text-[#0B0F14] border border-white/20 text-[#F5F5F5] flex items-center justify-center transition cursor-pointer shadow-lg"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedPhotoIndex((selectedPhotoIndex + 1) % filteredPhotos.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/70 hover:bg-[#D4AF7C] hover:text-[#0B0F14] border border-white/20 text-[#F5F5F5] flex items-center justify-center transition cursor-pointer shadow-lg"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Image Container */}
              <div className="relative w-full h-[55vh] sm:h-[65vh] bg-black/80 flex items-center justify-center overflow-hidden">
                <img
                  src={activePhoto.imageSrc}
                  alt={activePhoto.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Caption & Metadata Footer */}
              <div className="p-6 bg-[#0E121A] border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#D4AF7C]/20 text-[#D4AF7C] border border-[#D4AF7C]/30">
                      {activePhoto.tag}
                    </span>
                    <span className="text-xs text-[#A0A6B0]">{activePhoto.date}</span>
                    <span className="text-xs text-[#A0A6B0]">• {activePhoto.tournamentName}</span>
                  </div>
                  <h2 className="font-['Montserrat',sans-serif] font-bold text-lg text-[#F5F5F5]">
                    {activePhoto.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#A0A6B0] mt-1 max-w-3xl leading-relaxed">
                    {activePhoto.description}
                  </p>
                </div>

                <div className="text-xs font-mono text-[#A0A6B0] whitespace-nowrap self-end sm:self-center">
                  Photo {selectedPhotoIndex + 1} of {filteredPhotos.length}
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
