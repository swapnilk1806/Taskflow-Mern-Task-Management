import { ArrowDownUp, ChevronLeft, ChevronRight, ListFilter, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getApiError } from '../api/axiosInstance.js';
import { createTask, deleteTask, getTasks, updateTask, updateTaskStatus } from '../api/taskApi.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import TaskCard from '../components/TaskCard.jsx';
import TaskForm from '../components/TaskForm.jsx';

function TaskDetails({ task, onClose, onEdit }) {
  const description = task.description?.trim() || 'No extra details for this task.';
  const priority = task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1);
  const dueDate = task.dueDate ? new Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(new Date(task.dueDate)) : 'No due date';
  return (
    <ConfirmDialog title={task.title} onCancel={onClose} tone="normal">
      <div className="task-detail-body">
        <p>{description}</p>
        <div className="detail-row"><span>Status</span><strong>{task.status === 'pending' ? 'To do' : task.status === 'in-progress' ? 'In progress' : 'Completed'}</strong></div>
        <div className="detail-row"><span>Priority</span><strong>{priority}</strong></div>
        <div className="detail-row"><span>Due date</span><strong>{dueDate}</strong></div>
        <button className="button button-primary detail-edit" onClick={() => onEdit(task)}>Edit task</button>
      </div>
    </ConfirmDialog>
  );
}

export default function Tasks() {
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', sortBy: 'createdAt', order: 'desc' });
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const loadTasks = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await getTasks({ ...filters, page, limit: 8 });
      setTasks(response.data);
      setPagination(response.pagination);
      setLoadFailed(false);
    } catch (requestError) {
      setError(getApiError(requestError, 'We could not load your tasks.'));
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((current) => current.search === searchInput.trim() ? current : { ...current, search: searchInput.trim() });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => { loadTasks(1); }, [loadTasks]);

  useEffect(() => {
    const id = location.state?.selectedTaskId;
    if (id && tasks.length) {
      const task = tasks.find((item) => item._id === id);
      if (task) setModal({ type: 'view', task });
      window.history.replaceState({}, document.title);
    }
  }, [location.state, tasks]);

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3000);
  }

  async function saveTask(values) {
    setBusy(true);
    setFormError('');
    try {
      if (modal.task) await updateTask(modal.task._id, values);
      else await createTask(values);
      setModal(null);
      showNotice(modal.task ? 'Your changes have been saved.' : 'Task added to your list.');
      await loadTasks(modal.task ? pagination.page : 1);
    } catch (requestError) {
      setFormError(getApiError(requestError, 'Could not save the task.'));
    } finally {
      setBusy(false);
    }
  }

  async function removeTask() {
    setBusy(true);
    try {
      await deleteTask(pendingDelete._id);
      setPendingDelete(null);
      showNotice('Task deleted.');
      const nextPage = tasks.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      await loadTasks(nextPage);
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not delete the task.'));
      setPendingDelete(null);
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(task, status) {
    try {
      await updateTaskStatus(task._id, status);
      showNotice(status === 'completed' ? 'Nicely done — task completed.' : 'Task moved back to your list.');
      await loadTasks(pagination.page);
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not update task status.'));
    }
  }

  function openEdit(task) {
    setModal({ type: 'edit', task });
  }

  function openCreate() {
    setFormError('');
    setModal({ type: 'create', task: null });
  }

  const hasFilters = Boolean(filters.search || filters.status || filters.priority);

  return (
    <div className="tasks-page">
      <div className="page-heading-row">
        <div><span className="eyebrow">YOUR PERSONAL WORKSPACE</span><h1>All tasks<span className="task-count">{pagination.total}</span></h1><p>Everything you want to make a little progress on.</p></div>
        <button className="button button-primary" onClick={openCreate}><Plus size={17} /> New task</button>
      </div>
      {notice && <div className="success-toast" role="status">{notice}</div>}
      {error && <div className="inline-error page-alert" role="alert">{error}<button onClick={() => loadTasks(pagination.page)}>Try again</button></div>}
      <section className="filter-panel" aria-label="Task search and filters">
        <div className="search-field"><Search size={17} /><input aria-label="Search tasks" placeholder="Search your tasks…" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} /></div>
        <span className="filter-divider" />
        <label className="filter-select"><ListFilter size={15} /><span className="sr-only">Filter by status</span><select aria-label="Filter by status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">All statuses</option><option value="pending">To do</option><option value="in-progress">In progress</option><option value="completed">Completed</option></select></label>
        <label className="filter-select"><SlidersHorizontal size={15} /><span className="sr-only">Filter by priority</span><select aria-label="Filter by priority" value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}><option value="">All priorities</option><option value="high">High priority</option><option value="medium">Medium priority</option><option value="low">Low priority</option></select></label>
        <label className="filter-select sort-select"><ArrowDownUp size={15} /><span className="sr-only">Sort tasks by</span><select aria-label="Sort tasks by" value={`${filters.sortBy}:${filters.order}`} onChange={(event) => { const [sortBy, order] = event.target.value.split(':'); setFilters({ ...filters, sortBy, order }); }}><option value="createdAt:desc">Newest first</option><option value="createdAt:asc">Oldest first</option><option value="dueDate:asc">Due date</option><option value="title:asc">Name A–Z</option><option value="title:desc">Name Z–A</option></select></label>
        {hasFilters && <button className="clear-filters" onClick={() => { setSearchInput(''); setFilters({ search: '', status: '', priority: '', sortBy: 'createdAt', order: 'desc' }); }}><X size={14} /> Clear</button>}
      </section>
      <div className="list-meta"><span>{loading ? 'Refreshing your list…' : `${pagination.total} ${pagination.total === 1 ? 'task' : 'tasks'}${hasFilters ? ' found' : ''}`}</span><span>Page {pagination.page} of {Math.max(pagination.totalPages, 1)}</span></div>
      <section className="task-list">
        {loading ? <Loading label="Gathering your tasks…" /> : loadFailed ? (
          <div className="load-failure compact-load-failure"><h2>Your list couldn't load.</h2><p>Check your connection and try again.</p><button className="button button-primary" onClick={() => loadTasks(pagination.page)}>Try again</button></div>
        ) : tasks.length ? tasks.map((task) => <TaskCard key={task._id} task={task} onEdit={openEdit} onDelete={setPendingDelete} onStatusChange={changeStatus} onView={(item) => setModal({ type: 'view', task: item })} />) : (
          <EmptyState title={hasFilters ? 'No matches just yet' : 'A fresh page'} message={hasFilters ? 'Try another search or clear a filter to see more.' : 'Add your first task and give your plans a place to land.'} action={hasFilters ? <button className="button button-secondary" onClick={() => { setSearchInput(''); setFilters({ search: '', status: '', priority: '', sortBy: 'createdAt', order: 'desc' }); }}>Clear filters</button> : <button className="button button-primary" onClick={openCreate}><Plus size={16} /> Create a task</button>} />
        )}
      </section>
      {!loading && pagination.totalPages > 1 && (
        <nav className="pagination" aria-label="Task pages">
          <button className="pagination-button" aria-label="Previous page" disabled={pagination.page <= 1} onClick={() => loadTasks(pagination.page - 1)}><ChevronLeft size={17} /> Previous</button>
          <span>Page <strong>{pagination.page}</strong> of {pagination.totalPages}</span>
          <button className="pagination-button" aria-label="Next page" disabled={pagination.page >= pagination.totalPages} onClick={() => loadTasks(pagination.page + 1)}>Next <ChevronRight size={17} /></button>
        </nav>
      )}
      {modal?.type === 'view' && <TaskDetails task={modal.task} onClose={() => setModal(null)} onEdit={(task) => setModal({ type: 'edit', task })} />}
      {modal && modal.type !== 'view' && <TaskForm key={modal.task?._id || 'create'} task={modal.task} onCancel={() => setModal(null)} onSubmit={saveTask} busy={busy} error={formError} />}
      {pendingDelete && <ConfirmDialog title="Delete this task?" message={`“${pendingDelete.title}” will be permanently removed from your list.`} confirmLabel={busy ? 'Deleting…' : 'Delete task'} onConfirm={removeTask} onCancel={() => !busy && setPendingDelete(null)} />}
    </div>
  );
}
