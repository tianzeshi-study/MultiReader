import React, { useState, useEffect } from 'react';
import SyncButton from './SyncButton';
import { IonLoading, IonToast } from '@ionic/react';
const base_url = import.meta.env.VITE_BASE_URL;

// 登录后展示的 Dashboard 页面
const Dashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  return (
    <div>
      <h2>欢迎来到 Dashboard</h2>
      <p>您已成功登录！</p>
      <SyncButton />
      <button onClick={onLogout}>退出登录</button>
    </div>
  );
};




export default Dashboard;