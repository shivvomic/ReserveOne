import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search, PackageSearch } from 'lucide-react';
import { fetchResources } from '../../services/resourceService';
import ResourceCard from '../../components/ResourceCard';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import Select from '../../components/Select';
import Skeleton from '../../components/Skeleton';

const CATEGORIES = ['Computer Lab', 'Seminar Hall', 'Meeting Room','Equipment'];
const STATUSES = ['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE'];

function ResourceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface">
      {/* No radius needed here — the parent's overflow-hidden + rounded-card
          already clips this to match the card's top corners. */}
      <Skeleton className="h-36 w-full" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
        <Skeleton className="h-3 w-full rounded" />
      </div>
    </div>
  );
}

function ResourceListPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchResources({ search, category, status });
      setResources(data);
    } catch (error) {
      console.error(error);
      toast.error('Could not load resources. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, category, status]);

  useEffect(() => {
    const timer = setTimeout(loadResources, 300);
    return () => clearTimeout(timer);
  }, [loadResources]);

  return (
    <div>
      <PageHeader title="Browse Resources" subtitle="Find and book labs, halls, and equipment." />

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-48">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <ResourceCardSkeleton key={i} />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <EmptyState icon={PackageSearch} title="No resources found" description="Try adjusting your search or filters." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResourceListPage;