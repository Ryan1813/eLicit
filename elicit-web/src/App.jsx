import React, { useState } from 'react';

function App() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    alert(`Tentativa de login com o usuário: ${usuario}`);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', margin: 0, fontFamily: 'Arial, sans-serif', overflow: 'hidden' }}>
      
      {/* Lado Esquerdo: Formulário de Login */}
      <div style={{ flex: 1, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Logo */}
          <div style={{ backgroundColor: '#008751', color: '#ffffff', padding: '10px 24px', borderRadius: '8px', fontSize: '24px', fontWeight: 'bold', marginBottom: '40px', letterSpacing: '1px' }}>
            eLicit
          </div>

          {/* Formulário */}
          <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <input 
                type="text" 
                placeholder="Usuário" 
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', backgroundColor: '#f7f7f7', border: '1px solid #e1e1e1', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Senha" 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', backgroundColor: '#f7f7f7', border: '1px solid #e1e1e1', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button 
              type="submit"
              style={{ width: '100%', padding: '12px', backgroundColor: '#2c3e50', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
            >
              ENTRAR
            </button>
          </form>

          <a href="#criar" style={{ color: '#0056b3', fontSize: '13px', textDecoration: 'none', marginTop: '20px', fontWeight: '500' }}>
            CRIAR CONTA
          </a>

          <span style={{ color: '#888888', fontSize: '14px', margin: '20px 0' }}>ou</span>

          <button 
            type="button"
            style={{ width: '100%', padding: '10px', backgroundColor: '#ffffff', color: '#333333', border: '1px solid #d1d1d1', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
          >
            <span style={{ color: '#ea4335', fontWeight: 'bold', fontSize: '16px' }}>G</span> Continuar com o Google
          </button>

        </div>
      </div>

      {/* Lado Direito: Painel de Boas-Vindas */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #008751 0%, #4caf50 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#ffffff', padding: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 'bold', margin: '0 0 15px 0' }}>Seja Bem-Vindo</h1>
        <p style={{ fontSize: '18px', margin: 0, opacity: 0.9 }}>Efetue Seu Login</p>
      </div>

    </div>
  );
}

export default App;