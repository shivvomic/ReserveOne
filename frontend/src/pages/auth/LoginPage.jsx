import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, ArrowRight } from 'lucide-react';
import { loginUser } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { isValidEmail } from '../../utils/validators';
import FormField from '../../components/FormField';
import PasswordInput from '../../components/PasswordInput';
import AuthCard from '../../components/AuthCard';
import Button from '../../components/Button';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function validate() {
    const newErrors = {};
    if (!isValidEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const { user, token } = await loginUser(formData);
      login(user, token);
      toast.success(`Welcome back, ${user.name}`);
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Log in to your account"
      subtitle="Enter your details to access your dashboard."
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-accent hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label="Email" id="email" error={errors.email}>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@campus.com"
              autoComplete="email"
              className="input-field pl-10"
            />
          </div>
        </FormField>

        <FormField label="Password" id="password" error={errors.password}>
          <PasswordInput
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
        </FormField>

        <Button type="submit" variant="primary" size="lg" loading={submitting} className="w-full">
          {submitting ? 'Signing in...' : (
            <>
              Log in <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </AuthCard>
  );
}

export default LoginPage;