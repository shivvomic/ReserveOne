import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Boxes } from 'lucide-react';
import { fetchResources, deleteResource } from '../../services/resourceService';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Skeleton from '../../components/Skeleton';

function ResourceRowActions({ resource, onDelete }) {
  return (
    <div className="flex items-center gap-4">
      <Link
        to={`/admin/resources/${resource.id}/edit`}
        className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </Link>
      <button
        onClick={() => onDelete(resource)}
        className="inline-flex items-center gap-1 text-sm font-medium text-red-400 transition-colors hover:text-red-300"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>
    </div>
  );
}

function ManageResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchResources();
      setResources(data);
    } catch (error) {
      console.error(error);
      toast.error('Could not load resources.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function fetchInitialData() {
    await loadResources();
  }
  fetchInitialData();
  }, [loadResources]);

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await deleteResource(deleteTarget.id);
      toast.success('Resource deleted');
      setDeleteTarget(null);
      loadResources();
    } catch (error) {
      const message = error.response?.data?.message || 'Could not delete this resource.';
      toast.error(message);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Manage Resources"
        action={
          <Link to="/admin/resources/new">
            <Button variant="primary" size="sm">
              <Plus className="h-3.5 w-3.5" />
              Add Resource
            </Button>
          </Link>
        }
      />

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-card" />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <EmptyState icon={Boxes} title="No resources yet" description="Add your first resource to get started." />
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-card border border-border bg-surface md:block">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-surface-hover/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-muted">Category</th>
                    <th className="px-4 py-3 text-left font-medium text-muted">Location</th>
                    <th className="px-4 py-3 text-left font-medium text-muted">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {resources.map((resource) => (
                    <tr key={resource.id} className="transition-colors hover:bg-surface-hover/40">
                      <td className="px-4 py-3 font-medium text-foreground">{resource.name}</td>
                      <td className="px-4 py-3 text-muted">{resource.category}</td>
                      <td className="px-4 py-3 text-muted">{resource.location}</td>
                      <td className="px-4 py-3"><StatusBadge status={resource.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <ResourceRowActions resource={resource} onDelete={setDeleteTarget} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {resources.map((resource) => (
                <div key={resource.id} className="rounded-card border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{resource.name}</p>
                      <p className="text-xs text-muted-foreground">{resource.category} · {resource.location}</p>
                    </div>
                    <StatusBadge status={resource.status} />
                  </div>
                  <div className="mt-3 border-t border-border pt-3">
                    <ResourceRowActions resource={resource} onDelete={setDeleteTarget} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this resource?"
        description={deleteTarget ? `"${deleteTarget.name}" will be permanently removed. This can't be undone.` : ''}
        confirmLabel="Delete resource"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

export default ManageResourcesPage;