import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const ARC_CONFIG = {
  chainId: '0x8AC',
  chainName: 'Arc Testnet',
  rpcUrls: ['https://rpc.testnet.arc.network'],
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 }
};

export default function Home() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0.00");

  const connect = async () => {
    if (!window.ethereum) return alert("MetaMask आवश्यक है");
    try {
      await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [ARC_CONFIG] });
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAddress(accounts[0]);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const bal = await provider.getBalance(accounts[0]);
      setBalance(ethers.formatUnits(bal, 6));
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ background: '#000', color: '#fff', height: '100vh', padding: '20px', fontFamily: 'monospace' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h3>arcanvas</h3>
        <button onClick={connect} style={{ background: '#fff', color: '#000', border: 'none', padding: '8px 16px' }}>
          {address ? `${address.slice(0,6)}...${address.slice(-4)}` : "Connect Wallet"}
        </button>
      </header>
      <main style={{ textAlign: 'center', marginTop: '100px' }}>
        <p>USDC BALANCE</p>
        <h1>{balance}</h1>
      </main>
    </div>
  );
}
