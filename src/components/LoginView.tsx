import { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';

interface LoginViewProps {
  onLoginSuccess: (token: string, userData: any) => void;
}

export const LoginView = ({ onLoginSuccess }: LoginViewProps) => {
  const [nomeRevenda, setNomeRevenda] = useState('');
  const [senhaRevenda, setSenhaRevenda] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Carregar credenciais salvas ao montar o componente
  useEffect(() => {
    const savedUsername = localStorage.getItem('saved_username');
    const savedRemember = localStorage.getItem('remember_me') === 'true';
    
    if (savedUsername && savedRemember) {
      setNomeRevenda(savedUsername);
      setRememberMe(true);
    }
  }, []);

  // Login Admin - Bypass para desenvolvimento
  const handleAdminLogin = () => {
    const adminToken = 'admin-dev-token-' + Date.now();
    const adminUser = {
      id: 'admin',
      username: 'Administrador',
      role: 'admin',
      access_level: 'full'
    };
    
    localStorage.setItem('auth_token', adminToken);
    localStorage.setItem('is_admin', 'true');
    
    onLoginSuccess(adminToken, adminUser);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // ⚡ LOGIN ADMIN - Bypass para desenvolvimento
      if (nomeRevenda.toLowerCase() === 'admin' && senhaRevenda === 'admin123') {
        setTimeout(() => {
          handleAdminLogin();
          setIsLoading(false);
        }, 500);
        return;
      }

      // Endpoint da API - ajuste conforme necessário
      const response = await fetch('https://automatixbest-api.automation.app.br/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: nomeRevenda,
          password: senhaRevenda,
        }),
      });

      if (!response.ok) {
        throw new Error('Credenciais inválidas. Verifique seu nome de revenda e senha.');
      }

      const data = await response.json();
      
      // Extrair token - ajuste conforme a estrutura de resposta da API
      const token = data.access_token || data.token || data.result?.token;
      
      if (!token) {
        throw new Error('Token não recebido da API');
      }

      // Salvar credenciais se "Lembrar-me" estiver marcado
      if (rememberMe) {
        localStorage.setItem('saved_username', nomeRevenda);
        localStorage.setItem('remember_me', 'true');
      } else {
        localStorage.removeItem('saved_username');
        localStorage.removeItem('remember_me');
      }

      // Salvar token
      localStorage.setItem('auth_token', token);
      
      // Callback de sucesso
      onLoginSuccess(token, data.user || data);

    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Tente novamente.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top, #0b0f18 0%, #060810 80%);
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        /* Efeito de fundo animado */
        .login-container::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle at center,
            rgba(0, 191, 255, 0.08) 0%,
            transparent 50%
          );
          animation: rotate 30s linear infinite;
        }

        .login-container::after {
          content: '';
          position: absolute;
          bottom: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle at center,
            rgba(255, 0, 204, 0.08) 0%,
            transparent 50%
          );
          animation: rotate 40s linear infinite reverse;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background: rgba(17, 24, 39, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          padding: 48px 40px;
          box-shadow: 
            0 0 40px rgba(0, 191, 255, 0.15),
            0 0 80px rgba(255, 0, 204, 0.1);
          animation: fadeInUp 0.6s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .login-logo {
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(135deg, #00bfff 0%, #ff00cc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }

        .login-subtitle {
          font-size: 14px;
          color: #7a8aae;
          font-weight: 400;
        }

        .form-group {
          margin-bottom: 24px;
          position: relative;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #eaf2ff;
          margin-bottom: 10px;
          letter-spacing: 0.01em;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #7a8aae;
          pointer-events: none;
          transition: color 0.3s;
        }

        .form-input {
          width: 100%;
          background: rgba(11, 15, 24, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: #eaf2ff;
          padding: 14px 16px 14px 48px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s;
          outline: none;
        }

        .form-input:focus {
          background: rgba(11, 15, 24, 0.8);
          border-color: rgba(0, 191, 255, 0.4);
          box-shadow: 
            0 0 0 3px rgba(0, 191, 255, 0.1),
            0 0 20px rgba(0, 191, 255, 0.2);
        }

        .form-input:focus + .input-icon {
          color: #00bfff;
        }

        .form-input::placeholder {
          color: #4a5568;
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #7a8aae;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.3s;
        }

        .password-toggle:hover {
          color: #00bfff;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
        }

        .remember-label {
          font-size: 13px;
          color: #9ba6be;
          font-weight: 500;
          cursor: pointer;
          user-select: none;
        }

        .login-button {
          width: 100%;
          background: linear-gradient(135deg, #00bfff 0%, #0083ff 50%, #ff00cc 100%);
          background-size: 200% 200%;
          border: none;
          color: #ffffff;
          padding: 16px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.4s;
          box-shadow: 0 4px 16px rgba(0, 191, 255, 0.3);
          letter-spacing: 0.02em;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          background-position: 100% 50%;
          box-shadow: 
            0 6px 24px rgba(0, 191, 255, 0.4),
            0 0 40px rgba(255, 0, 204, 0.3);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 24px;
          color: #ff4a9a;
          font-size: 13px;
          font-weight: 500;
          animation: shake 0.5s;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }

        .forgot-password {
          text-align: center;
          margin-top: 24px;
        }

        .forgot-link {
          font-size: 13px;
          color: #7a8aae;
          text-decoration: none;
          transition: color 0.3s;
          font-weight: 500;
        }

        .forgot-link:hover {
          color: #00bfff;
        }

        .loading-spinner {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .admin-access {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .admin-button {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 215, 0, 0.3);
          color: #ffd700;
          padding: 12px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .admin-button:hover {
          background: rgba(255, 215, 0, 0.1);
          border-color: rgba(255, 215, 0, 0.5);
          transform: translateY(-1px);
        }

        .admin-badge {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #000;
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 6px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .dev-note {
          text-align: center;
          margin-top: 12px;
          font-size: 11px;
          color: #5a6478;
          font-style: italic;
        }
      `}</style>

      <div className="login-card">
        <div className="login-header">
          <h1 className="login-logo">AutonomyX</h1>
          <p className="login-subtitle">Dashboard Analytics IPTV</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="nomeRevenda" className="form-label">
              Nome da Revenda
            </label>
            <div className="input-wrapper">
              <input
                id="nomeRevenda"
                type="text"
                className="form-input"
                placeholder="Digite o nome da sua revenda"
                value={nomeRevenda}
                onChange={(e) => setNomeRevenda(e.target.value)}
                required
                disabled={isLoading}
              />
              <User size={20} className="input-icon" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="senhaRevenda" className="form-label">
              Senha da Revenda
            </label>
            <div className="input-wrapper">
              <input
                id="senhaRevenda"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Digite sua senha"
                value={senhaRevenda}
                onChange={(e) => setSenhaRevenda(e.target.value)}
                required
                disabled={isLoading}
              />
              <Lock size={20} className="input-icon" />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="remember-me">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              disabled={isLoading}
            />
            <label htmlFor="rememberMe" className="remember-label">
              Lembrar meu login
            </label>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span className="loading-spinner" />
                Entrando...
              </span>
            ) : (
              'Entrar no Dashboard'
            )}
          </button>
        </form>

        <div className="forgot-password">
          <a href="#" className="forgot-link">
            Esqueceu sua senha?
          </a>
        </div>

        {/* Acesso Admin - Desenvolvimento */}
        <div className="admin-access">
          <button
            type="button"
            className="admin-button"
            onClick={handleAdminLogin}
            disabled={isLoading}
          >
            <Lock size={16} />
            <span>Acesso Admin</span>
            <span className="admin-badge">DEV</span>
          </button>
          <p className="dev-note">
            Login: admin | Senha: admin123
          </p>
        </div>
      </div>
    </div>
  );
};
