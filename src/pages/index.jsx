import { useState } from 'react';
import Payment from './components/Payment';

export default function Home() {
  // यह क्लाउड-कंट्रोल्ड स्टेट है
  const [btnText] = useState('Verify Cloud Trigger');

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Arcanvas Engine</h1>
      <p style={{ color: 'blue' }}>Status: Sync Active</p>
      <button onClick={() => alert('Cloud Trigger Verified')}>{btnText}</button>
    </div>
  );
}
