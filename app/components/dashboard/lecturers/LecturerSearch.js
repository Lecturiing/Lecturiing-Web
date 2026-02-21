'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_LECTURERS, FIELDS, QUALIFICATIONS, COUNTRIES, TIMEZONES } from '@/app/lib/mockData';
import styles from './LecturerSearch.module.css';

export default function LecturerSearch() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ field: '', qualification: '', country: '', timezone: '', maxRate: '', availability: '' });
  const [shortlisted, setShortlisted] = useState(new Set(MOCK_LECTURERS.filter((l) => l.shortlisted).map((l) => l.id)));
  const [selected, setSelected] = useState(null);

  const sf = (k) => (e) => setFilters((p) => ({ ...p, [k]: e.target.value }));

  const results = useMemo(() => {
    return MOCK_LECTURERS.filter((l) => {
      if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.field.toLowerCase().includes(search.toLowerCase()) && !l.specializations.join(' ').toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.field && l.field !== filters.field) return false;
      if (filters.qualification && l.qualification !== filters.qualification.replace("Master's / MSc", 'MSc')) return false;
      if (filters.country && l.country !== filters.country) return false;
      if (filters.timezone && l.timezone !== filters.timezone) return false;
      if (filters.maxRate && l.rate > Number(filters.maxRate)) return false;
      if (filters.availability && l.availability !== filters.availability) return false;
      return true;
    });
  }, [search, filters]);

  const toggleShortlist = (id) => {
    setShortlisted((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <div className={styles.page}>
      {/* Filters sidebar */}
      <aside className={styles.filters}>
        <h3 className={styles.filterTitle}>Filters</h3>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Field of Study</label>
          <select className={styles.filterSelect} value={filters.field} onChange={sf('field')}>
            <option value="">All fields</option>
            {FIELDS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Qualification</label>
          <select className={styles.filterSelect} value={filters.qualification} onChange={sf('qualification')}>
            <option value="">Any</option>
            {QUALIFICATIONS.map((q) => <option key={q}>{q}</option>)}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Country</label>
          <select className={styles.filterSelect} value={filters.country} onChange={sf('country')}>
            <option value="">Any country</option>
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Time Zone</label>
          <select className={styles.filterSelect} value={filters.timezone} onChange={sf('timezone')}>
            <option value="">Any timezone</option>
            {TIMEZONES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Max Rate (USD/hr)</label>
          <input className={styles.filterSelect} type="number" placeholder="e.g. 100" value={filters.maxRate} onChange={sf('maxRate')} />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Availability</label>
          <select className={styles.filterSelect} value={filters.availability} onChange={sf('availability')}>
            <option value="">Any</option>
            <option>Full-time</option>
            <option>Part-time</option>
          </select>
        </div>

        <button className={styles.clearBtn} onClick={() => setFilters({ field: '', qualification: '', country: '', timezone: '', maxRate: '', availability: '' })}>
          Clear Filters
        </button>
      </aside>

      {/* Results */}
      <div className={styles.results}>
        <div className={styles.resultsHeader}>
          <input className={styles.searchInput} placeholder="Search by name, field, or skill…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <span className={styles.resultCount}>{results.length} lecturers found</span>
        </div>

        <div className={styles.grid}>
          {results.map((l) => (
            <div key={l.id} className={styles.card} onClick={() => setSelected(l)}>
              <div className={styles.cardTop}>
                <div className={styles.avatar} style={{ background: l.color }}>{l.initials}</div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardName}>{l.name}</h3>
                  <p className={styles.cardTitle}>{l.title}</p>
                </div>
              </div>
              <div className={styles.cardMeta}>
                <span className={styles.metaChip}>{l.country}</span>
                <span className={styles.metaChip}>{l.timezone}</span>
                <span className={styles.metaChip}>{l.availability}</span>
              </div>
              <div className={styles.cardTags}>
                {l.specializations.slice(0, 3).map((s) => <span key={s} className={styles.tag}>{s}</span>)}
              </div>
              <div className={styles.cardFooter}>
                <div>
                  <span className={styles.rate}>${l.rate}/hr</span>
                  <span className={styles.rating}>★ {l.rating} ({l.reviews})</span>
                </div>
                <button className={`${styles.shortlistBtn} ${shortlisted.has(l.id) ? styles.shortlisted : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleShortlist(l.id); }}>
                  {shortlisted.has(l.id) ? '★ Shortlisted' : '☆ Shortlist'}
                </button>
              </div>
            </div>
          ))}
          {results.length === 0 && <p className={styles.empty}>No lecturers match your filters.</p>}
        </div>
      </div>

      {/* Profile drawer */}
      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <button className={styles.drawerClose} onClick={() => setSelected(null)}>✕</button>
              <button
                className={styles.drawerExpand}
                title="View full profile"
                onClick={() => router.push(`/dashboard/lecturers/${selected.id}`)}
              >
                <ExpandIcon />
              </button>
            </div>
            <div className={styles.drawerAvatar} style={{ background: selected.color }}>{selected.initials}</div>
            <h2 className={styles.drawerName}>{selected.name}</h2>
            <p className={styles.drawerTitle}>{selected.title}</p>
            <div className={styles.drawerMeta}>
              <span>📍 {selected.country}</span>
              <span>🕐 {selected.timezone}</span>
              <span>🎓 {selected.qualification}</span>
              <span>⏱ {selected.experience} yrs exp.</span>
            </div>
            <p className={styles.drawerBio}>{selected.bio}</p>
            <div className={styles.drawerTags}>
              {selected.specializations.map((s) => <span key={s} className={styles.tag}>{s}</span>)}
            </div>
            <div className={styles.drawerFooter}>
              <div>
                <p className={styles.drawerRate}>${selected.rate}/hr</p>
                <p className={styles.drawerRating}>★ {selected.rating} ({selected.reviews} reviews)</p>
              </div>
              <button className={`${styles.shortlistBtn} ${shortlisted.has(selected.id) ? styles.shortlisted : ''}`}
                onClick={() => toggleShortlist(selected.id)}>
                {shortlisted.has(selected.id) ? '★ Shortlisted' : '☆ Add to Shortlist'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExpandIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}
