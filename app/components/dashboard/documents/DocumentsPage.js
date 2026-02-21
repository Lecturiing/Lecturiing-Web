'use client';

import { useState } from 'react';
import { MOCK_CONTRACT_DOCS } from '@/app/lib/mockData';
import styles from './DocumentsPage.module.css';

const CATEGORIES = ['All', 'Contract', 'NDA', 'IP', 'Policy'];

const CATEGORY_COLORS = {
  Contract: { bg: '#ede9fe', color: '#4f46e5' },
  NDA:      { bg: '#dbeafe', color: '#1d4ed8' },
  IP:       { bg: '#d1fae5', color: '#059669' },
  Policy:   { bg: '#fef3c7', color: '#d97706' },
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState(MOCK_CONTRACT_DOCS);
  const [cat, setCat] = useState('All');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', category: 'Contract', description: '' });

  const filtered = cat === 'All' ? docs : docs.filter((d) => d.category === cat);

  const handleUpload = () => {
    if (!newDoc.title.trim()) return;
    const doc = {
      id: `doc${docs.length + 1}`,
      title: newDoc.title,
      category: newDoc.category,
      description: newDoc.description || 'No description provided.',
      pages: Math.floor(Math.random() * 8) + 2,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setDocs((prev) => [...prev, doc]);
    setNewDoc({ title: '', category: 'Contract', description: '' });
    setShowUpload(false);
  };

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Document Library</h2>
          <p className={styles.subtitle}>Manage contract templates and policy documents. Link them to job postings during job creation.</p>
        </div>
        <button className={styles.uploadBtn} onClick={() => setShowUpload(true)}>+ Add Document</button>
      </div>

      {/* ── Category Tabs ── */}
      <div className={styles.tabs}>
        {CATEGORIES.map((c) => (
          <button key={c} className={`${styles.tab} ${cat === c ? styles.tabActive : ''}`} onClick={() => setCat(c)}>
            {c}
            <span className={styles.tabCount}>
              {c === 'All' ? docs.length : docs.filter((d) => d.category === c).length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Document Grid ── */}
      <div className={styles.grid}>
        {filtered.map((doc) => {
          const cc = CATEGORY_COLORS[doc.category] ?? { bg: '#f3f4f6', color: '#6b7280' };
          return (
            <div key={doc.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.docIconWrap}>
                  <DocIcon />
                </div>
                <span className={styles.catBadge} style={{ background: cc.bg, color: cc.color }}>{doc.category}</span>
              </div>
              <h3 className={styles.docTitle}>{doc.title}</h3>
              <p className={styles.docDesc}>{doc.description}</p>
              <div className={styles.docMeta}>
                <span>{doc.pages} pages</span>
                <span>·</span>
                <span>Updated {doc.lastUpdated}</span>
              </div>
              <div className={styles.cardActions}>
                <button className={styles.previewBtn} onClick={() => setPreviewDoc(doc)}>Preview</button>
                <button className={styles.deleteBtn} onClick={() => setDocs((prev) => prev.filter((d) => d.id !== doc.id))}>Remove</button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className={styles.empty}>No documents in this category.</p>}
      </div>

      {/* ── Preview Modal ── */}
      {previewDoc && (
        <div className={styles.modalOverlay} onClick={() => setPreviewDoc(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{previewDoc.title}</h2>
              <button className={styles.modalClose} onClick={() => setPreviewDoc(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.previewMeta}>
                <span>{previewDoc.category}</span>
                <span>·</span>
                <span>{previewDoc.pages} pages</span>
                <span>·</span>
                <span>Last updated {previewDoc.lastUpdated}</span>
              </div>
              <p className={styles.previewDesc}>{previewDoc.description}</p>
              <div className={styles.previewDoc}>
                <div className={styles.previewDocHeader}>
                  <p className={styles.previewDocTitle}>{previewDoc.title}</p>
                  <p className={styles.previewDocSub}>Lecturiing Institution Platform — Confidential</p>
                </div>
                <div className={styles.previewDocBody}>
                  <p><strong>1. Parties</strong><br />This agreement is entered into between the Institution ("Employer") and the Lecturer ("Contractor") as identified in the offer letter attached hereto.</p>
                  <p><strong>2. Scope of Engagement</strong><br />The Contractor agrees to deliver the services described in the associated Job Posting, including but not limited to curriculum delivery, student assessment, and related academic duties.</p>
                  <p><strong>3. Remuneration</strong><br />Compensation shall be paid as specified in the offer letter, subject to successful completion of deliverables and applicable tax withholdings.</p>
                  <p><strong>4. Confidentiality</strong><br />The Contractor shall maintain strict confidentiality regarding institutional information, student data, and proprietary course materials.</p>
                  <p><strong>5. Term</strong><br />This agreement commences and terminates on the dates specified in the offer letter, unless terminated earlier in accordance with Section 7.</p>
                  <p className={styles.previewEllipsis}>[ … {previewDoc.pages - 1} more pages ]</p>
                </div>
                <div className={styles.previewSignatureRow}>
                  <div className={styles.sigBlock}>
                    <div className={styles.sigLine} />
                    <p>Authorised Signatory — Institution</p>
                  </div>
                  <div className={styles.sigBlock}>
                    <div className={styles.sigLine} />
                    <p>Lecturer Signature</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload / Add Modal ── */}
      {showUpload && (
        <div className={styles.modalOverlay} onClick={() => setShowUpload(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add Document</h2>
              <button className={styles.modalClose} onClick={() => setShowUpload(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Document Title *</label>
                <input className={styles.fieldInput} placeholder="e.g. Freelance Engagement Agreement" value={newDoc.title} onChange={(e) => setNewDoc((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Category</label>
                <select className={styles.fieldInput} value={newDoc.category} onChange={(e) => setNewDoc((p) => ({ ...p, category: e.target.value }))}>
                  <option>Contract</option><option>NDA</option><option>IP</option><option>Policy</option>
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Description</label>
                <textarea className={styles.fieldTextarea} rows={3} placeholder="Brief description of this document's purpose…" value={newDoc.description} onChange={(e) => setNewDoc((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div className={styles.uploadDropzone}>
                <span>📎</span>
                <span>Drag & drop file or click to browse (PDF, DOCX)</span>
                <span className={styles.uploadNote}>For demo purposes, file upload is simulated.</span>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modalCancel} onClick={() => setShowUpload(false)}>Cancel</button>
              <button className={styles.modalSave} disabled={!newDoc.title.trim()} onClick={handleUpload}>Add to Library</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DocIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
}
