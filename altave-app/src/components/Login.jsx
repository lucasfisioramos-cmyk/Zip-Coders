import React, { useState } from 'react';
import logo from '../assets/altave-logo.png';

const VALID_USER = 'carlos.dias';
const VALID_PASS = 'altave123';

export default function Login({ onSuccess }) {
  const [user, setUser] = useState('carlos.dias');
  const [pass, setPass] = useState('altave123');
  const [error, setError] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (user.trim() === VALID_USER && pass === VALID_PASS) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <img src={logo} alt="Altave" />
        </div>
        <div className="login-title">Central de Ordens de Serviço</div>
        <div className="login-subtitle">
          Acesso interno para abertura, execução e acompanhamento das ordens de manutenção.
        </div>

        {error && <div className="login-error">Usuário ou senha inválidos.</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="in-user">Usuário</label>
            <input
              id="in-user"
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="nome.sobrenome"
            />
          </div>
          <div className="field">
            <label htmlFor="in-pass">Senha</label>
            <input
              id="in-pass"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Digite a senha"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Entrar
          </button>
        </form>

        <div className="login-note">
          Sistema de uso estritamente interno.
          <br />
          Em caso de dúvidas, consulte o manual ou fale com o administrador.
        </div>
      </div>
    </div>
  );
}
