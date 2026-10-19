"use client";

import React from 'react';
import { User, Mail } from 'lucide-react';

export interface StepPersonalDetailsProps {
  formData: {
    fullName: string;
    rollNumber: string;
    department: string;
    year: string;
    institution: string;
    email: string;
    phone: string;
  };
  onFieldChange: (field: string, val: string) => void;
  isFieldEnabled: (fieldId: string) => boolean;
  isFieldRequired: (fieldId: string) => boolean;
}

export default function StepPersonalDetails({
  formData,
  onFieldChange,
  isFieldEnabled,
  isFieldRequired
}: StepPersonalDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Part 1: Player Identity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F5] flex items-center gap-2">
            <User className="w-4 h-4 text-[#D4AF7C]" />
            <span>Player Credentials</span>
          </h3>
          <span className="text-[10px] text-[#A0A6B0]">* Required fields</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isFieldEnabled('fullName') && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[#A0A6B0]">
                Full Legal Name {isFieldRequired('fullName') && '*'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required={isFieldRequired('fullName')}
                  placeholder="e.g. Viswanathan Anand"
                  value={formData.fullName}
                  onChange={(e) => onFieldChange('fullName', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 focus:outline-none focus:border-[#D4AF7C] focus:ring-1 focus:ring-[#D4AF7C] transition shadow-inner"
                />
              </div>
            </div>
          )}

          {isFieldEnabled('rollNumber') && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[#A0A6B0]">
                College Roll / Registration ID {isFieldRequired('rollNumber') && '*'}
              </label>
              <input
                type="text"
                required={isFieldRequired('rollNumber')}
                placeholder="e.g. 23101104"
                value={formData.rollNumber}
                onChange={(e) => onFieldChange('rollNumber', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 font-mono focus:outline-none focus:border-[#D4AF7C] focus:ring-1 focus:ring-[#D4AF7C] transition shadow-inner"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {isFieldEnabled('department') && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[#A0A6B0]">
                Department / Branch {isFieldRequired('department') && '*'}
              </label>
              <input
                type="text"
                required={isFieldRequired('department')}
                placeholder="e.g. Computer Science & Engineering"
                value={formData.department}
                onChange={(e) => onFieldChange('department', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 focus:outline-none focus:border-[#D4AF7C] transition shadow-inner"
              />
            </div>
          )}

          {isFieldEnabled('year') && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[#A0A6B0]">
                Year of Study {isFieldRequired('year') && '*'}
              </label>
              <select
                value={formData.year}
                onChange={(e) => onFieldChange('year', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B0F14] border border-white/10 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C] transition cursor-pointer"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate / Alumni">PG / Alumni</option>
              </select>
            </div>
          )}

          {isFieldEnabled('institution') && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[#A0A6B0]">
                Institution / College {isFieldRequired('institution') && '*'}
              </label>
              <input
                type="text"
                required={isFieldRequired('institution')}
                placeholder="e.g. Jalpaiguri Government Engineering College"
                value={formData.institution}
                onChange={(e) => onFieldChange('institution', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 focus:outline-none focus:border-[#D4AF7C] transition shadow-inner"
              />
            </div>
          )}
        </div>
      </div>

      {/* Part 2: Contact Coordinates */}
      {(isFieldEnabled('email') || isFieldEnabled('phone')) && (
        <div className="space-y-4 pt-2">
          <div className="border-b border-white/10 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F5] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#D4AF7C]" />
              <span>Contact Coordinates</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isFieldEnabled('email') && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#A0A6B0]">
                  Email Address {isFieldRequired('email') && '*'}
                </label>
                <input
                  type="email"
                  required={isFieldRequired('email')}
                  placeholder="player@jgec.ac.in"
                  value={formData.email}
                  onChange={(e) => onFieldChange('email', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 focus:outline-none focus:border-[#D4AF7C] transition shadow-inner"
                />
              </div>
            )}

            {isFieldEnabled('phone') && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#A0A6B0]">
                  WhatsApp / Phone Number {isFieldRequired('phone') && '*'}
                </label>
                <input
                  type="tel"
                  required={isFieldRequired('phone')}
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => onFieldChange('phone', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 focus:outline-none focus:border-[#D4AF7C] transition shadow-inner"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
