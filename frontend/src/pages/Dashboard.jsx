import { ArrowRight, CalendarDays, CheckCircle2, CircleDot, Clock3, Plus, Sparkles, Target } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiError } from '../api/axiosInstance.js';
import { createTask, getTaskStats, getTasks } from '../api/taskApi.js';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import TaskForm from '../components/TaskForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function dueLabel(value) {
  if (!value) return 'No due date';
  const date = new Date(value);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  if (isToday) return 'Today';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [taskStats, taskResponse] = await Promise.all([
        getTaskStats(),
        getTasks({ page: 1, limit: 5, sortBy: 'createdAt', order: 'desc' })
      ]);
      setStats(taskStats);
      setRecentTasks(taskResponse.data);
    } catch (requestError) {
      setError(getApiError(requestError, 'We could not load your dashboard.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  async function submitTask(values) {
    setSaving(true);
    setError('');
    try {
      await createTask(values);
      setCreateOpen(false);
      setSuccess('Task added to your list.');
      window.setTimeout(() => setSuccess(''), 3200);
      await loadDashboard();
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not create the task.'));
    } finally {
      setSaving(false);
    }
  }

  if (loading && !stats) return <Loading label="Getting your day ready…" />;
  if (!stats && error) {
    return (
      <section className="load-failure">
        <span className="eyebrow">WE HIT A SMALL SNAG</span>
        <h1>Your overview is taking a moment.</h1>
        <p>{error}</p>
        <button className="button button-primary" onClick={loadDashboard}>Try again</button>
      </section>
    );
  }

  const cards = [
    { label: 'All tasks', value: stats?.totalTasks || 0, icon: Target, tone: 'violet', foot: 'A little progress counts' },
    { label: 'To do', value: stats?.pendingTasks || 0, icon: CircleDot, tone: 'amber', foot: 'Ready when you are' },
    { label: 'In progress', value: stats?.inProgressTasks || 0, icon: Clock3, tone: 'blue', foot: 'Keep your momentum' },
    { label: 'Completed', value: stats?.completedTasks || 0, icon: CheckCircle2, tone: 'green', foot: 'Look how far you’ve come' }
  ];

  return (
    <div className="dashboard-page">
      <section className="welcome-banner">
        <div className="welcome-content">
          <span className="eyebrow"><Sparkles size={13} /> YOUR PERSONAL OVERVIEW</span>
          <h1>{greeting()}, {user?.name?.split(' ')[0] || 'there'}<span className="wave">✳</span></h1>
          <p>Make today yours. One thoughtful step at a time.</p>
          <button className="button button-primary welcome-button" onClick={() => setCreateOpen(true)}><Plus size={17} /> Add a task</button>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="orbit orbit-outer" /><div className="orbit orbit-inner" />
          <div className="art-sun" /><span className="art-star star-a">✳</span><span className="art-star star-b">✦</span>
          <div className="art-card"><span /><span /><span /></div>
        </div>
        <div className="banner-grain" />
      </section>

      {error && <div className="inline-error page-alert" role="alert">{error}<button onClick={loadDashboard}>Try again</button></div>}
      {success && <div className="success-toast" role="status">{success}</div>}

      <section className="stat-grid" aria-label="Task summary">
        {cards.map(({ label, value, icon: Icon, tone, foot }) => (
          <article className="stat-card" key={label}>
            <div className="stat-card-top"><span className={`stat-icon ${tone}`}><Icon size={18} /></span></div>
            <span className="stat-value">{value}</span><span className="stat-label">{label}</span><span className="stat-foot">{foot}</span>
          </article>
        ))}
      </section>

      <div className="dashboard-lower">
        <section className="panel recent-panel">
          <div className="section-heading">
            <div><span className="eyebrow">A PLACE TO PICK UP</span><h2>Recent tasks</h2></div>
            <Link className="text-link" to="/tasks">See all <ArrowRight size={15} /></Link>
          </div>
          {recentTasks.length === 0 ? (
            <EmptyState title="A fresh page" message="Create a task and your next step will show up here." action={<button className="button button-secondary" onClick={() => setCreateOpen(true)}>Create your first task</button>} />
          ) : (
            <div className="recent-list">
              {recentTasks.slice(0, 4).map((task) => (
                <Link className="recent-item" key={task._id} to="/tasks" state={{ selectedTaskId: task._id }}>
                  <span className={`recent-mark mark-${task.status}`}><CheckCircle2 size={17} /></span>
                  <span className="recent-main"><strong>{task.title}</strong><small><CalendarDays size={12} /> {dueLabel(task.dueDate)}</small></span>
                  <StatusBadge status={task.status} />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="panel focus-panel">
          <div className="section-heading">
            <div><span className="eyebrow">YOUR MOMENTUM</span><h2>Progress</h2></div>
            <span className="focus-icon"><Sparkles size={17} /></span>
          </div>
          <div className="progress-ring-wrap">
            <div className="progress-ring" style={{ '--progress': `${stats?.completionPercentage || 0}%` }}>
              <div className="progress-ring-center"><strong>{Math.round(stats?.completionPercentage || 0)}%</strong><span>complete</span></div>
            </div>
          </div>
          <p className="progress-note">{stats?.totalTasks ? 'Every checked box is a win. Keep going at your own pace.' : 'Your progress will appear here as you complete tasks.'}</p>
          <div className="focus-divider" />
          <div className="overdue-row"><span><Clock3 size={15} /> Past due</span><strong className={stats?.overdueTasks ? 'overdue-number' : ''}>{stats?.overdueTasks || 0}</strong></div>
        </section>
      </div>
      {createOpen && <TaskForm onCancel={() => setCreateOpen(false)} onSubmit={submitTask} busy={saving} />}
    </div>
  );
}
