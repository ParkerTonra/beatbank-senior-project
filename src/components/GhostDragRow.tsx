
interface GhostRowProps {
    title: string; // Passing the title of the beat to display
  }

function GhostRow({ title }: GhostRowProps) {
    return (
      <div
        style={{
          padding: '10px',
          backgroundColor: '#5b81fc',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          fontWeight: 'bold',
          width: '350px',
          textAlign: 'center',
        }}
      >
        {title}
      </div>
    );
  }
  
  export default GhostRow;