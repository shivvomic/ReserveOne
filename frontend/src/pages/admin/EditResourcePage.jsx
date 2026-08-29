import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { fetchResourceById, updateResource } from '../../services/resourceService';
import ResourceForm from '../../components/ResourceForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card from '../../components/Card';

function EditResourcePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchResourceById(id)
      .then((data) => {
        setInitialValues({
          name: data.name,
          category: data.category,
          description: data.description || '',
          location: data.location,
          capacity: data.capacity ?? '',
          status: data.status,
          image_url: data.image_url || '',
        });
      })
      .catch(() => {
        toast.error('Resource not found.');
        navigate('/admin/resources');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleSubmit(data) {
    setSubmitting(true);
    try {
      await updateResource(id, data);
      toast.success('Resource updated successfully');
      navigate('/admin/resources');
    } catch (error) {
      const message = error.response?.data?.message || 'Could not update resource.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading resource..." />;
  if (!initialValues) return null;

  return (
    <div className="max-w-lg">
      <Link to="/admin/resources" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to resources
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">Edit Resource</h1>
      <Card className="mt-6">
        <ResourceForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Save changes"
        />
      </Card>
    </div>
  );
}

export default EditResourcePage;