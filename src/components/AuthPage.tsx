import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';


// 检查 JWT 是否过期
const isJwtExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return true;
    // exp 为秒级时间戳
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error('无效的 token:', error);
    return true;
  }
};



// 主页面，根据登录状态显示不同的页面
const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  // 全局登录状态，根据 localStorage 判断（也可以在登录时更新该状态）
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // 组件加载时检查 localStorage 中是否存在 JWT 并判断是否过期
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      if (isJwtExpired(token)) {
        localStorage.removeItem('jwt');
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // 登录成功回调
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // 退出登录时清除 localStorage 中的 token
  const handleLogout = () => {
    localStorage.removeItem('jwt');
    setIsAuthenticated(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '1rem' }}>
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <button onClick={() => setIsLogin(true)} disabled={isLogin}>
              登录
            </button>
            <button onClick={() => setIsLogin(false)} disabled={!isLogin}>
              注册
            </button>
          </div>
          {isLogin ? <LoginForm onLogin={handleLoginSuccess} /> : <RegisterForm />}
        </>
      )}
    </div>
  );
};

export default AuthPage;
