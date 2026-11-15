"use client";

import React, { useState, useEffect } from 'react';
import { 
  Tournament, 
  TournamentStatus, 
  DEFAULT_FORM_FIELDS,
  FormFieldConfig,
  CustomField
} from '@/types/tournament';
import { 
  Edit, 
  Plus, 
  SlidersHorizontal, 
  Camera, 
  Trash2, 
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  Check
} from 'lucide-react';

export interface TournamentFormModalProps {
  isOpen: boolean;
  editingTournament: Tournament | null;
  onClose: () => void;
  onSave: (data: Partial<Tournament>) => Promise<void>;
  onNavigateToMedia?: () => void;
  initialDraft?: {
    formData: Partial<Tournament>;
    editingTournamentId: string | null;
    editorActiveTab: 'basics' | 'registration' | 'form' | 'rules';
  } | null;
  onDraftChange?: (draft: {
    formData: Partial<Tournament>;
    editingTournamentId: string | null;
    editorActiveTab: 'basics' | 'registration' | 'form' | 'rules';
  } | null) => void;
}

export default function TournamentFormModal({
  isOpen,
  editingTournament,
  onClose,
  onSave,
  onNavigateToMedia,
  initialDraft,
  onDraftChange
}: TournamentFormModalProps) {
  const [editorActiveTab, setEditorActiveTab] = useState<'basics' | 'registration' | 'form' | 'rules'>('basics');
  const [savingTournament, setSavingTournament] = useState(false);
  const [editorError, setEditorError] = useState('');

  const [formData, setFormData] = useState<Partial<Tournament>>({
    title: '',
    date: '',
    targetDate: '',
    time: '10:00 AM – 06:00 PM IST',
    venue: 'Main Auditorium, JGEC Campus',
    format: '7 Rounds Swiss System • Rapid (15m + 10s)',
    prizePool: '₹25,000 + Trophies',
    slots: '128 Max Slots',
    maxSlots: 128,
    isFeatured: false,
    description: '',
    status: 'open',
    registrationStartDate: '',
    registrationEndDate: '',
    entryFee: 'Free for JGEC • ₹100 External',
    arbiterName: '',
    contactEmail: 'tournaments@chaturanga-jgec.ac.in',
    contactPhone: '',
    fairPlayNotice: 'Standard FIDE Anti-Cheating and Digital Clock Regulations apply.',
    formConfig: JSON.parse(JSON.stringify(DEFAULT_FORM_FIELDS)),
    customFields: []
  });

  const [newCustomQuestion, setNewCustomQuestion] = useState({
    label: '',
    type: 'text' as 'text' | 'select' | 'checkbox',
    required: false,
    optionsString: ''
  });
  const [showAddQuestionRow, setShowAddQuestionRow] = useState(false);

  useEffect(() => {
    if (initialDraft && initialDraft.editingTournamentId === (editingTournament?.id || null)) {
      setFormData(initialDraft.formData);
      setEditorActiveTab(initialDraft.editorActiveTab);
    } else if (editingTournament) {
      setFormData({
        ...editingTournament,
        formConfig: editingTournament.formConfig || JSON.parse(JSON.stringify(DEFAULT_FORM_FIELDS)),
        customFields: editingTournament.customFields || []
      });
      setEditorActiveTab('basics');
    } else {
      setFormData({
        title: '',
        date: '',
        targetDate: '',
        time: '10:00 AM – 06:00 PM IST',
        venue: 'Main Auditorium, JGEC Campus',
        format: '7 Rounds Swiss System • Rapid (15m + 10s)',
        prizePool: '₹25,000 + Trophies',
        slots: '128 Max Slots',
        maxSlots: 128,
        isFeatured: false,
        description: '',
        status: 'open',
        registrationStartDate: '',
        registrationEndDate: '',
        entryFee: 'Free for JGEC • ₹100 External',
        arbiterName: '',
        contactEmail: 'tournaments@chaturanga-jgec.ac.in',
        contactPhone: '',
        fairPlayNotice: 'Standard FIDE Anti-Cheating and Digital Clock Regulations apply.',
        formConfig: JSON.parse(JSON.stringify(DEFAULT_FORM_FIELDS)),
        customFields: []
      });
      setEditorActiveTab('basics');
    }
  }, [editingTournament, initialDraft, isOpen]);

  // Sync draft back to parent when form changes
  const updateFormData = (updater: (prev: Partial<Tournament>) => Partial<Tournament>) => {
    setFormData(prev => {
      const next = updater(prev);
      if (onDraftChange) {
        onDraftChange({
          formData: next,
          editingTournamentId: editingTournament?.id || null,
          editorActiveTab
        });
      }
      return next;
    });
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTournament(true);
    setEditorError('');

    try {
      if (!formData.title?.trim() || !formData.venue?.trim()) {
        throw new Error('Title and Venue are required.');
      }
      await onSave(formData);
      if (onDraftChange) onDraftChange(null);
      onClose();
    } catch (err: any) {
      setEditorError(err.message || 'Failed to save tournament.');
    } finally {
      setSavingTournament(false);
    }
  };

  const handleAddCustomQuestion = () => {
    if (!newCustomQuestion.label.trim()) return;
    const options = newCustomQuestion.type === 'select'
      ? newCustomQuestion.optionsString.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    const newField: CustomField = {
      id: `custom_${Date.now()}`,
      label: newCustomQuestion.label.trim(),
      type: newCustomQuestion.type,
      required: newCustomQuestion.required,
      options
    };

    updateFormData(prev => ({
      ...prev,
      customFields: [...(prev.customFields || []), newField]
    }));

    setNewCustomQuestion({
      label: '',
      type: 'text',
      required: false,
      optionsString: ''
    });
    setShowAddQuestionRow(false);
  };

  const handleRemoveCustomQuestion = (id: string) => {
    updateFormData(prev => ({
      ...prev,
      customFields: (prev.customFields || []).filter(f => f.id !== id)
    }));
  };

  const toggleFieldEnabled = (fieldId: string) => {
    updateFormData(prev => ({
      ...prev,
      formConfig: (prev.formConfig || DEFAULT_FORM_FIELDS).map(f =>
        f.id === fieldId ? { ...f, enabled: !f.enabled } : f
      )
    }));
  };

  const toggleFieldRequired = (fieldId: string) => {
    updateFormData(prev => ({
      ...prev,
      formConfig: (prev.formConfig || DEFAULT_FORM_FIELDS).map(f =>
        f.id === fieldId ? { ...f, required: !f.required } : f
      )
    }));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={editingTournament ? `Edit Tournament: ${formData.title}` : 'Create New Tournament'}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-surface rounded-md border border-border-strong p-6 sm:p-8 space-y-6 shadow-md my-auto max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
              {editingTournament ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-bold text-fg">
                  {editingTournament ? `Edit Tournament: ${formData.title}` : 'Create New Tournament'}
                </h3>
              </div>
              <p className="text-xs text-fg-muted">
                {editingTournament ? 'Modify schedule, capacity, registration window, and custom form fields.' : 'Configure official tournament details, timetable, and registration schema.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-sm bg-surface-elevated hover:bg-surface-subtle text-fg-muted hover:text-fg flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Sub-tabs for modal */}
        <div className="flex items-center gap-2 border-b border-border pb-3 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setEditorActiveTab('basics')}
            className={`px-3.5 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
              editorActiveTab === 'basics'
                ? 'bg-accent text-on-accent'
                : 'text-fg-muted hover:text-fg bg-surface-elevated border border-border'
            }`}
          >
            1. Basic Info &amp; Venue
          </button>

          <button
            type="button"
            onClick={() => setEditorActiveTab('registration')}
            className={`px-3.5 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
              editorActiveTab === 'registration'
                ? 'bg-accent text-on-accent'
                : 'text-fg-muted hover:text-fg bg-surface-elevated border border-border'
            }`}
          >
            2. Registration Schedule
          </button>

          <button
            type="button"
            onClick={() => setEditorActiveTab('form')}
            className={`px-3.5 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              editorActiveTab === 'form'
                ? 'bg-accent text-on-accent'
                : 'text-fg-muted hover:text-fg bg-surface-elevated border border-border'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>3. Form Builder &amp; Fields</span>
          </button>

          <button
            type="button"
            onClick={() => setEditorActiveTab('rules')}
            className={`px-3.5 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
              editorActiveTab === 'rules'
                ? 'bg-accent text-on-accent'
                : 'text-fg-muted hover:text-fg bg-surface-elevated border border-border'
            }`}
          >
            4. Arbiter &amp; Rules
          </button>
        </div>

        {/* Form scrollable container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-5 text-xs">
          {editorError && (
            <div className="p-3 rounded-sm bg-danger/10 border border-danger/30 text-danger">
              {editorError}
            </div>
          )}

          {/* TAB 1: BASICS */}
          {editorActiveTab === 'basics' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-fg-muted font-semibold">Tournament Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JGEC Inter-College Championship 2026"
                  value={formData.title || ''}
                  onChange={(e) => updateFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-sm bg-surface-elevated border border-border text-fg placeholder:text-fg-subtle focus:border-accent text-xs transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-fg-muted font-semibold">Tournament Format</label>
                  <input
                    type="text"
                    placeholder="e.g. 7 Rounds Swiss System • Rapid (15m + 10s)"
                    value={formData.format || ''}
                    onChange={(e) => updateFormData(prev => ({ ...prev, format: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-surface-elevated border border-border text-fg placeholder:text-fg-subtle focus:border-accent text-xs transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-fg-muted font-semibold">Venue / Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Auditorium, JGEC Campus"
                    value={formData.venue || ''}
                    onChange={(e) => updateFormData(prev => ({ ...prev, venue: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-surface-elevated border border-border text-fg placeholder:text-fg-subtle focus:border-accent text-xs transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-fg-muted font-semibold">Display Date</label>
                  <input
                    type="text"
                    placeholder="e.g. November 07, 2026"
                    value={formData.date || ''}
                    onChange={(e) => updateFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-surface-elevated border border-border text-fg placeholder:text-fg-subtle focus:border-accent text-xs transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-fg-muted font-semibold">Target Countdown ISO</label>
                  <input
                    type="datetime-local"
                    value={formData.targetDate ? formData.targetDate.slice(0, 16) : ''}
                    onChange={(e) => updateFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-surface-elevated border border-border text-fg focus:border-accent text-xs font-mono transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-fg-muted font-semibold">Daily Timing</label>
                  <input
                    type="text"
                    placeholder="e.g. 09:30 AM – 06:00 PM IST"
                    value={formData.time || ''}
                    onChange={(e) => updateFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-surface-elevated border border-border text-fg placeholder:text-fg-subtle focus:border-accent text-xs transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-fg-muted font-semibold">Max Player Slots</label>
                  <input
                    type="number"
                    placeholder="128"
                    value={formData.maxSlots || 128}
                    onChange={(e) => updateFormData(prev => ({
                      ...prev,
                      maxSlots: Number(e.target.value),
                      slots: `${e.target.value} Max Slots`
                    }))}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-surface-elevated border border-border text-fg focus:border-accent text-xs font-mono tabular-nums transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-fg-muted font-semibold">Prize Pool</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹25,000 + Trophies"
                    value={formData.prizePool || ''}
                    onChange={(e) => updateFormData(prev => ({ ...prev, prizePool: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-surface-elevated border border-border text-fg placeholder:text-fg-subtle focus:border-accent text-xs transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-fg-muted font-semibold">Entry Fee</label>
                  <input
                    type="text"
                    placeholder="e.g. Free or ₹100"
                    value={formData.entryFee || ''}
                    onChange={(e) => updateFormData(prev => ({ ...prev, entryFee: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-surface-elevated border border-border text-fg placeholder:text-fg-subtle focus:border-accent text-xs transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-fg-muted font-semibold">Description</label>
                <textarea
                  rows={3}
                  placeholder="Tournament summary, eligibility criteria, and key highlights..."
                  value={formData.description || ''}
                  onChange={(e) => updateFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-sm bg-surface-elevated border border-border text-fg placeholder:text-fg-subtle focus:border-accent text-xs resize-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* TAB 2: REGISTRATION SCHEDULE */}
          {editorActiveTab === 'registration' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-fg-muted font-semibold">Registration Status</label>
                <select
                  value={formData.status || 'open'}
                  onChange={(e) => updateFormData(prev => ({ ...prev, status: e.target.value as TournamentStatus }))}
                  className="w-full px-3.5 py-2.5 rounded-sm bg-surface-elevated border border-border text-fg focus:border-accent text-xs transition-colors"
                >
                  <option value="open">Open (Accepting Registrations)</option>
                  <option value="upcoming">Upcoming (Opening Soon)</option>
                  <option value="closing_soon">Closing Soon (Final Slots)</option>
                  <option value="closed">Closed (Full / Registration Paused)</option>
                  <option value="live">Live (Ongoing Tournament)</option>
                  <option value="completed">Completed (Archived / Past Event)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-fg-muted font-semibold">Registration Start Date</label>
                  <input
                    type="date"
                    value={formData.registrationStartDate || ''}
                    onChange={(e) => updateFormData(prev => ({ ...prev, registrationStartDate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-surface-elevated border border-border text-fg focus:border-accent text-xs font-mono transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-fg-muted font-semibold">Registration End Date</label>
                  <input
                    type="date"
                    value={formData.registrationEndDate || ''}
                    onChange={(e) => updateFormData(prev => ({ ...prev, registrationEndDate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-surface-elevated border border-border text-fg focus:border-accent text-xs font-mono transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={Boolean(formData.isFeatured)}
                  onChange={(e) => updateFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="rounded-xs border-border-strong text-accent accent-accent cursor-pointer"
                />
                <label htmlFor="featuredToggle" className="text-fg font-medium cursor-pointer">
                  Feature this tournament on homepage hero ticker
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: FORM BUILDER & CUSTOM FIELDS */}
          {editorActiveTab === 'form' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-heading text-sm font-bold text-fg mb-1">Standard Participant Fields</h4>
                <p className="text-xs text-fg-muted mb-3">
                  Toggle which default fields are enabled or required on the student signup wizard.
                </p>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {(formData.formConfig || DEFAULT_FORM_FIELDS).map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-2.5 rounded-sm bg-surface-elevated border border-border"
                    >
                      <div>
                        <span className="text-fg font-semibold text-xs">{field.label}</span>
                        <span className="text-[10px] font-mono text-fg-muted block">{field.id}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleFieldRequired(field.id)}
                          className={`px-2 py-0.5 rounded-xs text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                            field.required ? 'bg-accent/15 text-accent' : 'text-fg-muted hover:text-fg'
                          }`}
                        >
                          {field.required ? 'Required' : 'Optional'}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleFieldEnabled(field.id)}
                          className="text-accent hover:text-accent-hover cursor-pointer"
                          aria-label={`Toggle ${field.label}`}
                        >
                          {field.enabled ? <ToggleRight className="w-5 h-5 text-success" /> : <ToggleLeft className="w-5 h-5 text-fg-subtle" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Questions Section */}
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-heading text-sm font-bold text-fg">Custom Tournament Questions</h4>
                  <button
                    type="button"
                    onClick={() => setShowAddQuestionRow(!showAddQuestionRow)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-[11px] font-semibold bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                {showAddQuestionRow && (
                  <div className="p-3 rounded-sm bg-surface-elevated border border-accent/30 space-y-3 mb-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-mono text-fg-muted">Question Prompt</label>
                        <input
                          type="text"
                          placeholder="e.g. Do you require campus hostel stay?"
                          value={newCustomQuestion.label}
                          onChange={(e) => setNewCustomQuestion({ ...newCustomQuestion, label: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-sm bg-surface border border-border text-fg placeholder:text-fg-subtle text-xs focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-fg-muted">Question Type</label>
                        <select
                          value={newCustomQuestion.type}
                          onChange={(e) => setNewCustomQuestion({ ...newCustomQuestion, type: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 rounded-sm bg-surface border border-border text-fg text-xs focus:border-accent"
                        >
                          <option value="text">Text Input</option>
                          <option value="select">Dropdown Select</option>
                          <option value="checkbox">Checkbox (Yes/No)</option>
                        </select>
                      </div>
                    </div>

                    {newCustomQuestion.type === 'select' && (
                      <div>
                        <label className="text-[10px] font-mono text-fg-muted">Options (comma-separated)</label>
                        <input
                          type="text"
                          placeholder="e.g. Small, Medium, Large, XL"
                          value={newCustomQuestion.optionsString}
                          onChange={(e) => setNewCustomQuestion({ ...newCustomQuestion, optionsString: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-sm bg-surface border border-border text-fg placeholder:text-fg-subtle text-xs focus:border-accent"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-1.5 text-xs text-fg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newCustomQuestion.required}
                          onChange={(e) => setNewCustomQuestion({ ...newCustomQuestion, required: e.target.checked })}
                          className="rounded-xs text-accent accent-accent"
                        />
                        <span>Mandatory Question</span>
                      </label>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddQuestionRow(false)}
                          className="px-2.5 py-1 text-xs text-fg-muted hover:text-fg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddCustomQuestion}
                          className="px-3 py-1 rounded-xs bg-accent text-on-accent font-semibold text-xs hover:bg-accent-hover cursor-pointer"
                        >
                          Add Field
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* List of custom questions */}
                {(formData.customFields || []).length > 0 ? (
                  <div className="space-y-2">
                    {(formData.customFields || []).map((field) => (
                      <div key={field.id} className="flex items-center justify-between p-2.5 rounded-sm bg-surface-elevated border border-border">
                        <div>
                          <span className="text-fg font-medium text-xs">{field.label}</span>
                          <span className="text-[10px] font-mono text-fg-muted block">Type: {field.type} {field.required ? '• Required' : '• Optional'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomQuestion(field.id)}
                          className="text-danger hover:text-danger/80 p-1 cursor-pointer"
                          aria-label={`Remove question ${field.label}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-fg-muted italic">No custom questions configured for this event.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ARBITER & RULES */}
          {editorActiveTab === 'rules' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-fg-muted font-semibold">Chief Arbiter / Coordinator</label>
                  <input
                    type="text"
                    placeholder="e.g. IA Prof. S. Sen"
                    value={formData.arbiterName || ''}
                    onChange={(e) => updateFormData(prev => ({ ...prev, arbiterName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-surface-elevated border border-border text-fg placeholder:text-fg-subtle focus:border-accent text-xs transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-fg-muted font-semibold">Arbiter Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={formData.contactPhone || ''}
                    onChange={(e) => updateFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-surface-elevated border border-border text-fg placeholder:text-fg-subtle focus:border-accent text-xs font-mono transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-fg-muted font-semibold">Contact Email</label>
                <input
                  type="email"
                  placeholder="e.g. tournaments@chaturanga-jgec.ac.in"
                  value={formData.contactEmail || ''}
                  onChange={(e) => updateFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-sm bg-surface-elevated border border-border text-fg placeholder:text-fg-subtle focus:border-accent text-xs transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-fg-muted font-semibold">Fair Play &amp; Anti-Cheating Notice</label>
                <textarea
                  rows={3}
                  value={formData.fairPlayNotice || ''}
                  onChange={(e) => updateFormData(prev => ({ ...prev, fairPlayNotice: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-sm bg-surface-elevated border border-border text-fg placeholder:text-fg-subtle focus:border-accent text-xs resize-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Bottom modal actions */}
          <div className="pt-4 border-t border-border flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-sm text-xs font-semibold text-fg-muted hover:text-fg cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={savingTournament}
              className="px-6 py-2.5 rounded-sm text-xs font-heading font-semibold text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingTournament ? 'Saving to Database...' : editingTournament ? 'Save Changes' : 'Create Tournament'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
