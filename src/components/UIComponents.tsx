"use client";

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { ArrowRight, Trophy } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export function PrimaryButton({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-['Inter',sans-serif] text-sm font-semibold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition-all duration-200 shadow-md shadow-[#D4AF7C]/20 active:scale-[0.98] cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-['Inter',sans-serif] text-sm font-semibold text-[#F5F5F5] bg-transparent hover:bg-white/[0.05] border border-white/20 hover:border-white/40 transition-all duration-200 active:scale-[0.98] cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export interface EventCardProps {
  title?: string;
  date?: string;
  venue?: string;
  status?: string;
  onViewDetails?: () => void;
  className?: string;
}

export function EventCard({ 
  title = "Inter-College Chess Tournament", 
  date = "October 24, 2026", 
  venue = "Main Auditorium, JGEC Campus", 
  status = "Registration open", 
  onViewDetails,
  className = "" 
}: EventCardProps) {
  return (
    <div className={`p-6 rounded-2xl bg-[#1A1A1A] border border-white/5 hover:border-[#D4AF7C]/40 transition-all duration-300 shadow-xl group ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-[#D4AF7C]/10 text-[#D4AF7C] mt-0.5">
          <Trophy className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-['Montserrat',sans-serif] font-bold text-base text-[#F5F5F5] group-hover:text-[#D4AF7C] transition-colors">
            {title}
          </h3>
          <div className="text-xs text-[#A0A6B0] flex flex-wrap items-center gap-2 pt-1 font-['Poppins',sans-serif]">
            <span>{date}</span>
            <span>•</span>
            <span>{venue}</span>
            <span>•</span>
            <span className="text-[#D4AF7C] font-medium">{status}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
        <button
          onClick={onViewDetails}
          type="button"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#D4AF7C] hover:text-[#E6C98A] transition-colors group-hover:translate-x-0.5 transform duration-150 cursor-pointer"
        >
          <span>View details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
