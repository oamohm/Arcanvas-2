import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const ARC_CHAIN_ID = '0x8AC'; // 2222 in hex
const RPC_URL = 'https://rpc.testnet.arc.network';
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS;
const ROYALTY_WALLET = process.env.NEXT_PUBLIC_ROYALTY_WALLET;

export default function Home() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0.00");
  const [sending, setSending] = useState(false);

  async function connect() {
    if (!window.ethereum) return alert("Install MetaMask");
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: ARC_CHAIN_ID,
          chainName: 'Arc Testnet',
          rpcUrls: [RPC_URL],
          nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 }
        }]
      });
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAddress(accounts[0]);
    } catch (e) { console.error(e); }
  }

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
        <h2>arcanvas</h2>
        <button onClick={connect} style={{ padding: '10px 20px', background: '#3b82f6', border: 'none', color: '#fff', cursor: 'pointer' }}>
          {address ? `${address.slice(0,6)}...${address.slice(-4)}` : "Connect Wallet"}
        </button>
      </nav>
      
      <div style={{ maxWidth: '400px', margin: '0 auto', border: '1px solid #333', padding: '20px' }}>
        <p>USDC BALANCE</p>
        <h1 style={{ fontSize: '32px' }}>{balance}</h1>
      </div>
    </div>
  );
}
