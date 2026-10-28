import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { login } from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';
import { MedicalCrossIcon } from '../../components/common/Icons';
import { errorMessage } from '../utils';

export default function Login() {
  const { isAuthenticated, loginUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const onSubmit = async (values) => {
    setError('');
    try {
      const { data } = await login(values);
      loginUser(data.token);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Could not sign in. Is the server running?'));
    }
  };

  return (
    <div className="a-login">
      <motion.form
        className="a-login__card"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="a-login__mark"><MedicalCrossIcon size={26} /></span>
        <h1>Admin Panel</h1>
        <p>Sign in to manage your website content.</p>

        <label className="a-field">
          <span>Username</span>
          <input autoComplete="username" autoFocus {...register('username', { required: 'Username is required' })} />
          {errors.username && <small className="a-field__error">{errors.username.message}</small>}
        </label>
        <label className="a-field">
          <span>Password</span>
          <input type="password" autoComplete="current-password" {...register('password', { required: 'Password is required' })} />
          {errors.password && <small className="a-field__error">{errors.password.message}</small>}
        </label>

        {error && <div className="a-alert">{error}</div>}

        <button type="submit" className="btn btn--primary a-login__submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </motion.form>
    </div>
  );
}
