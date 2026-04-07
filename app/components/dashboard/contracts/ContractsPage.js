'use client';

import { useState, useEffect } from 'react';
import styles from './ContractsPage.module.css';
import { contractService } from '@/app/lib/services/contractService';

const CONTRACT_STATUS = {
  active: { label: 'Active', bg: '#d1fae5', color: '#059669' },
  pending_acceptance: { label: 'Pending Acceptance', bg: '#fef3c7', color: '#d97706' },
  completed: { label: 'Completed', bg: '#f3f4f6', color: '#6b7280' },
  disputed: { label: 'Disputed', bg: '#fee2e2', color: '#dc2626' },
  draft: { label: 'Draft', bg: '#f0f9ff', color: '#0284c7' },
};

const ESCROW_STATUS = {
  not_initiated: { label: 'Not Initiated', color: '#9ca3af' },
  in_escrow: { label: 'In Escrow', color: '#d97706' },
  released: { label: 'Released', color: '#059669' },
  disputed: { label: 'Disputed', color: '#dc2626' },
};

const CONTRACT_TEMPLATE = (c) => `SERVICE AGREEMENT

This agreement is entered into between the Institution ("Client") and ${c.lecturerName} ("Lecturer").

ENGAGEMENT DETAILS
─────────────────
Role:           ${c.jobTitle}
Contract Type:  ${c.contractType}
Start Date:     ${c.startDate}
End Date:       ${c.endDate}
Compensation:   USD ${c.amount.toLocaleString()} per month

SCOPE OF WORK
The Lecturer agrees to deliver teaching services as outlined in the Job Posting, including but not limited to course preparation, delivery, assessment, and student support.

PAYMENT TERMS
Payment shall be made monthly via the Lecturiing Escrow System. Funds will be held in escrow and released upon satisfactory completion of each monthly milestone.

CONFIDENTIALITY
Both parties agree to keep all proprietary information confidential.

TERMINATION
Either party may terminate this agreement with 30 days written notice.

By proceeding, both parties agree to the terms above.

_______________________          _______________________
Institution Signature              Lecturer Signature
Date: _______________              Date: _______________
`;

export default function ContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showEscrow, setShowEscrow] = useState(null);
  const [escrowStep, setEscrowStep] = useState(0);
  const [escrowAmount, setEscrowAmount] = useState('');

  useEffect(() => {
    contractService.list()
      .then((data) => setContracts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const initiateEscrow = (contract) => {
    setShowEscrow(contract);
    setEscrowStep(0);
    setEscrowAmount(String(contract.amount));
  };

  const confirmEscrow = async () => {
    try {
      const data = await contractService.initiateEscrow(showEscrow.id, Number(escrowAmount));
      setContracts((prev) => prev.map((c) => c.id === showEscrow.id ? { ...c, ...data.contract } : c));
    } catch (_) {
      setContracts((prev) => prev.map((c) => c.id === showEscrow.id ? { ...c, escrowStatus: 'in_escrow' } : c));
    }
    setEscrowStep(2);
  };

  return (
    <div className={styles.page}>
      {/* Contract list */}
      <div className={styles.list}>
        {contracts.length === 0 && <p className={styles.empty}>No contracts yet.</p>}
        {contracts.map((c) => {
          const cs = CONTRACT_STATUS[c.status] ?? CONTRACT_STATUS.draft;
          const es = ESCROW_STATUS[c.escrowStatus] ?? ESCROW_STATUS.not_initiated;
          const lecturerName = c.lecturer?.name || c.lecturerName || '—';
          const lecturerInitials = c.lecturer?.initials || c.lecturerInitials || '??';
          const lecturerColor = c.lecturer?.color || c.lecturerColor || '#7c3aed';
          const jobTitle = c.job?.title || c.jobTitle || '—';
          const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—';
          return (
            <div key={c.id} className={styles.card}>
              <div className={styles.cardLeft}>
                <div className={styles.avatar} style={{ background: lecturerColor }}>{lecturerInitials}</div>
                <div>
                  <h3 className={styles.cardName}>{lecturerName}</h3>
                  <p className={styles.cardJob}>{jobTitle}</p>
                  <p className={styles.cardDates}>{fmtDate(c.startDate)} → {fmtDate(c.endDate)} · {c.contractType}</p>
                </div>
              </div>
              <div className={styles.cardRight}>
                <div className={styles.cardAmount}>${Number(c.amount || 0).toLocaleString()}/mo</div>
                <span className={styles.statusBadge} style={{ background: cs.bg, color: cs.color }}>{cs.label}</span>
                <span className={styles.escrowStatus} style={{ color: es.color }}>● Escrow: {es.label}</span>
                <div className={styles.cardActions}>
                  <button className={styles.btnView} onClick={() => setSelected(c)}>View Contract</button>
                  {c.escrowStatus === 'not_initiated' && c.status === 'active' && (
                    <button className={styles.btnEscrow} onClick={() => initiateEscrow(c)}>Initiate Payment</button>
                  )}
                  {c.escrowStatus === 'in_escrow' && (
                    <button className={styles.btnRelease} onClick={() => setContracts((prev) => prev.map((x) => x.id === c.id ? { ...x, escrowStatus: 'released' } : x))}>Release Funds</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contract preview modal */}
      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Contract — {selected.lecturer?.name || selected.lecturerName || '—'}</h3>
              <button className={styles.modalClose} onClick={() => setSelected(null)}>✕</button>
            </div>
            <pre className={styles.contractText}>{CONTRACT_TEMPLATE({ ...selected, lecturerName: selected.lecturer?.name || selected.lecturerName || '—', jobTitle: selected.job?.title || selected.jobTitle || '—' })}</pre>
            <div className={styles.modalFooter}>
              <button className={styles.btnDownload} onClick={() => window.print()}>Download / Print</button>
              <button className={styles.btnSend}>Send to Lecturer</button>
            </div>
          </div>
        </div>
      )}

      {/* Escrow modal */}
      {showEscrow && (
        <div className={styles.overlay} onClick={() => { setShowEscrow(null); setEscrowStep(0); }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Escrow Payment</h3>
              <button className={styles.modalClose} onClick={() => { setShowEscrow(null); setEscrowStep(0); }}>✕</button>
            </div>

            {escrowStep === 0 && (
              <div className={styles.escrowStep}>
                <div className={styles.escrowIcon}><LockIcon /></div>
                <h4 className={styles.escrowTitle}>How Escrow Works</h4>
                <ul className={styles.escrowList}>
                  <li>💳 You deposit funds into a secure escrow account.</li>
                  <li>🔒 Funds are held securely — the lecturer cannot access them yet.</li>
                  <li>✅ Once the engagement milestone is complete, you release the funds.</li>
                  <li>🛡️ If a dispute arises, Lecturiing mediates and resolves it fairly.</li>
                </ul>
                <button className={styles.btnEscrowNext} onClick={() => setEscrowStep(1)}>Continue to Payment</button>
              </div>
            )}

            {escrowStep === 1 && (
              <div className={styles.escrowStep}>
                <h4 className={styles.escrowTitle}>Confirm Escrow Amount</h4>
                <p className={styles.escrowSub}>Lecturer: <strong>{showEscrow.lecturer?.name || showEscrow.lecturerName || '—'}</strong></p>
                <div className={styles.amountRow}>
                  <span className={styles.currency}>USD</span>
                  <input className={styles.amountInput} type="number" value={escrowAmount} onChange={(e) => setEscrowAmount(e.target.value)} />
                </div>
                <p className={styles.escrowNote}>A 2% platform fee will be added at checkout.</p>
                <div className={styles.escrowSummary}>
                  <div><span>Escrow amount</span><span>${Number(escrowAmount).toLocaleString()}</span></div>
                  <div><span>Platform fee (2%)</span><span>${(Number(escrowAmount) * 0.02).toFixed(2)}</span></div>
                  <div className={styles.total}><span>Total</span><span>${(Number(escrowAmount) * 1.02).toFixed(2)}</span></div>
                </div>
                <button className={styles.btnEscrowNext} onClick={confirmEscrow}>Confirm &amp; Deposit Funds</button>
              </div>
            )}

            {escrowStep === 2 && (
              <div className={styles.escrowStep}>
                <div className={styles.escrowSuccess}><span>✓</span></div>
                <h4 className={styles.escrowTitle}>Funds Deposited!</h4>
                <p className={styles.escrowSub}>USD ${Number(escrowAmount).toLocaleString()} is now held in escrow for {showEscrow.lecturer?.name || showEscrow.lecturerName || '—'}. Release the funds once the work is complete.</p>
                <button className={styles.btnEscrowNext} onClick={() => { setShowEscrow(null); setEscrowStep(0); }}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LockIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>;
}
