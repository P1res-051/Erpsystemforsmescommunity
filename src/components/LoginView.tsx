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
      console.log('🔐 Tentando fazer login...');
      console.log('📧 Username:', nomeRevenda);

      // ⚡ LOGIN ADMIN - Bypass para desenvolvimento
      if (nomeRevenda.toLowerCase() === 'admin' && senhaRevenda === 'admin123') {
        console.log('✅ Login admin detectado');
        setTimeout(() => {
          handleAdminLogin();
          setIsLoading(false);
        }, 500);
        return;
      }

      console.log('🌐 Chamando API de login real...');

      // Criar controller para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      // API REAL - Endpoint de login do painel
      let response: Response;
      try {
        response = await fetch('https://automatixbest-api.automation.app.br/api/painel/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: nomeRevenda,
            password: senhaRevenda,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('⏱️ Timeout: O servidor demorou muito para responder. Tente novamente.');
        }
        
        throw new Error('❌ Não foi possível conectar ao servidor. Verifique sua conexão de internet.');
      }

      console.log('📡 Status da resposta:', response.status, response.statusText);

      // Tentar ler a resposta como JSON
      let data: any;
      try {
        const textResponse = await response.text();
        console.log('📄 Resposta bruta:', textResponse.substring(0, 200));
        
        try {
          data = JSON.parse(textResponse);
          console.log('✅ JSON parseado:', data);
        } catch (jsonError) {
          console.error('❌ Erro ao parsear JSON:', jsonError);
          throw new Error('Resposta inválida do servidor. Verifique se o backend está online.');
        }
      } catch (readError) {
        console.error('❌ Erro ao ler resposta:', readError);
        throw new Error('Não foi possível conectar ao servidor');
      }

      // Verificar se houve erro na API
      if (!response.ok) {
        const errorMsg = data?.error || data?.message || 'Credenciais inválidas. Verifique seu nome de revenda e senha.';
        console.error('❌ API retornou erro:', errorMsg);
        throw new Error(errorMsg);
      }

      // Verificar se o login foi bem-sucedido
      if (data.success === false || data.error) {
        const errorMsg = data.error || data.message || 'Falha na autenticação';
        console.error('❌ Login falhou:', errorMsg);
        throw new Error(errorMsg);
      }
      
      // Extrair dados da API real
      const { phpsessid, cache_key, resellerid } = data;
      
      console.log('📦 Dados recebidos:', {
        phpsessid: phpsessid ? '***' : 'AUSENTE',
        cache_key: cache_key ? cache_key.substring(0, 20) + '...' : 'AUSENTE',
        resellerid: resellerid || 'AUSENTE'
      });
      
      if (!cache_key) {
        console.error('❌ Cache key ausente');
        throw new Error('Cache key não retornado pela API. Verifique o backend.');
      }

      if (!phpsessid) {
        console.error('❌ PHPSESSID ausente');
        throw new Error('PHPSESSID não retornado pela API. Verifique o backend.');
      }

      console.log('✅ Login bem-sucedido!');

      // Salvar credenciais se "Lembrar-me" estiver marcado
      if (rememberMe) {
        localStorage.setItem('saved_username', nomeRevenda);
        localStorage.setItem('remember_me', 'true');
      } else {
        localStorage.removeItem('saved_username');
        localStorage.removeItem('remember_me');
      }

      // Salvar tokens da API real
      localStorage.setItem('auth_token', phpsessid);
      localStorage.setItem('cache_key', cache_key);
      localStorage.setItem('phpsessid', phpsessid);
      localStorage.setItem('resellerid', resellerid);
      
      // Callback de sucesso com dados do usuário
      const userData = {
        username: nomeRevenda,
        resellerid,
        cache_key,
      };
      
      onLoginSuccess(cache_key, userData);

    } catch (err: any) {
      let errorMessage = 'Erro ao fazer login. Tente novamente.';
      
      // Detectar tipos específicos de erro
      if (err.name === 'AbortError') {
        errorMessage = '⏱️ Timeout: O servidor demorou muito para responder. Tente novamente.';
      } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        errorMessage = '🚫 ERRO DE CORS: O backend não permite requisições deste domínio.\n\n' +
          '💡 SOLUÇÕES:\n' +
          '1. Use login ADMIN (username: admin / senha: admin123)\n' +
          '2. Configure CORS no backend para permitir: ' + window.location.origin + '\n' +
          '3. Use proxy local (veja PROXY_SETUP.md)';
        console.error('❌ CORS ERROR - Backend bloqueou requisição cross-origin');
        console.error('Origin do frontend:', window.location.origin);
        console.error('Backend URL:', 'https://automatixbest-api.automation.app.br');
      } else if (err.message?.includes('Resposta inválida')) {
        errorMessage = '❌ Servidor retornou resposta inválida. Entre em contato com o suporte.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 24px;
          color: #ff4a9a;
          font-size: 13px;
          font-weight: 500;
          animation: shake 0.5s;
        }

        .error-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .error-solutions {
          margin-top: 12px;
          padding: 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          border-left: 3px solid #00bfff;
        }

        .error-solutions h4 {
          color: #00bfff;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .error-solutions ol {
          margin: 0;
          padding-left: 20px;
          color: #cbd5e1;
        }

        .error-solutions li {
          margin-bottom: 6px;
          line-height: 1.5;
        }

        .cors-warning {
          background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%);
          border: 1px solid rgba(255, 193, 7, 0.3);
        }

        .cors-warning .error-header {
          color: #ffc107;
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
            <div className={error.includes('CORS') ? 'error-message cors-warning' : 'error-message'}>
              <div className="error-header">
                <AlertCircle size={18} />
                <span style={{ fontWeight: 700 }}>
                  {error.includes('CORS') ? '🚫 ERRO DE CORS DETECTADO' : 'Erro ao fazer login'}
                </span>
              </div>
              
              {error.includes('CORS') ? (
                <>
                  <p style={{ marginBottom: 12, lineHeight: 1.5 }}>
                    O backend não permite requisições vindas deste domínio.
                  </p>
                  <div className="error-solutions">
                    <h4>💡 Soluções Rápidas:</h4>
                    <ol>
                      <li>
                        <strong>Login Admin (Recomendado):</strong><br />
                        Username: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>admin</code><br />
                        Senha: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>admin123</code>
                      </li>
                      <li>
                        <strong>Configure CORS no Backend:</strong><br />
                        Adicione este origin: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>{window.location.origin}</code>
                      </li>
                      <li>
                        <strong>Use Proxy Local:</strong><br />
                        Execute: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>python botconversa_proxy.py</code>
                      </li>
                    </ol>
                  </div>
                </>
              ) : (
                <span>{error}</span>
              )}
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

        {/* Banner de Ajuda CORS */}
        {error && error.includes('CORS') && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.05) 0%, rgba(255, 0, 204, 0.05) 100%)',
            border: '1px solid rgba(0, 191, 255, 0.2)',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '13px', color: '#00bfff', fontWeight: 700, marginBottom: '8px' }}>
              💡 SOLUÇÃO RÁPIDA
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6 }}>
              Use o botão <strong style={{ color: '#ffd700' }}>ACESSO ADMIN</strong> abaixo<br />
              para testar o dashboard sem conexão com backend
            </div>
          </div>
        )}

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
