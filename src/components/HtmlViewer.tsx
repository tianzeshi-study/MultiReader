import React, { useState } from 'react';

const HtmlViewer: React.FC<{ htmlContent: string }> = ({ htmlContent }) => {
  return (
    <div
      style={{ border: '1px solid #ddd', padding: '10px', maxHeight: '400px', overflowY: 'auto' }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};


export default  HtmlViewer;