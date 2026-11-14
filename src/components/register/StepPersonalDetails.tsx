"use client";

import React, { useState } from 'react';
import { User, Mail, Check } from 'lucide-react';

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
  isFieldRequired,
}: StepPersonalDetailsProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const isPhoneValid = /^[0-9+ -]{10,14}$/.test(formData.phone.trim());
  const isNameValid = formData.fullName.trim().length >= 2;
  const isRollValid = formData.rollNumber.trim().length >= 3;
  const isDeptValid = formData.department.trim().length >= 2;
  const isInstValid = formData.institution.trim().length >= 3;

  const getInputStatusClass = (field: string, isValid: boolean, isRequired: boolean) => {
    const isDirty = touched[field] || Boolean(formData[field as keyof typeof formData]);
    if (!isDirty) return 'border-border focus:border-border-strong';
    if (isValid) return 'border-success/60 focus:border-success';
    if (isRequired) return 'border-danger/60 focus:border-danger';
    return 'border-border focus:border-border-strong';
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-fg flex items-center gap-2">
            <User className="w-4 h-4 text-accent" aria-hidden="true" />
            <span>Player Credentials</span>
          </h3>
          <span className="text-[10px] font-mono text-fg-muted">* Required fields</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isFieldEnabled('fullName') && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-medium text-fg-muted">
                <label htmlFor="reg-fullName">
                  Full Legal Name {isFieldRequired('fullName') && '*'}
                </label>
                {formData.fullName && (
                  <span className={isNameValid ? 'text-success font-mono text-[10px] flex items-center gap-0.5' : 'text-danger font-mono text-[10px]'}>
                    {isNameValid ? <><Check className="w-3 h-3" /> Valid</> : 'Too short'}
                  </span>
                )}
              </div>
              <input
                id="reg-fullName"
                type="text"
                required={isFieldRequired('fullName')}
                placeholder="e.g. Viswanathan Anand"
                value={formData.fullName}
                onBlur={() => handleBlur('fullName')}
                onChange={(e) => onFieldChange('fullName', e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-sm bg-bg border text-xs text-fg placeholder:text-fg-subtle transition-colors ${getInputStatusClass('fullName', isNameValid, isFieldRequired('fullName'))}`}
              />
            </div>
          )}

          {isFieldEnabled('rollNumber') && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-medium text-fg-muted">
                <label htmlFor="reg-rollNumber">
                  College Roll / Registration ID {isFieldRequired('rollNumber') && '*'}
                </label>
                {formData.rollNumber && (
                  <span className={isRollValid ? 'text-success font-mono text-[10px] flex items-center gap-0.5' : 'text-danger font-mono text-[10px]'}>
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
                className={`w-full px-3.5 py-2.5 rounded-sm bg-bg border text-xs text-fg placeholder:text-fg-subtle font-mono transition-colors ${getInputStatusClass('rollNumber', isRollValid, isFieldRequired('rollNumber'))}`}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {isFieldEnabled('department') && (
            <div className="space-y-1.5">
              <label htmlFor="reg-department" className="text-[11px] font-medium text-fg-muted block">
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
                className={`w-full px-3.5 py-2.5 rounded-sm bg-bg border text-xs text-fg placeholder:text-fg-subtle transition-colors ${getInputStatusClass('department', isDeptValid, isFieldRequired('department'))}`}
              />
            </div>
          )}

          {isFieldEnabled('year') && (
            <div className="space-y-1.5">
              <label htmlFor="reg-year" className="text-[11px] font-medium text-fg-muted block">
                Year of Study {isFieldRequired('year') && '*'}
              </label>
              <select
                id="reg-year"
                value={formData.year}
                onChange={(e) => onFieldChange('year', e.target.value)}
                className="w-full px-3 py-2.5 rounded-sm bg-bg border border-border text-xs text-fg focus:border-border-strong transition-colors cursor-pointer"
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
              <label htmlFor="reg-institution" className="text-[11px] font-medium text-fg-muted block">
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
                className={`w-full px-3.5 py-2.5 rounded-sm bg-bg border text-xs text-fg placeholder:text-fg-subtle transition-colors ${getInputStatusClass('institution', isInstValid, isFieldRequired('institution'))}`}
              />
            </div>
          )}
        </div>
      </div>

      {(isFieldEnabled('email') || isFieldEnabled('phone')) && (
        <div className="space-y-4 pt-2">
          <div className="border-b border-border pb-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-fg flex items-center gap-2">
              <Mail className="w-4 h-4 text-accent" aria-hidden="true" />
              <span>Contact Coordinates</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isFieldEnabled('email') && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-medium text-fg-muted">
                  <label htmlFor="reg-email">
                    Email Address {isFieldRequired('email') && '*'}
                  </label>
                  {formData.email && (
                    <span className={isEmailValid ? 'text-success font-mono text-[10px] flex items-center gap-0.5' : 'text-danger font-mono text-[10px]'}>
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
                  className={`w-full px-3.5 py-2.5 rounded-sm bg-bg border text-xs text-fg placeholder:text-fg-subtle transition-colors ${getInputStatusClass('email', isEmailValid, isFieldRequired('email'))}`}
                />
              </div>
            )}

            {isFieldEnabled('phone') && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-medium text-fg-muted">
                  <label htmlFor="reg-phone">
                    WhatsApp / Phone Number {isFieldRequired('phone') && '*'}
                  </label>
                  {formData.phone && (
                    <span className={isPhoneValid ? 'text-success font-mono text-[10px] flex items-center gap-0.5' : 'text-danger font-mono text-[10px]'}>
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
                  className={`w-full px-3.5 py-2.5 rounded-sm bg-bg border text-xs text-fg placeholder:text-fg-subtle transition-colors ${getInputStatusClass('phone', isPhoneValid, isFieldRequired('phone'))}`}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
