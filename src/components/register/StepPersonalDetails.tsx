"use client";

import React, { useState } from 'react';
import { User, Mail, Check, AlertCircle } from 'lucide-react';

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
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Validation checkers
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const isPhoneValid = /^[0-9+ -]{10,14}$/.test(formData.phone.trim());
  const isNameValid = formData.fullName.trim().length >= 2;
  const isRollValid = formData.rollNumber.trim().length >= 3;
  const isDeptValid = formData.department.trim().length >= 2;
  const isInstValid = formData.institution.trim().length >= 3;

  const getInputStatusClass = (field: string, isValid: boolean, isRequired: boolean) => {
    const isDirty = touched[field] || Boolean(formData[field as keyof typeof formData]);
    if (!isDirty) return 'border-white/10 focus:border-[#D4AF7C] focus:ring-1 focus:ring-[#D4AF7C]';
    if (isValid) return 'border-emerald-500/50 bg-emerald-950/10 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400';
    if (isRequired) return 'border-red-500/60 bg-red-950/10 focus:border-red-400 focus:ring-1 focus:ring-red-400';
    return 'border-white/10 focus:border-[#D4AF7C]';
  };

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
              <div className="flex items-center justify-between text-[11px] font-medium text-[#A0A6B0]">
                <label htmlFor="reg-fullName">
                  Full Legal Name {isFieldRequired('fullName') && '*'}
                </label>
                {formData.fullName && (
                  <span className={isNameValid ? 'text-emerald-400 text-[10px] flex items-center gap-0.5' : 'text-red-400 text-[10px]'}>
                    {isNameValid ? <><Check className="w-3 h-3" /> Valid</> : 'Too short'}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="reg-fullName"
                  type="text"
                  required={isFieldRequired('fullName')}
                  placeholder="e.g. Viswanathan Anand"
                  value={formData.fullName}
                  onBlur={() => handleBlur('fullName')}
                  onChange={(e) => onFieldChange('fullName', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 focus:outline-none transition shadow-inner ${getInputStatusClass('fullName', isNameValid, isFieldRequired('fullName'))}`}
                />
              </div>
            </div>
          )}

          {isFieldEnabled('rollNumber') && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-medium text-[#A0A6B0]">
                <label htmlFor="reg-rollNumber">
                  College Roll / Registration ID {isFieldRequired('rollNumber') && '*'}
                </label>
                {formData.rollNumber && (
                  <span className={isRollValid ? 'text-emerald-400 text-[10px] flex items-center gap-0.5' : 'text-red-400 text-[10px]'}>
                    {isRollValid ? <><Check className="w-3 h-3" /> Valid</> : 'Min 3 chars'}
                  </span>
                )}
              </div>
              <input
                id="reg-rollNumber"
                type="text"
                required={isFieldRequired('rollNumber')}
                placeholder="e.g. 23101104"
                value={formData.rollNumber}
                onBlur={() => handleBlur('rollNumber')}
                onChange={(e) => onFieldChange('rollNumber', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 font-mono focus:outline-none transition shadow-inner ${getInputStatusClass('rollNumber', isRollValid, isFieldRequired('rollNumber'))}`}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {isFieldEnabled('department') && (
            <div className="space-y-1.5">
              <label htmlFor="reg-department" className="text-[11px] font-medium text-[#A0A6B0] block">
                Department / Branch {isFieldRequired('department') && '*'}
              </label>
              <input
                id="reg-department"
                type="text"
                required={isFieldRequired('department')}
                placeholder="e.g. Computer Science"
                value={formData.department}
                onBlur={() => handleBlur('department')}
                onChange={(e) => onFieldChange('department', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 focus:outline-none transition shadow-inner ${getInputStatusClass('department', isDeptValid, isFieldRequired('department'))}`}
              />
            </div>
          )}

          {isFieldEnabled('year') && (
            <div className="space-y-1.5">
              <label htmlFor="reg-year" className="text-[11px] font-medium text-[#A0A6B0] block">
                Year of Study {isFieldRequired('year') && '*'}
              </label>
              <select
                id="reg-year"
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
              <label htmlFor="reg-institution" className="text-[11px] font-medium text-[#A0A6B0] block">
                Institution / College {isFieldRequired('institution') && '*'}
              </label>
              <input
                id="reg-institution"
                type="text"
                required={isFieldRequired('institution')}
                placeholder="e.g. JGEC"
                value={formData.institution}
                onBlur={() => handleBlur('institution')}
                onChange={(e) => onFieldChange('institution', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 focus:outline-none transition shadow-inner ${getInputStatusClass('institution', isInstValid, isFieldRequired('institution'))}`}
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
                <div className="flex items-center justify-between text-[11px] font-medium text-[#A0A6B0]">
                  <label htmlFor="reg-email">
                    Email Address {isFieldRequired('email') && '*'}
                  </label>
                  {formData.email && (
                    <span className={isEmailValid ? 'text-emerald-400 text-[10px] flex items-center gap-0.5' : 'text-red-400 text-[10px]'}>
                      {isEmailValid ? <><Check className="w-3 h-3" /> Valid format</> : 'Invalid email'}
                    </span>
                  )}
                </div>
                <input
                  id="reg-email"
                  type="email"
                  required={isFieldRequired('email')}
                  placeholder="player@jgec.ac.in"
                  value={formData.email}
                  onBlur={() => handleBlur('email')}
                  onChange={(e) => onFieldChange('email', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 focus:outline-none transition shadow-inner ${getInputStatusClass('email', isEmailValid, isFieldRequired('email'))}`}
                />
              </div>
            )}

            {isFieldEnabled('phone') && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-medium text-[#A0A6B0]">
                  <label htmlFor="reg-phone">
                    WhatsApp / Phone Number {isFieldRequired('phone') && '*'}
                  </label>
                  {formData.phone && (
                    <span className={isPhoneValid ? 'text-emerald-400 text-[10px] flex items-center gap-0.5' : 'text-red-400 text-[10px]'}>
                      {isPhoneValid ? <><Check className="w-3 h-3" /> Valid phone</> : 'Min 10 digits'}
                    </span>
                  )}
                </div>
                <input
                  id="reg-phone"
                  type="tel"
                  required={isFieldRequired('phone')}
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onBlur={() => handleBlur('phone')}
                  onChange={(e) => onFieldChange('phone', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 focus:outline-none transition shadow-inner ${getInputStatusClass('phone', isPhoneValid, isFieldRequired('phone'))}`}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
