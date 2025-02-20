import React from 'react';
import WorkspaceReader from '../components/WorkspaceReader'; 
import FileToHtml from '../components/FileToHtml'; // Import your FileToHtml component

const WorkspaceTab: React.FC = () => {

  return (
    <div>
      <h1>My Pages</h1>
      <WorkspaceReader FileToHtmlComponent={FileToHtml} />
    </div>
  );
};

export default WorkspaceTab;