'use client';

import { useState } from 'react';
import { safeGet } from '@/lib/api';

interface PsidResult {
  status: 'clean' | 'flagged' | 'stolen' | 'unknown';
  ownerName?: string;
  serial: string;
  reward?: number | null;
  message?: string;
  reportedAt?: string;
}

function ResultCard({ result }: { result: PsidResult }) {
  const statusColors = {
    clean: { bg: '#d1fae5', text: '#065f46', label: 'Clean' },
    flagged: { bg: '#fef3c7', text: '#92400e', label: 'Flagged' },
    stolen: { bg: '#fee2e2', text: '#991b1b', label: 'Stolen' },
    unknown: { bg: '#f3f4f6', text: '#374151', label: 'Unknown' }
  };
  const color = statusColors[result.status] || statusColors.unknown;

  return (
    <div style={{ 
      border: '1px solid #e5e7eb', 
      borderRadius: '8px', 
      padding: '1rem',
      marginTop: '1rem',
      background: 'white'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <span style={{ 
            fontSize: '0.75rem', 
            background: '#e5e7eb', 
            padding: '0.125rem 0.5rem', 
            borderRadius: '9999px' 
          }}>PSID result</span>
          <h3 style={{ margin: '0.5rem 0 0 0' }}>{result.serial}</h3>
        </div>
        <span style={{ 
          background: color.bg, 
          color: color.text, 
          padding: '0.25rem 0.75rem', 
          borderRadius: '9999px',
          fontSize: '0.875rem',
          fontWeight: '500'
        }}>{color.label}</span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <strong>Owner</strong>
          <p style={{ margin: '0.25rem 0 0 0', color: '#4b5563' }}>
            {result.ownerName || 'Not publicly shown'}
          </p>
        </div>
        <div>
          <strong>Public note</strong>
          <p style={{ margin: '0.25rem 0 0 0', color: '#4b5563' }}>
            {result.message || 'Verification completed.'}
          </p>
        </div>
      </div>
      
      {result.reward && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          background: '#fef3c7', 
          borderRadius: '8px',
          fontSize: '0.875rem'
        }}>
          💰 Reward information may be available for qualifying recovery workflows.
        </div>
      )}
      
      {result.status === 'stolen' && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          background: '#fee2e2', 
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: '#991b1b'
        }}>
          ⚠️ This item has been reported as stolen. Please contact authorities.
        </div>
      )}
    </div>
  );
}

export default function PsidPage() {
  const [serial, setSerial] = useState('');
  const [result, setResult] = useState<PsidResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serial.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      // Use safeGet with the correct backend endpoint: /psid/serial/:serial
      const data = await safeGet<PsidResult>(`/psid/serial/${encodeURIComponent(serial.trim())}`);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Unable to verify item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>PSID Verification</h1>
      
      <p style={{ marginBottom: '1.5rem', color: '#666', lineHeight: '1.5' }}>
        Use the Product Serial Identification system to verify an item serial before
        purchase or recovery. For the best scan experience, use the PSID mobile app for QR,
        barcode, and photo-assisted serial capture.
      </p>
      
      <form onSubmit={handleVerify} style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            placeholder="Enter serial number"
            required
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #ccc',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              background: loading ? '#ccc' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem'
            }}
          >
            {loading ? 'Checking...' : 'Verify Item'}
          </button>
        </div>
      </form>
      
      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '0.75rem',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          ⚠️ {error}
        </div>
      )}
      
      {result && <ResultCard result={result} />}
      
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        background: '#f9fafb'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>Need scan-first verification?</h3>
        <p style={{ margin: 0, color: '#666' }}>
          The PSID mobile app is designed for the strongest user experience, including QR,
          barcode, and photo-to-serial capture workflows.
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
          To register a new PSID, please <a href="/login" style={{ color: '#2563eb' }}>log in</a> and visit the{' '}
          <a href="/register-property" style={{ color: '#2563eb' }}>Register Property</a> page.
        </p>
      </div>
    </div>
  );
}