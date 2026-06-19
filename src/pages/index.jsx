import Payment from './components/Payment';

export default function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Arcanvas Engine</h1>
      <p style={{ fontSize: '12px', color: '#666' }}>Status: Pipeline Operational</p>
      <Payment />
    </div>
  );
}
