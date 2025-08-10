import React, { useState } from 'react';

interface LoginPageProps {
  onLoginAttempt: (usernameOrEmail: string, passwordAttempt: string) => boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginAttempt }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    if (!username || !password) {
      setError('Por favor, preencha o usuário e a senha.');
      return;
    }
    if (/\s/.test(username) || /\s/.test(password)) {
      setError('Usuário e senha não podem conter espaços.');
      return;
    }
    const success = onLoginAttempt(username, password);
    if (!success) {
      setError('Usuário ou senha inválidos.');
    }
    // On success, App.tsx will change the view
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-[#002D5A] mb-8 sm:mb-10">
          StoneX BRules
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Usuário
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00A3E0] focus:border-[#00A3E0] sm:text-sm placeholder-gray-400"
              placeholder="admin"
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Senha
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00A3E0] focus:border-[#00A3E0] sm:text-sm placeholder-gray-400"
              placeholder="••••••••"
            />
            <div className="mt-2 flex items-center">
              <input
                id="show-password"
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
                className="h-4 w-4 text-[#00A3E0] focus:ring-[#00A3E0] border-gray-300 rounded"
              />
              <label
                htmlFor="show-password"
                className="ml-2 block text-sm text-gray-900"
              >
                Mostrar senha
              </label>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00A3E0] hover:bg-[#0082B8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A3E0] transition-colors duration-150"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
