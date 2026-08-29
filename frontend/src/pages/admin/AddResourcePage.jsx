import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { createResource } from '../../services/resourceService';
import ResourceForm from '../../components/ResourceForm';
import Card from '../../components/Card';

const emptyResource = {
  name: '',
  category: '',
  description: '',
  location: '',
  capacity: '',
  status: 'AVAILABLE',
  image_url: '',
};

function AddResourcePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(data) {
    setSubmitting(true);
    try {
      await createResource(data);
      toast.success('Resource created successfully');
      navigate('/admin/resources');
    } catch (error) {
      const message = error.response?.data?.message || 'Could not create resource.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg">
      <Link to="/admin/resources" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to resources
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">Add Resource</h1>
      <Card className="mt-6">
        <ResourceForm
          initialValues={emptyResource}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Create resource"
        />
      </Card>
    </div>
  );
}

export default AddResourcePage;