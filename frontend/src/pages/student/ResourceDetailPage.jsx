import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, Users } from 'lucide-react';
import { fetchResourceById } from '../../services/resourceService';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResourceReviews from '../../components/ResourceReviews';
import Button from '../../components/Button';
import { RESOURCE_PLACEHOLDER_IMAGE } from '../../utils/placeholderImage';

function ResourceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadResource() {
      setLoading(true);
      try {
        const data = await fetchResourceById(id);
        if (isMounted) setResource(data);
      } catch (error) {
        console.error(error);
        toast.error('Resource not found.');
        navigate('/student/resources');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadResource();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  if (loading) return <LoadingSpinner label="Loading resource..." />;
  if (!resource) return null;

  return (
    <div className="max-w-2xl">
      <Link to="/student/resources" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to resources
      </Link>

      <div className="mt-4 overflow-hidden rounded-card border border-border bg-surface">
        <img
          src={resource.image_url || RESOURCE_PLACEHOLDER_IMAGE}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = RESOURCE_PLACEHOLDER_IMAGE;
          }}
          alt={resource.name}
          className="h-56 w-full object-cover"
        />

        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-semibold text-foreground">{resource.name}</h1>
            <StatusBadge status={resource.status} />
          </div>
          <p className="mt-1 text-sm font-medium text-accent">{resource.category}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">{resource.description || 'No description provided.'}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> Location
              </dt>
              <dd className="mt-1 font-medium text-foreground">{resource.location}</dd>
            </div>
            {resource.capacity && (
              <div>
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> Capacity
                </dt>
                <dd className="mt-1 font-medium text-foreground">{resource.capacity}</dd>
              </div>
            )}
          </dl>

          <div className="mt-6">
            {resource.status === 'AVAILABLE' ? (
              <Link to={`/student/resources/${resource.id}/book`}>
                <Button variant="primary">Book this resource</Button>
              </Link>
            ) : (
              <p className="text-sm text-muted">
                This resource is currently {resource.status.toLowerCase()} and cannot be booked.
              </p>
            )}
          </div>
        </div>
      </div>

      <ResourceReviews resourceId={resource.id} />
    </div>
  );
}

export default ResourceDetailPage;