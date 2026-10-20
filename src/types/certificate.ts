export type CertificateRole =
  | 'winner'
  | 'runner_up'
  | 'second_runner_up'
  | 'top_board'
  | 'merit'
  | 'participant';

export interface CertificateData {
  certificate_id: string; // e.g. "CERT-JGEC-TOURN1-REG101"
  tournament_id: string;
  tournament_title: string;
  tournament_date: string;
  recipient_name: string;
  recipient_department?: string;
  recipient_college?: string;
  registration_id?: string;
  role: CertificateRole;
  rank?: number;
  total_participants?: number;
  arbiter_name: string;
  convenor_name?: string;
  issued_at: string;
  verification_hash: string;
  verification_url: string;
}

export interface CertificateVerificationPayload {
  certificate_id: string;
  tournament_id: string;
  recipient_name: string;
  role: CertificateRole;
  issued_at: string;
}

export interface CertificateVerificationResult {
  valid: boolean;
  certificate?: CertificateData;
  error?: string;
}
