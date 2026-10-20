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
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3 h-3 mr-1" /> Champion (1st)
          </span>
        );
      case 'runner_up':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-300/20 text-slate-200 border border-slate-300/30">
            Runner-up (2nd)
          </span>
        );
      case 'second_runner_up':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-700/20 text-amber-400 border border-amber-700/30">
            3rd Place
          </span>
        );
      case 'top_board':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Top Board
          </span>
        );
      case 'merit':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Merit
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-slate-300">
            Participant
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0F141C] border border-white/10 rounded-2xl p-4 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 flex items-center justify-center text-[#D4AF7C]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Issued In Event</span>
            <p className="text-xl font-bold text-white">{certificates.length}</p>
          </div>
        </div>

        <div className="bg-[#0F141C] border border-white/10 rounded-2xl p-4 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Cryptographically Signed</span>
            <p className="text-xl font-bold text-white">100%</p>
          </div>
        </div>

        <div className="bg-[#0F141C] border border-white/10 rounded-2xl p-4 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Matching Filter</span>
            <p className="text-xl font-bold text-white">{filteredCertificates.length}</p>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Export Actions */}
      <div className="bg-[#0F141C] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Tournament Selector */}
          <select
            value={selectedTournamentId}
            onChange={(e) => setSelectedTournamentId(e.target.value)}
            className="bg-[#141A24] border border-white/10 text-xs font-semibold text-white rounded-xl px-3 py-2 outline-none focus:border-[#D4AF7C]"
            aria-label="Select Tournament"
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="bg-[#141A24] border border-white/10 text-xs text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-[#D4AF7C]"
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
            className="bg-[#141A24] border border-white/10 text-xs text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-[#D4AF7C]"
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
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search player or serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#141A24] border border-white/10 text-xs text-white placeholder-slate-500 rounded-xl pl-8 pr-3 py-2 outline-none focus:border-[#D4AF7C] w-48"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportPodium}
            disabled={isExporting || certificates.length === 0}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            Export Podium Only (PDF)
          </button>

          <button
            onClick={handleExportAll}
            disabled={isExporting || filteredCertificates.length === 0}
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-[#070A0E] bg-gradient-to-r from-[#D4AF7C] to-[#E5C396] hover:brightness-110 shadow-lg shadow-[#D4AF7C]/15 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export All Matching ({filteredCertificates.length})
          </button>
        </div>
      </div>

      {/* Participants & Certificates Table */}
      <div className="bg-[#0F141C] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070A0E] border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Participant</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Award Tier</th>
                <th className="py-3 px-4">Certificate Serial</th>
                <th className="py-3 px-4">Integrity Hash</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-[#D4AF7C] mx-auto mb-2" />
                    Loading certificate registry...
                  </td>
                </tr>
              ) : filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No certificate records match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((cert) => (
                  <tr key={cert.certificate_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {cert.recipient_name}
                      {cert.rank ? <span className="text-[10px] text-slate-400 font-normal ml-1.5">(Rank #{cert.rank})</span> : ''}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {cert.recipient_department || 'General'}
                    </td>
                    <td className="py-3.5 px-4">{getRoleBadge(cert.role)}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {cert.certificate_id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-emerald-400/80">
                      {cert.verification_hash ? `${cert.verification_hash.substring(0, 16)}...` : 'Pending'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setPreviewCert(cert)}
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-[#D4AF7C]" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F141C] border border-[#D4AF7C]/30 rounded-2xl p-6 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 flex items-center justify-center text-[#D4AF7C] animate-pulse">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Compiling Consolidated PDF Book</h3>
                <p className="text-xs text-slate-400">
                  Processing certificate {exportProgress.current} of {exportProgress.total}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-black/50 rounded-full h-3 overflow-hidden border border-white/10">
              <div
                className="bg-gradient-to-r from-[#D4AF7C] to-emerald-400 h-full transition-all duration-150"
                style={{ width: `${exportProgress.percent}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400">
              <span className="truncate max-w-[240px] text-slate-300">{exportProgress.recipientName}</span>
              <span className="font-mono font-bold text-white">{exportProgress.percent}%</span>
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
