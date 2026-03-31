import '../index.css';

const Spinner = ({ size = '40px' }) => {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: '20vh' }}>
      <div
        className="spinner"
        style={{
          width: size,
          height: size,
          border: '4px solid var(--glass-border)',
          borderTop: '4px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Spinner;
