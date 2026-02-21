'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FIELDS, CONTRACT_TYPES, MOCK_CONTRACT_DOCS } from '@/app/lib/mockData';
import styles from './JobForm.module.css';

export default function JobForm() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', field: '', description: '', requirements: '', contractType: '', duration: '', budgetMin: '', budgetMax: '', deadline: '', status: 'draft' });
  const [linkedDocs, setLinkedDocs] = useState([]);
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const toggleDoc = (id) => setLinkedDocs((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);

  const handleSubmit = (action) => {
    const payload = { ...form, status: action };
    console.log('Job posted:', payload);
    router.push('/dashboard/jobs');
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.title}>Create Job Posting</h2>
        <p className={styles.sub}>Fill in the details to find the right lecturer for your institution.</p>

        <div className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Job Title *</label>
              <input className={styles.input} placeholder="e.g. Senior Lecturer in Data Science" value={form.title} onChange={set('title')} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Field of Study *</label>
              <select className={styles.input} value={form.field} onChange={set('field')}>
                <option value="">Select field…</option>
                {FIELDS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Job Description *</label>
            <textarea className={`${styles.input} ${styles.textarea}`} placeholder="Describe the role, responsibilities, and what you're looking for…" value={form.description} onChange={set('description')} rows={4} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Requirements</label>
            <textarea className={`${styles.input} ${styles.textarea}`} placeholder="List each requirement on a new line…" value={form.requirements} onChange={set('requirements')} rows={3} />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Contract Type *</label>
              <select className={styles.input} value={form.contractType} onChange={set('contractType')}>
                <option value="">Select type…</option>
                {CONTRACT_TYPES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Duration</label>
              <input className={styles.input} placeholder="e.g. 6 months, 1 year" value={form.duration} onChange={set('duration')} />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Budget Min (USD/mo)</label>
              <input className={styles.input} type="number" placeholder="e.g. 1500" value={form.budgetMin} onChange={set('budgetMin')} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Budget Max (USD/mo)</label>
              <input className={styles.input} type="number" placeholder="e.g. 3000" value={form.budgetMax} onChange={set('budgetMax')} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Application Deadline</label>
              <input className={styles.input} type="date" value={form.deadline} onChange={set('deadline')} />
            </div>
          </div>
        </div>

        {/* ── Contract Documents (internal — not visible to applicants) ── */}
        <div className={styles.docsSection}>
          <div className={styles.docsSectionHeader}>
            <div>
              <h3 className={styles.docsSectionTitle}>Contract Documents</h3>
              <p className={styles.docsSectionNote}>🔒 Internal only — not visible to applicants. Select the documents that will be sent to the hired candidate for e-signature after offer acceptance.</p>
            </div>
            <span className={styles.docsCount}>{linkedDocs.length} selected</span>
          </div>
          <div className={styles.docsList}>
            {MOCK_CONTRACT_DOCS.map((doc) => {
              const isChecked = linkedDocs.includes(doc.id);
              return (
                <label key={doc.id} className={`${styles.docRow} ${isChecked ? styles.docRowSelected : ''}`}>
                  <input type="checkbox" className={styles.docCheckbox} checked={isChecked} onChange={() => toggleDoc(doc.id)} />
                  <div className={styles.docInfo}>
                    <p className={styles.docTitle}>{doc.title}</p>
                    <p className={styles.docMeta}>{doc.category} · {doc.pages} pages · {doc.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={() => router.back()}>Cancel</button>
          <div style={{ flex: 1 }} />
          <button className={styles.btnDraft} onClick={() => handleSubmit('draft')}>Save as Draft</button>
          <button className={styles.btnPublish} onClick={() => handleSubmit('active')}>Publish Job</button>
        </div>
      </div>
    </div>
  );
}
