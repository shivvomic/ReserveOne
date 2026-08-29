import { Link } from 'react-router-dom';
import { MapPin, Users } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { RESOURCE_PLACEHOLDER_IMAGE } from '../utils/placeholderImage';

function ResourceCard({ resource }) {
  return (
    <Link
      to={`/student/resources/${resource.id}`}
      className="group block overflow-hidden rounded-card border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-border-hover hover:shadow-lg hover:shadow-black/20"
    >
      <div className="relative h-36 w-full overflow-hidden bg-surface-hover">
        <img
          src={resource.image_url || RESOURCE_PLACEHOLDER_IMAGE}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = RESOURCE_PLACEHOLDER_IMAGE;
          }}
          alt={resource.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute right-2 top-2">
          <StatusBadge status={resource.status} />
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground">{resource.name}</h3>
        <p className="mt-0.5 text-sm text-accent">{resource.category}</p>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{resource.description}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {resource.location}
          </span>
          {resource.capacity && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {resource.capacity}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default ResourceCard;