import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      const user = await login(data.email, data.password);
      if (user.role === 'admin') {
        navigate('/admin/rooms');
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-md border border-slate-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            Masuk ke <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">KosHub</span>
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Sistem Reservasi Kamar Kos Online Terbaik
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
            {errorMsg}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Alamat Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'Alamat email wajib diisi',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Format email tidak valid'
                  }
                })}
                className={`appearance-none rounded-lg relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 placeholder-slate-400 focus:ring-violet-500 focus:border-violet-500'
                } text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm`}
                placeholder="contoh@koshub.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Kata Sandi (Password)
              </label>
              <input
                id="password"
                type="password"
                {...register('password', { required: 'Kata sandi wajib diisi' })}
                className={`appearance-none rounded-lg relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 placeholder-slate-400 focus:ring-violet-500 focus:border-violet-500'
                } text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 shadow transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LogIn className="h-5 h-5 text-violet-400 group-hover:text-violet-300" aria-hidden="true" />
              </span>
              {submitting ? 'Menghubungkan...' : 'Masuk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
