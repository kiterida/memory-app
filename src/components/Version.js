import React from 'react';

const Version = () => {
  const version = process.env.REACT_APP_VERSION || 'dev';

  return (
    <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', padding: '10px' }}>
      Version: {version}
    </div>
  );
};

export default Version;
