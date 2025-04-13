import React, { useState } from 'react';
import { IonLoading, IonToast } from '@ionic/react';
import Dashboard from './Dashboard';
import LoginForm from './LoginForm';

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
  const [confirmPassword, setConfirmPassword] = useState<string>(''); // 新增确认密码状态

  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  const [showToast, setShowToast] = useState<boolean>(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 清空之前的提示
    setToastMessage('');

    // 新增：先验证两次输入的密码是否一致
    if (password !== confirmPassword) {
      setToastMessage('两次输入的密码不一致，请重新输入');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

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
      }else if (response.status === 409) {
        setToastMessage('注册失败：用户名或邮箱已存在。');
        setToastColor('danger');
      } else if (response.ok) {
        setToastMessage('注册成功！');
        setToastColor('success');
      } else {
        console.log("status code:", response.status);
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
        <div>
          <label htmlFor="register-confirm-password">确认密码：</label>
          <input
            id="register-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
        duration={20000}
        color={toastColor}
      />
    </div>
  );
};

export default RegisterForm;
