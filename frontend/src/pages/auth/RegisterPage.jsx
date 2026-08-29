import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, User, Hash, Users, ArrowRight } from 'lucide-react';
import { registerUser } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import {
  isValidEmail,
  isValidPassword,
  isValidName,
  isValidRollNumber,
  isValidClubName,
} from '../../utils/validators';
import FormField from '../../components/FormField';
import PasswordInput from '../../components/PasswordInput';
import AuthCard from '../../components/AuthCard';
import Button from '../../components/Button';

function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNumber: '',
    registrationType: 'PRIVATE',
    clubName: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function setRegistrationType(type) {
    setFormData({ ...formData, registrationType: type });
  }

  function validate() {
    const newErrors = {};
    if (!isValidName(formData.name)) newErrors.name = 'Name must be at least 2 characters';
    if (!isValidEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!isValidPassword(formData.password)) {
      newErrors.password = 'At least 8 characters, with a letter and a number';
    }
    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!isValidRollNumber(formData.rollNumber)) {
      newErrors.rollNumber = 'Roll number must be 3-20 alphanumeric characters';
    }
    if (formData.registrationType === 'CLUB' && !isValidClubName(formData.clubName)) {
      newErrors.clubName = 'Club name is required for club registrations';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const { user, token } = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        rollNumber: formData.rollNumber.trim(),
        registrationType: formData.registrationType,
        clubName: formData.registrationType === 'CLUB' ? formData.clubName.trim() : null,
      });
      login(user, token);
      toast.success('Account created successfully');
      navigate('/student/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Get started"
      title="Create your account"
      subtitle="New accounts are registered as students."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label="Full name" id="name" error={errors.name}>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              autoComplete="name"
              className="input-field pl-10"
            />
          </div>
        </FormField>

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

        <FormField label="Roll number" id="rollNumber" error={errors.rollNumber}>
          <div className="relative">
            <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="rollNumber"
              name="rollNumber"
              type="text"
              value={formData.rollNumber}
              onChange={handleChange}
              placeholder="CS2026042"
              className="input-field pl-10"
            />
          </div>
        </FormField>

        <FormField label="Registration type" id="registrationType">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              aria-pressed={formData.registrationType === 'PRIVATE'}
              onClick={() => setRegistrationType('PRIVATE')}
              className={`rounded-btn border px-3 py-2 text-sm font-medium transition-colors ${
                formData.registrationType === 'PRIVATE'
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-muted hover:border-border-hover hover:text-foreground'
              }`}
            >
              Private
            </button>
            <button
              type="button"
              aria-pressed={formData.registrationType === 'CLUB'}
              onClick={() => setRegistrationType('CLUB')}
              className={`rounded-btn border px-3 py-2 text-sm font-medium transition-colors ${
                formData.registrationType === 'CLUB'
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-muted hover:border-border-hover hover:text-foreground'
              }`}
            >
              Club representative
            </button>
          </div>
        </FormField>

        {formData.registrationType === 'CLUB' && (
          <FormField label="Club name" id="clubName" error={errors.clubName}>
            <div className="relative">
              <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="clubName"
                name="clubName"
                type="text"
                value={formData.clubName}
                onChange={handleChange}
                placeholder="Robotics Club"
                className="input-field pl-10"
              />
            </div>
          </FormField>
        )}

        <FormField label="Password" id="password" error={errors.password}>
          <PasswordInput
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </FormField>

        <FormField label="Confirm password" id="confirmPassword" error={errors.confirmPassword}>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </FormField>

        <Button type="submit" variant="primary" size="lg" loading={submitting} className="w-full">
          {submitting ? 'Creating account...' : (
            <>
              Create account <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </AuthCard>
  );
}

export default RegisterPage;