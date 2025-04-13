import React, { useState, useEffect } from 'react';
import { IonLoading, IonToast } from '@ionic/react';
import Dashboard from './Dashboard';

const base_url = import.meta.env.VITE_BASE_URL;
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

// 注册组件
const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  const [showToast, setShowToast] = useState<boolean>(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 清空之前的提示
    setToastMessage('');
    
    // 密码复杂度校验：至少包含一个小写字母、一个大写字母、一个数字和一个符号
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/;
    if (!passwordRegex.test(password)) {
      setToastMessage('密码必须包含大写字母、小写字母、数字和符号');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    setLoading(true);
    try {
    const response = await fetch(`${base_url}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });
      setLoading(false);
      if (response.status === 418) {
        setToastMessage('注册失败：可能用户名或邮箱已存在。');
        setToastColor('danger');
      } else if (response.ok) {
        setToastMessage('注册成功！');
        setToastColor('success');
      } else {
        setToastMessage('发生未知错误');
        setToastColor('danger');
      }
    } catch (err) {
      setLoading(false);
      setToastMessage('网络错误');
      setToastColor('danger');
    }
    setShowToast(true);
  };

  return (
    <div>
      <h2>注册</h2>
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

      <IonLoading isOpen={loading} message="请稍候..." />
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        color={toastColor}
      />
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

  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  const [showToast, setShowToast] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setToastMessage('');
    setLoading(true);
    try {
      const response = await fetch(`${base_url}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      setLoading(false);
      if (response.status === 401) {
        setToastMessage('登录失败：可能密码错误或用户不存在。');
        setToastColor('danger');
      } else if (response.ok) {
        // 解析 JSON 响应，假设后端返回的是 JWT 字符串
        const data = await response.json();
        if (data && typeof data === 'string') {
          localStorage.setItem('jwt', data);
          setToastMessage('登录成功！');
          setToastColor('success');
          onLogin();
        } else {
          setToastMessage('登录成功，但返回的 token 无效');
          setToastColor('danger');
        }
      } else {
        setToastMessage('发生未知错误');
        setToastColor('danger');
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setToastMessage('网络错误');
      setToastColor('danger');
    }
    setShowToast(true);
  };

  return (
    <div>
      <h2>登录</h2>
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

      <IonLoading isOpen={loading} message="请稍候..." />
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        color={toastColor}
      />
    </div>
  );
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
