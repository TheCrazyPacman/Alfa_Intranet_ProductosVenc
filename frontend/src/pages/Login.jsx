import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import api from '../api';
import './Login.css';
import ReCAPTCHA from "react-google-recaptcha";
import logoEmpresa from '../assets/img/logo-corp.jpeg'; 


const Login = () => {
  const [username, setUser] = useState('');
  const [password, setPass] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef(null);
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (honeypot !== '') {
      console.log("Bot detectado");
      return;
    }

    if (!empresa) {
      alert('Por favor, seleccione una empresa de destino.');
      return;
    }

    if (!captchaToken) {
      alert('Por favor, completa el captcha.');
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
        sessionStorage.setItem('empresa_destino', empresa);
        navigate('/Inicio');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error de conexión';
      alert(errorMsg);
      
      setCaptchaToken(null);
        if (recaptchaRef.current) {recaptchaRef.current.reset(); }
      setPass('');
    } finally {
      setLoading(false); // Finalizamos carga
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
      <form onSubmit={handleLogin} className="login-card">
        <div className="logo-container">
          <img src={logoEmpresa} alt="Logo Empresa" className="login-logo" />
        </div>
        {/* Honeypot */}
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
        />
        
        <input type="password" 
          placeholder="Contraseña" 
          className="input-style" 
          onChange={(e) => setPass(e.target.value)} 
        />

        {/* COMBO DE EMPRESA */}
        <div style={{ marginBottom: '15px' }}>
          <select 
            className="input-style" 
            value={empresa} 
            onChange={(e) => setEmpresa(e.target.value)}
            required
            style={{ width: '100%', cursor: 'pointer' }}
          >
            <option value="" disabled>Seleccione Empresa</option>
            <option value="Alfa Distribuidores S.A">Alfa Distribuidores S.A</option>
            <option value="TORU">Toru</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0' }}>
          <ReCAPTCHA
            ref={recaptchaRef} // Conectamos la Ref
            sitekey={import.meta.env.VITE_COPIA_CLAVE_SITIO} 
            onChange={(token) => setCaptchaToken(token)}
            onExpired={() => setCaptchaToken(null)} // Si expira, deshabilitamos el botón
          />
        </div>

        <button 
          type="submit" 
          className="btn-login" 
          //disabled={!turnstileToken} 
          disabled={!captchaToken || loading}
        >
          Entrar
        </button>
      </form>
    </div>
  );
};

export default Login;