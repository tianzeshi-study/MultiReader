import React from 'react';
import WorkspaceReader from '../components/WorkspaceReader'; 
import FileToHtml from '../components/FileToHtml'; 

const WorkspaceTab: React.FC = () => {

  return (
    <div>
      <WorkspaceReader FileToHtmlComponent={FileToHtml} />
    </div>
  );
};

export default WorkspaceTab;