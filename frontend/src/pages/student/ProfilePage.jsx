import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Mail, Shield } from 'lucide-react';
import { fetchProfile, updateUserProfile } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { isValidName } from '../../utils/validators';
import FormField from '../../components/FormField';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import { getInitials } from '../../utils/getInitials';


function ProfilePage() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile()
      .then((data) => {
        setProfile(data);
        setName(data.name);
      })
      .catch(() => toast.error('Could not load your profile.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValidName(name)) {
      setErrors({ name: 'Name must be at least 2 characters' });
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const updated = await updateUserProfile({ name });
      setProfile(updated);
      updateUser(updated);
      toast.success('Profile updated');
    } catch (error) {
      const message = error.response?.data?.message || 'Could not update your profile.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading your profile..." />;
  if (!profile) return null;

  return (
    <div className="max-w-md">
      <PageHeader title="My Profile" />

      <div className="mt-6 rounded-card border border-border bg-surface p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent/15 text-lg font-semibold text-accent">
            {getInitials(profile.name)}
          </div>
          <div>
            <p className="font-semibold text-foreground">{profile.name}</p>
            <p className="text-sm text-muted">{profile.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <FormField label="Full name" id="name" error={errors.name}>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </FormField>

          <FormField label="Email" id="email">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input id="email" value={profile.email} disabled className="input-field cursor-not-allowed pl-10 text-muted-foreground" />
            </div>
          </FormField>

          <FormField label="Role" id="role">
            <div className="relative">
              <Shield className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input id="role" value={profile.role} disabled className="input-field cursor-not-allowed pl-10 text-muted-foreground" />
            </div>
          </FormField>

          <Button type="submit" variant="primary" loading={saving}>
            Save changes
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;