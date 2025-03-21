import React, { useState } from 'react';

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

// 登录组件
const LoginForm: React.FC = () => {
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

      if (response.status === 418) {
        setError('登录失败：可能密码错误或用户不存在。');
      } else if (response.ok) {
        setLoggedIn(true);
      } else {
        setError('发生未知错误');
      }
    } catch (err) {
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

// 主页面，通过按钮切换登录/注册
const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <button onClick={() => setIsLogin(true)} disabled={isLogin}>
          登录
        </button>
        <button onClick={() => setIsLogin(false)} disabled={!isLogin}>
          注册
        </button>
      </div>
      {isLogin ? <LoginForm /> : <RegisterForm />}
    </div>
  );
};

export default AuthPage;
