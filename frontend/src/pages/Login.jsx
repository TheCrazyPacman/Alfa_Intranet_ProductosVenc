import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import api from '../api';
import './Login.css';
import ReCAPTCHA from "react-google-recaptcha";
import logoEmpresa from '../assets/img/logo-corp.jpeg'; 
// 1. Importamos toast
import { toast } from 'react-toastify';

const Login = () => {
  const [username, setUser] = useState('');
  const [password, setPass] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef(null);
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (honeypot !== '') {
      return;
    }

    if (!captchaToken) {
      // 2. Reemplazamos alert por toast.warn o toast.error
      toast.warn('Por favor, completa el captcha.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { 
        username, 
        password, 
        tokenSecurity: captchaToken 
      });

      if (res.data.status === 0) { 
        sessionStorage.setItem('token', res.data.token);
        sessionStorage.setItem('userData', JSON.stringify(res.data.user));
        
        // 3. Opcional: Mensaje de éxito antes de navegar
        toast.success(`¡Bienvenido, ${res.data.user.nombre}!`);
        navigate('/Inicio');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error de conexión';
      
      // 4. Aquí se mostrará "Sin acceso a Intranet" de forma elegante
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
    });
      
      setCaptchaToken(null);
      if (recaptchaRef.current) { recaptchaRef.current.reset(); }
      setPass('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
      <form onSubmit={handleLogin} className="login-card">
        <div className="logo-container">
          <img src={logoEmpresa} alt="Logo Empresa" className="login-logo" />
        </div>
        
        <input 
          type="text" 
          name="honeypot" 
          style={{ display: 'none' }} 
          tabIndex="-1" 
          autoComplete="off" 
          onChange={(e) => setHoneypot(e.target.value)} 
        />

        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Iniciar Sesión</h3>
        
        <input type="text" 
          placeholder="Usuario" 
          className="input-style" 
          onChange={(e) => setUser(e.target.value)} 
          required
        />
        
        <input type="password" 
          placeholder="Contraseña" 
          className="input-style" 
          value={password}
          onChange={(e) => setPass(e.target.value)} 
          required
        />

        <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0' }}>
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={import.meta.env.VITE_COPIA_CLAVE_SITIO} 
            onChange={(token) => setCaptchaToken(token)}
            onExpired={() => setCaptchaToken(null)}
          />
        </div>

        <button 
          type="submit" 
          className="btn-login" 
          disabled={!captchaToken || loading}
        >
          {loading ? 'Cargando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default Login;