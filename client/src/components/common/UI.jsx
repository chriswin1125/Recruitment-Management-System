// StatusBadge
export function StatusBadge({ status }) {
  const styles = {
    applied: 'bg-blue-50 text-blue-700 border border-blue-200',
    reviewing: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    shortlisted: 'bg-violet-50 text-violet-700 border border-violet-200',
    interview: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    offered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    hired: 'bg-green-50 text-green-700 border border-green-200',
    rejected: 'bg-red-50 text-red-700 border border-red-200',
    withdrawn: 'bg-slate-100 text-slate-600 border border-slate-200',
    active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    closed: 'bg-slate-100 text-slate-600 border border-slate-200',
    pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    draft: 'bg-slate-100 text-slate-500 border border-slate-200',
  };
  return (
    <span className={`badge capitalize ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}

// JobTypeBadge
export function JobTypeBadge({ type }) {
  const styles = {
    'full-time': 'bg-blue-50 text-blue-700',
    'part-time': 'bg-orange-50 text-orange-700',
    'contract': 'bg-purple-50 text-purple-700',
    'freelance': 'bg-pink-50 text-pink-700',
    'internship': 'bg-teal-50 text-teal-700',
    'remote': 'bg-green-50 text-green-700',
  };
  return (
    <span className={`badge capitalize ${styles[type] || 'bg-slate-100 text-slate-600'}`}>
      {type}
    </span>
  );
}

// Spinner
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className={`${sizes[size]} border-2 border-primary-500 border-t-transparent rounded-full animate-spin ${className}`} />
  );
}

// LoadingScreen
export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );
}

// EmptyState
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-slate-400" />
        </div>
      )}
      <h3 className="font-semibold text-slate-800 text-base mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-xs mb-4">{description}</p>}
      {action}
    </div>
  );
}

// Pagination
export function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages, total, limit } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-700">{start}–{end}</span> of{' '}
        <span className="font-medium text-slate-700">{total}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Prev
        </button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
          const p = pages <= 5 ? i + 1 : page <= 3 ? i + 1 : page + i - 2;
          if (p < 1 || p > pages) return null;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 text-sm rounded-lg border transition-colors ${
                p === page
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ConfirmModal
export function ConfirmModal({ title, message, onConfirm, onCancel, loading, danger }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative card p-6 w-full max-w-sm animate-slide-up">
        <h3 className="font-display font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 ${danger ? 'btn-danger' : 'btn-primary'}`}
          >
            {loading ? <Spinner size="sm" /> : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// StatCard
export function StatCard({ icon: Icon, label, value, color = 'blue', trend }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    pink: 'bg-pink-50 text-pink-600',
  };
  return (
    <div className="stat-card">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-slate-900">{value?.toLocaleString() ?? '–'}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
        {trend && (
          <p className={`text-xs font-medium mt-1 ${trend.up ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend.up ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}
