'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { walletService } from '@/app/lib/services/walletService';

const TX_ICONS = {
  escrow_release: '↓',
  escrow_lock: '🔒',
  withdrawal: '↑',
  top_up: '+',
  refund: '↩',
};

function fmt(val, currency = 'USD') {
  const n = parseFloat(val ?? 0);
  if (n >= 1_000_000) return `${currency} ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${currency} ${(n / 1_000).toFixed(1)}K`;
  return `${currency} ${n.toFixed(2)}`;
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function WalletPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>}>
      <WalletPageInner />
    </Suspense>
  );
}

function WalletPageInner() {
  const searchParams = useSearchParams();
  const justFunded = searchParams.get('funded') === '1';

  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [visible, setVisible] = useState(true);
  const [fundAmount, setFundAmount] = useState('');
  const [funding, setFunding] = useState(false);
  const [fundError, setFundError] = useState('');

  const loadWallet = useCallback(async () => {
    try {
      const data = await walletService.get();
      setWallet(data?.wallet ?? null);
    } catch (_) {}
  }, []);

  const loadTx = useCallback(async (p = 1) => {
    setTxLoading(true);
    try {
      const data = await walletService.transactions({ page: p, pageSize: 15 });
      setTransactions(data?.transactions ?? []);
      setTotalPages(data?.totalPages ?? 1);
      setPage(p);
    } catch (_) {}
    setTxLoading(false);
  }, []);

  useEffect(() => {
    Promise.all([loadWallet(), loadTx(1)])
      .finally(() => setLoading(false));
  }, [loadWallet, loadTx]);

  const handleFund = async (e) => {
    e.preventDefault();
    const amount = parseFloat(fundAmount);
    if (!amount || amount <= 0) { setFundError('Enter a valid amount'); return; }
    setFundError('');
    setFunding(true);
    try {
      const data = await walletService.fund(amount, wallet?.currency || 'USD');
      if (data?.paymentLink) {
        window.open(data.paymentLink, '_blank', 'noopener,noreferrer');
        setFundAmount('');
      }
    } catch (err) {
      setFundError(err?.message || 'Failed to initiate payment');
    } finally {
      setFunding(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Payment return banner */}
      {justFunded && (
        <div style={{
          background: '#ecfdf5', border: '1px solid #6ee7b7',
          borderRadius: 12, padding: '14px 18px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: '1.1rem' }}>✓</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#065f46' }}>
            Payment received! Your wallet will be credited shortly once confirmed by Dodo Payments.
          </span>
        </div>
      )}

      {/* Balance card */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        borderRadius: 20, padding: 28,
        boxShadow: '0 8px 32px rgba(79,70,229,0.3)',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
            Available Balance
          </span>
          <button
            onClick={() => setVisible((v) => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}
          >
            {visible ? 'Hide' : 'Show'}
          </button>
        </div>
        <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: 16 }}>
          {visible ? fmt(wallet?.balance, wallet?.currency) : '••••••'}
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Stat label="Total Earned" value={fmt(wallet?.totalEarned, wallet?.currency)} />
          <Stat label="Total Spent" value={fmt(wallet?.totalSpent, wallet?.currency)} />
          {(wallet?.pendingBalance ?? 0) > 0 && (
            <Stat label="In Escrow" value={fmt(wallet?.pendingBalance, wallet?.currency)} warn />
          )}
        </div>
      </div>

      {/* Fund wallet */}
      <div style={{
        background: '#fff', borderRadius: 16, padding: 20,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24,
      }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
          Top-up Wallet
        </h3>
        <form onSubmit={handleFund} style={{ display: 'flex', gap: 10 }}>
          <input
            type="number"
            min="1"
            step="any"
            placeholder="Enter amount"
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10,
              border: '1.5px solid #e5e7eb', fontSize: '0.9rem',
              outline: 'none', fontFamily: 'inherit',
            }}
          />
          <button
            type="submit"
            disabled={funding}
            style={{
              padding: '10px 22px', borderRadius: 10,
              border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: '#fff', fontWeight: 700, fontSize: '0.9rem',
              cursor: funding ? 'not-allowed' : 'pointer', opacity: funding ? 0.7 : 1,
            }}
          >
            {funding ? '...' : 'Pay with Dodo'}
          </button>
        </form>
        {fundError && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '6px 0 0' }}>{fundError}</p>}
      </div>

      {/* Transactions */}
      <div style={{
        background: '#fff', borderRadius: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden',
      }}>
        <div style={{ padding: '18px 20px 12px', borderBottom: '1px solid #f3f4f6' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
            Transactions
          </h3>
        </div>

        {txLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading…</div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
            No transactions yet
          </div>
        ) : (
          <>
            {transactions.map((tx) => (
              <TxRow key={tx.id} tx={tx} />
            ))}

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderTop: '1px solid #f3f4f6' }}>
                <PageBtn disabled={page === 1} onClick={() => loadTx(page - 1)}>← Prev</PageBtn>
                <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                  Page {page} of {totalPages}
                </span>
                <PageBtn disabled={page === totalPages} onClick={() => loadTx(page + 1)}>Next →</PageBtn>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TxRow({ tx }) {
  const isFailed = tx.status === 'failed';
  const isCredit = tx.type === 'credit' && !isFailed;
  const color = isFailed ? '#ef4444' : isCredit ? '#10b981' : '#ef4444';
  const icon = TX_ICONS[tx.category] ?? '↔';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 20px', borderBottom: '1px solid #f9fafb',
      opacity: isFailed ? 0.75 : 1,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: isCredit ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1rem', color, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {tx.description || tx.category}
          </p>
          {isFailed && (
            <span style={{
              fontSize: '0.68rem', fontWeight: 700, color: '#ef4444',
              background: 'rgba(239,68,68,0.1)', padding: '1px 6px', borderRadius: 4,
              flexShrink: 0,
            }}>
              Failed
            </span>
          )}
        </div>
        <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#9ca3af' }}>
          {fmtDate(tx.createdAt)}
        </p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color }}>
          {isFailed ? '-' : isCredit ? '+' : '-'}{fmt(tx.amount, tx.currency)}
        </p>
        {tx.fee > 0 && (
          <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#9ca3af' }}>
            fee: {fmt(tx.fee, tx.currency)}
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, warn }) {
  return (
    <div style={{
      padding: '8px 12px',
      background: 'rgba(255,255,255,0.15)',
      borderRadius: 8,
    }}>
      <p style={{ margin: 0, fontSize: '0.7rem', color: warn ? '#fbbf24' : 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
        {label}
      </p>
      <p style={{ margin: '2px 0 0', fontSize: '0.88rem', fontWeight: 700, color: warn ? '#fbbf24' : '#fff' }}>
        {value}
      </p>
    </div>
  );
}

function PageBtn({ children, disabled, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: 8,
        border: '1.5px solid #e5e7eb', background: disabled ? '#f9fafb' : '#fff',
        color: disabled ? '#d1d5db' : '#374151', fontWeight: 600,
        fontSize: '0.8rem', cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}
