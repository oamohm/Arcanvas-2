import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const ARC_CHAIN_ID = Number(process.env.NEXT_PUBLIC_ARC_CHAIN_ID);
const ARCSCAN = process.env.NEXT_PUBLIC_ARCSCAN;
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS;
const ROYALTY_WALLET = process.env.NEXT_PUBLIC_ROYALTY_WALLET || '';
const ROYALTY_BPS = Number(process.env.NEXT_PUBLIC_ROYALTY_BPS || 50);

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

function short(a) { return a ? `${a.slice(0,6)}…${a.slice(-4)}` : ''; }

export default function Home() {
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState('');
  const [usdcBal, setUsdcBal] = useState('0');
  const [decimals, setDecimals] = useState(6);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [revenue, setRevenue] = useState(0);

  const royaltyFee = amount ? (parseFloat(amount) * ROYALTY_BPS) / 10000 : 0;
  const netAmount = amount ? parseFloat(amount) - royaltyFee : 0;

  const refreshBalance = useCallback(async (p, addr) => {
    try {
      const token = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, p);
      const [raw, dec] = await Promise.all([token.balanceOf(addr), token.decimals()]);
      setDecimals(Number(dec));
      setUsdcBal(ethers.formatUnits(raw, Number(dec)));
    } catch { setUsdcBal('0'); }
  }, []);

  async function connect() {
    setError('');
    try {
      if (!window.ethereum) throw new Error('MetaMask not found');
      const p = new ethers.BrowserProvider(window.ethereum);
      await p.send('eth_requestAccounts', []);
      const s = await p.getSigner();
      const addr = await s.getAddress();
      setProvider(p); setSigner(s); setAddress(addr);
      await refreshBalance(p, addr);
    } catch (e) { setError(e.message); }
  }

  async function send() {
    setError(''); setResult(null);
    if (!ethers.isAddress(recipient)) return setError('Invalid recipient address');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return setError('Enter a valid amount');
    if (amt > parseFloat(usdcBal)) return setError('Insufficient USDC balance');

    setSending(true);
    try {
      const token = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
      const royaltyUnits = ethers.parseUnits(royaltyFee.toFixed(decimals), decimals);
      const netUnits = ethers.parseUnits(netAmount.toFixed(decimals), decimals);

      if (ROYALTY_WALLET && royaltyFee > 0) {
        const tx1 = await token.transfer(ROYALTY_WALLET, royaltyUnits);
        await tx1.wait();
        setRevenue(r => r + royaltyFee);
      }

      const tx2 = await token.transfer(recipient, netUnits);
      const receipt = await tx2.wait();

      setResult({ txHash: receipt.hash, arcScanUrl: `${ARCSCAN}/tx/${receipt.hash}` });
      setAmount(''); setRecipient('');
      await refreshBalance(provider, address);
    } catch (e) { setError(e.reason || e.message); }
    setSending(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#06080f', color: '#c8d8f0', fontFamily: 'system-ui, sans-serif', padding: 20 }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#fff' }}>arcanvas</span>
          {address ? (
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#00d48a' }}>{short(address)}</span>
          ) : (
            <button onClick={connect} style={{ padding: '8px 16px', borderRadius: 8, background: '#0066ff', color: '#fff', border: 'none', fontSize: 13, cursor: 'pointer' }}>
              Connect Wallet
            </button>
          )}
        </div>

        {address && (
          <>
            <div style={{ background: '#0c1120', border: '1px solid #1c2640', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#3a4a6a', textTransform: 'uppercase', marginBottom: 6 }}>USDC Balance</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{parseFloat(usdcBal).toFixed(2)}</div>
            </div>

            <div style={{ background: '#0c1120', border: '1px solid #1c2640', borderRadius: 12, padding: 20, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                placeholder="Recipient 0x…"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                style={{ background: '#1c2640', border: 'none', borderRadius: 8, padding: 12, color: '#fff', fontFamily: 'monospace', fontSize: 13 }}
              />
              <input
                placeholder="Amount USDC"
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                style={{ background: '#1c2640', border: 'none', borderRadius: 8, padding: 12, color: '#fff', fontFamily: 'monospace', fontSize: 13 }}
              />

              {amount && (
                <div style={{ fontSize: 12, color: '#3a4a6a', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Platform fee (0.5%)</span>
                    <span style={{ color: '#9d5cff' }}>{royaltyFee.toFixed(4)} USDC</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Recipient gets</span>
                    <span style={{ color: '#00d48a' }}>{netAmount.toFixed(4)} USDC</span>
                  </div>
                </div>
              )}

              {error && <div style={{ fontSize: 12, color: '#ff3d5a' }}>{error}</div>}

              <button onClick={send} disabled={sending || !amount || !recipient}
                style={{ padding: 12, borderRadius: 8, background: sending ? '#1c2640' : '#0066ff', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                {sending ? 'Sending…' : 'Send USDC'}
              </button>
            </div>

            {result && (
              <div style={{ background: '#0c1120', border: '1px solid #00d48a44', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ color: '#00d48a', fontSize: 13, marginBottom: 8 }}>✓ Confirmed</div>
                <a href={result.arcScanUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#00e5ff', fontSize: 12, fontFamily: 'monospace' }}>
                  View on ArcScan ↗
                </a>
              </div>
            )}

            <div style={{ background: '#0c1120', border: '1px solid #1c2640', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 11, color: '#3a4a6a', textTransform: 'uppercase', marginBottom: 6 }}>Platform Revenue (this session)</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#9d5cff', fontFamily: 'monospace' }}>{revenue.toFixed(4)} USDC</div>
            </div>
          </>
        )}

        {!address && (
          <div style={{ textAlign: 'center', padding: 60, color: '#3a4a6a', fontSize: 13 }}>
            Connect wallet to send USDC on Arc Testnet
          </div>
        )}
      </div>
    </div>
  );
}
