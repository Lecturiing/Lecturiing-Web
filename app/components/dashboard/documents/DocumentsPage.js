'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './DocumentsPage.module.css';
import { documentService } from '@/app/lib/services/documentService';

const CATEGORIES = ['All', 'Contract', 'NDA', 'IP', 'Policy'];

const CATEGORY_COLORS = {
  Contract: { bg: '#ede9fe', color: '#4f46e5' },
  NDA:      { bg: '#dbeafe', color: '#1d4ed8' },
  IP:       { bg: '#d1fae5', color: '#059669' },
  Policy:   { bg: '#fef3c7', color: '#d97706' },
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState([]);
  const [cat, setCat] = useState('All');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', category: 'Contract', description: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    documentService.list()
      .then((data) => setDocs(Array.isArray(data) ? data : (data?.documents ?? [])))
      .catch(() => {});
  }, []);

  const filtered = cat === 'All' ? docs : docs.filter((d) => d.category === cat);

  const handleUpload = async () => {
    if (!newDoc.title.trim()) return;
    if (!selectedFile) { setUploadError('Please select a file to upload.'); return; }
    setUploadError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', newDoc.title);
      formData.append('category', newDoc.category);
      if (newDoc.description) formData.append('description', newDoc.description);
      const created = await documentService.upload(formData);
      setDocs((prev) => [...prev, created]);
      setNewDoc({ title: '', category: 'Contract', description: '' });
      setSelectedFile(null);
      setShowUpload(false);
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    try { await documentService.delete(id); } catch (_) {}
  };

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Document Library</h2>
          <p className={styles.subtitle}>Manage contract templates and policy documents. Link them to job postings during job creation.</p>
        </div>
        <button className={styles.uploadBtn} onClick={() => { setShowUpload(true); setSelectedFile(null); setUploadError(''); }}>+ Add Document</button>
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
                <span>{doc.pages} {doc.pages === 1 ? 'page' : 'pages'}</span>
                <span>·</span>
                <span>Updated {doc.lastUpdated ? new Date(doc.lastUpdated).toLocaleDateString() : '—'}</span>
              </div>
              <div className={styles.cardActions}>
                <button className={styles.previewBtn} onClick={() => setPreviewDoc(doc)}>Preview</button>
                {doc.fileUrl && (
                  <a className={styles.downloadBtn} href={doc.fileUrl} target="_blank" rel="noopener noreferrer">Download</a>
                )}
                <button className={styles.deleteBtn} onClick={() => handleDelete(doc.id)}>Remove</button>
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
                <span>{previewDoc.pages} {previewDoc.pages === 1 ? 'page' : 'pages'}</span>
                <span>·</span>
                <span>Last updated {previewDoc.lastUpdated ? new Date(previewDoc.lastUpdated).toLocaleDateString() : '—'}</span>
                {previewDoc.fileUrl && (
                  <>
                    <span>·</span>
                    <a className={styles.previewDownloadLink} href={previewDoc.fileUrl} target="_blank" rel="noopener noreferrer">Download ↗</a>
                  </>
                )}
              </div>
              {previewDoc.description && <p className={styles.previewDesc}>{previewDoc.description}</p>}
              {previewDoc.fileUrl && previewDoc.mimeType === 'application/pdf' ? (
                <iframe
                  src={previewDoc.fileUrl}
                  className={styles.previewIframe}
                  title={previewDoc.title}
                />
              ) : previewDoc.fileUrl ? (
                <div className={styles.previewNoEmbed}>
                  <span>📄</span>
                  <p>This file type cannot be previewed in the browser.</p>
                  <a className={styles.primaryBtn} href={previewDoc.fileUrl} target="_blank" rel="noopener noreferrer">Download File</a>
                </div>
              ) : (
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
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Upload / Add Modal ── */}
      {showUpload && (
        <div className={styles.modalOverlay} onClick={() => { setShowUpload(false); setSelectedFile(null); setUploadError(''); }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add Document</h2>
              <button className={styles.modalClose} onClick={() => { setShowUpload(false); setSelectedFile(null); setUploadError(''); }}>✕</button>
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
              <div
                className={`${styles.uploadDropzone} ${selectedFile ? styles.uploadDropzoneHasFile : ''}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                  onChange={(e) => { setSelectedFile(e.target.files?.[0] ?? null); setUploadError(''); }}
                />
                {selectedFile ? (
                  <>
                    <span>📄</span>
                    <span className={styles.uploadFileName}>{selectedFile.name}</span>
                    <span className={styles.uploadNote}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB — click to change</span>
                  </>
                ) : (
                  <>
                    <span>📎</span>
                    <span>Click to browse (PDF, DOCX, TXT · max 20 MB)</span>
                  </>
                )}
              </div>
              {uploadError && <p className={styles.uploadError}>{uploadError}</p>}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modalCancel} onClick={() => { setShowUpload(false); setSelectedFile(null); setUploadError(''); }}>Cancel</button>
              <button className={styles.modalSave} disabled={!newDoc.title.trim() || uploading} onClick={handleUpload}>
                {uploading ? 'Saving…' : 'Add to Library'}
              </button>
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
