import React, { useState, useEffect } from 'react';
import SyncButton from './SyncButton';
// 注册组件
const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });

      if (response.status === 418) {
        setError('注册失败：可能用户名或邮箱已存在。');
      } else if (response.ok) {
        setSuccess(true);
      } else {
        setError('发生未知错误');
      }
    } catch (err) {
      setError('网络错误');
    }
  };

  return (
    <div>
      <h2>注册</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>注册成功！</p>}
      <form onSubmit={handleRegister}>
        <div>
          <label htmlFor="register-username">用户名：</label>
          <input
            id="register-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="register-email">邮箱：</label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="register-password">密码：</label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">注册</button>
      </form>
    </div>
  );
};

// 定义 LoginForm 组件属性，添加 onLogin 回调通知顶层组件登录成功
interface LoginFormProps {
  onLogin: () => void;
}

// 登录组件
const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoggedIn(false);

    try {
      const response = await fetch('http://localhost:3000/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (response.status === 401) {
        setError('登录失败：可能密码错误或用户不存在。');
      } else if (response.ok) {
        // 解析 JSON 响应，假设后端返回的是 JWT 字符串
        const data = await response.json();

        if (data && typeof data === 'string') {
          console.log("jwt:", data);
          // 存储 JWT 到 localStorage
          localStorage.setItem('jwt', data);
          setLoggedIn(true);
          // 通知顶层组件登录成功
          onLogin();
        } else {
          setError('登录成功，但返回的 token 无效');
        }
      } else {
        setError('发生未知错误');
      }
    } catch (err) {
      console.log(err);
      setError('网络错误');
    }
  };

  return (
    <div>
      <h2>登录</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loggedIn && <p style={{ color: 'green' }}>登录成功！</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="login-username">用户名：</label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="login-password">密码：</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">登录</button>
      </form>
    </div>
  );
};

// 登录后展示的 Dashboard 页面
const Dashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  return (
    <div>
      <h2>欢迎来到 Dashboard</h2>
      <p>您已成功登录！</p>
      <SyncButton/>
      <button onClick={onLogout}>退出登录</button>
    </div>
  );
};

// 主页面，根据登录状态显示不同的页面
const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  // 全局登录状态，根据 localStorage 判断（也可以在登录时更新该状态）
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // 组件加载时检查 localStorage 中是否存在 JWT
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      setIsAuthenticated(true);
          }
  }, []);
  
  const authenticatedEffect =  useEffect(() => {
      console.log("isAuthenticated");
}, [isAuthenticated]);

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
