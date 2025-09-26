import React, { useState, useEffect } from 'react';
import { IonLoading, IonToast } from '@ionic/react';

const base_url = import.meta.env.VITE_BASE_URL;
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
      console.log("base_url:", base_url);
      setLoading(false);
      // setToastMessage(`网络错误${base_url}${err}`);
      setToastMessage(`网络错误${err}`);
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
        duration={20000}
        color={toastColor}
      />
    </div>
  );
};


export default LoginForm;
