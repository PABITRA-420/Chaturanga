'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CertificateData, CertificateRole } from '@/types/certificate';
import { getCertificatesByTournament } from '@/lib/certificateStore';
import { generateBulkCertificatesPdf, BulkExportProgress } from '@/lib/bulkCertificateExport';
import CertificateModal from '@/components/certificates/CertificateModal';
import {
  Award,
  Download,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface AdminCertificatesTabProps {
  tournaments: any[];
}

export default function AdminCertificatesTab({ tournaments }: AdminCertificatesTabProps) {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
    tournaments[0]?.id || 'CHTR-04'
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal & Export States
  const [previewCert, setPreviewCert] = useState<CertificateData | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<BulkExportProgress | null>(null);

  // Load certificates for current tournament
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const data = await getCertificatesByTournament(selectedTournamentId);
        if (isMounted) {
          setCertificates(data);
        }
      } catch (err) {
        console.error('Failed to load certificates:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedTournamentId]);

  // Unique departments for filter dropdown
  const departments = useMemo(() => {
    const deps = new Set<string>();
    certificates.forEach((c) => {
      if (c.recipient_department) deps.add(c.recipient_department);
    });
    return Array.from(deps);
  }, [certificates]);

  // Filtered certificates
  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      if (selectedDepartment !== 'all' && cert.recipient_department !== selectedDepartment) {
        return false;
      }
      if (selectedRole !== 'all') {
        if (selectedRole === 'podium') {
          if (!['winner', 'runner_up', 'second_runner_up'].includes(cert.role)) return false;
        } else if (cert.role !== selectedRole) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = cert.recipient_name.toLowerCase().includes(query);
        const matchesSerial = cert.certificate_id.toLowerCase().includes(query);
        const matchesDep = (cert.recipient_department || '').toLowerCase().includes(query);
        if (!matchesName && !matchesSerial && !matchesDep) return false;
      }
      return true;
    });
  }, [certificates, selectedDepartment, selectedRole, searchQuery]);

  // Bulk export handlers
  const handleExportAll = async () => {
    if (filteredCertificates.length === 0) return;
    setIsExporting(true);
    setExportProgress({ current: 0, total: filteredCertificates.length, percent: 0, recipientName: '' });
    try {
      await generateBulkCertificatesPdf(
        filteredCertificates,
        (progress) => setExportProgress(progress),
        `${selectedTournamentId}_All_Certificates.pdf`
      );
    } catch (err) {
      console.error('Bulk export failed:', err);
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const handleExportPodium = async () => {
    const podiumCerts = certificates.filter((c) =>
      ['winner', 'runner_up', 'second_runner_up'].includes(c.role)
    );
    if (podiumCerts.length === 0) return;
    setIsExporting(true);
    setExportProgress({ current: 0, total: podiumCerts.length, percent: 0, recipientName: '' });
    try {
      await generateBulkCertificatesPdf(
        podiumCerts,
        (progress) => setExportProgress(progress),
        `${selectedTournamentId}_Podium_Certificates.pdf`
      );
    } catch (err) {
      console.error('Podium export failed:', err);
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const getRoleBadge = (role: CertificateRole) => {
    switch (role) {
      case 'winner':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-mono font-bold bg-accent/15 text-accent border border-accent/30">
            <Sparkles className="w-3 h-3 mr-1" /> Champion (1st)
          </span>
        );
      case 'runner_up':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-mono font-semibold bg-surface-elevated text-fg border border-border-strong">
            Runner-up (2nd)
          </span>
        );
      case 'second_runner_up':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-mono font-semibold bg-warning/15 text-warning border border-warning/30">
            3rd Place
          </span>
        );
      case 'top_board':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-mono font-semibold bg-info/15 text-info border border-info/30">
            Top Board
          </span>
        );
      case 'merit':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-mono font-semibold bg-success/15 text-success border border-success/30">
            Merit
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-mono font-medium bg-surface-elevated border border-border text-fg-muted">
            Participant
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-md p-4 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-sm bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-fg-muted font-medium">Issued In Event</span>
            <p className="text-xl font-heading font-bold text-fg tabular-nums">{certificates.length}</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-md p-4 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-sm bg-success/10 border border-success/30 flex items-center justify-center text-success">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-fg-muted font-medium">Cryptographically Signed</span>
            <p className="text-xl font-heading font-bold text-fg tabular-nums">100%</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-md p-4 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-sm bg-info/10 border border-info/30 flex items-center justify-center text-info">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-fg-muted font-medium">Matching Filter</span>
            <p className="text-xl font-heading font-bold text-fg tabular-nums">{filteredCertificates.length}</p>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Export Actions */}
      <div className="bg-surface border border-border rounded-md p-4 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Tournament Selector */}
          <select
            value={selectedTournamentId}
            onChange={(e) => setSelectedTournamentId(e.target.value)}
            className="bg-surface-elevated border border-border text-xs font-semibold text-fg rounded-sm px-3 py-2 focus:border-accent transition-colors"
            aria-label="Select Tournament"
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id} className="bg-surface text-fg">
                {t.title}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="bg-surface-elevated border border-border text-xs text-fg rounded-sm px-3 py-2 focus:border-accent transition-colors"
            aria-label="Filter Department"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-surface-elevated border border-border text-xs text-fg rounded-sm px-3 py-2 focus:border-accent transition-colors"
            aria-label="Filter Role"
          >
            <option value="all">All Award Categories</option>
            <option value="podium">Podium Winners (Top 3)</option>
            <option value="winner">Winner (1st)</option>
            <option value="runner_up">Runner-up (2nd)</option>
            <option value="second_runner_up">3rd Place</option>
            <option value="merit">Merit</option>
            <option value="participant">Participant</option>
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-fg-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search player or serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-surface-elevated border border-border text-xs text-fg placeholder:text-fg-subtle rounded-sm pl-8 pr-3 py-2 focus:border-accent w-48 transition-colors"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={handleExportPodium}
            disabled={isExporting || certificates.length === 0}
            className="inline-flex items-center px-3.5 py-2 rounded-sm text-xs font-semibold text-fg bg-surface-elevated hover:bg-surface-subtle border border-border transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 mr-1.5 text-accent" />
            Export Podium Only (PDF)
          </button>

          <button
            type="button"
            onClick={handleExportAll}
            disabled={isExporting || filteredCertificates.length === 0}
            className="inline-flex items-center px-4 py-2 rounded-sm text-xs font-heading font-semibold text-on-accent bg-accent hover:bg-accent-hover transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export All Matching ({filteredCertificates.length})
          </button>
        </div>
      </div>

      {/* Participants & Certificates Table */}
      <div className="bg-surface border border-border rounded-md overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated border-b border-border text-fg-muted font-mono uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Participant</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Award Tier</th>
                <th className="py-3 px-4">Certificate Serial</th>
                <th className="py-3 px-4">Integrity Hash</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-fg-muted">
                    <Loader2 className="w-6 h-6 animate-spin text-accent mx-auto mb-2" />
                    <span className="font-mono">Loading certificate registry...</span>
                  </td>
                </tr>
              ) : filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-fg-muted">
                    No certificate records match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((cert) => (
                  <tr key={cert.certificate_id} className="hover:bg-surface-elevated/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-fg">
                      {cert.recipient_name}
                      {cert.rank ? <span className="text-[10px] font-mono text-fg-muted font-normal ml-1.5">(Rank #{cert.rank})</span> : ''}
                    </td>
                    <td className="py-3.5 px-4 text-fg-muted">
                      {cert.recipient_department || 'General'}
                    </td>
                    <td className="py-3.5 px-4">{getRoleBadge(cert.role)}</td>
                    <td className="py-3.5 px-4 font-mono text-fg-muted text-[11px] tabular-nums">
                      {cert.certificate_id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-success">
                      {cert.verification_hash ? `${cert.verification_hash.substring(0, 16)}...` : 'Pending'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setPreviewCert(cert)}
                        className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-semibold text-fg bg-surface-elevated hover:bg-surface-subtle border border-border transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-accent" />
                        Preview
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Export Progress Modal Overlay */}
      {isExporting && exportProgress && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Compiling Consolidated PDF Book"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
        >
          <div className="bg-surface border border-border-strong rounded-md p-6 shadow-md max-w-md w-full space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-sm bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold text-fg">Compiling Consolidated PDF Book</h3>
                <p className="text-xs font-mono text-fg-muted tabular-nums">
                  Processing certificate {exportProgress.current} of {exportProgress.total}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-surface-subtle rounded-xs h-2.5 overflow-hidden border border-border">
              <div
                className="bg-accent h-full transition-all duration-150"
                style={{ width: `${exportProgress.percent}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs text-fg-muted">
              <span className="truncate max-w-[240px] text-fg">{exportProgress.recipientName}</span>
              <span className="font-mono font-bold text-fg tabular-nums">{exportProgress.percent}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Individual Certificate Preview Modal */}
      <CertificateModal
        isOpen={!!previewCert}
        onClose={() => setPreviewCert(null)}
        certificate={previewCert}
      />
    </div>
  );
}
