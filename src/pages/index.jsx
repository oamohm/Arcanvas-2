import Payment from './components/Payment';

export default function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Arcanvas Engine</h1>
      <p style={{ color: 'blue', fontWeight: 'bold' }}>Status: Cloud-to-Vercel Sync Active</p>
      <Payment />
    </div>
  );
}
