import { useAuth } from "../context/AuthContext";

const roleMap = { 1: "Viewer", 2: "Analyst", 3: "Admin" };

const sections = {
  1: [
    {
      title: "Dashboard",
      items: [
        "View your personal financial summary (income, expense, balance)",
        "See category-wise breakdown of your income and expenses",
        "Track your savings rate and expense ratio",
        "View your latest 6 transactions at a glance",
      ],
    },
    {
      title: "Transactions",
      items: [
        "Create new financial records (income or expense)",
        "View all your transactions in a paginated table",
        "Edit or delete your own records",
        "Search transactions by notes, category, or keywords",
        "Filter by type (income/expense), category, and date range",
        "Sort by newest, oldest, or amount (high/low)",
        "Only Viewers can create records — Admins and Analysts have read-only access",
      ],
    },
    {
      title: "Restrictions",
      items: [
        "You can only see and manage your own data",
        "You cannot view other users' records or data",
        "You do not have access to user management",
      ],
    },
  ],
  2: [
    {
      title: "Dashboard",
      items: [
        "View system-wide financial summary (gross revenue, total outflow, net position)",
        "See category-wise breakdown across all users",
        "Track overall savings rate and expense ratio",
        "View latest transactions from all users",
      ],
    },
    {
      title: "Transactions",
      items: [
        "View all transactions across all users with user attribution",
        "Search and filter across all system data",
        "Sort by date or amount for analysis",
        "Read-only access — cannot create, edit, or delete records",
        "Analysts are meant to view, track, and analyze reports only",
      ],
    },
    {
      title: "Users",
      items: [
        "View the complete user list (name, email, role, status)",
        "Search users by name or email",
        "Filter users by role or active status",
        "Read-only access — cannot edit, ban, or manage users",
      ],
    },
    {
      title: "Restrictions",
      items: [
        "Write operations (create, edit, delete) are limited to your own records",
        "You cannot modify other users' records",
        "You cannot manage user accounts or change passwords",
      ],
    },
  ],
  3: [
    {
      title: "Dashboard",
      items: [
        "View system-wide financial summary (gross revenue, total outflow, net position)",
        "See category-wise breakdown across all users",
        "Track overall savings rate and expense ratio",
        "View latest transactions from all users",
        "User growth chart with interactive scroll-to-zoom and hover details",
        "User statistics panel showing role breakdown and active/inactive counts",
      ],
    },
    {
      title: "Transactions",
      items: [
        "View all transactions across all users with user attribution",
        "Edit or delete any record from any user (via inline modals)",
        "Search and filter across all system data",
        "Sort by date or amount",
        "Read-only access for record creation — Admins manage users and data, not create records",
        "Full CRUD access without ownership restrictions",
      ],
    },
    {
      title: "User Management",
      items: [
        "View, search, and filter the complete user list",
        "Edit any user's profile (name, email, role, status) via modal",
        "Change any user's password via secure modal",
        "Ban or unban users (soft delete — preserves data)",
        "Banned users cannot log in and see a descriptive error message",
        "Cannot ban or modify your own account (safety guard)",
      ],
    },
    {
      title: "Full System Access",
      items: [
        "No restrictions on data visibility — see all records and users",
        "No ownership restrictions — can modify any record",
        "Complete control over user lifecycle (create, edit, ban, password reset)",
        "Access to admin-only analytics (user growth, user stats)",
      ],
    },
  ],
};

const Documentation = () => {
  const { user } = useAuth();
  const role = user?.role || 1;
  const roleName = roleMap[role];
  const roleSections = sections[role] || sections[1];

  const roleColors = {
    1: { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", badge: "bg-cyan-100 text-cyan-700" },
    2: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-700" },
    3: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", badge: "bg-indigo-100 text-indigo-700" },
  };
  const colors = roleColors[role];

  return (
    <div>
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documentation</h1>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors.badge}`}>
            {roleName}
          </span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Permissions and features available for your role
        </p>
      </div>

      <div className={`${colors.bg} border ${colors.border} rounded-lg p-5 mb-8 animate-fade-in-up stagger-1`}>
        <p className={`text-sm font-medium ${colors.text}`}>
          You are logged in as <span className="font-bold">{user?.name}</span> with the <span className="font-bold">{roleName}</span> role.
          {role === 1 && " You have access to your personal financial data and can manage your own records."}
          {role === 2 && " You have read access to all system data for analysis, plus full control over your own records."}
          {role === 3 && " You have full administrative control over the entire system including all records and users."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roleSections.map((section, i) => (
          <div
            key={section.title}
            className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6 animate-fade-in-up stagger-${Math.min(i + 2, 5)}`}
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              {section.title === "Restrictions" ? (
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              ) : section.title === "Full System Access" ? (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )}
              {section.title}
            </h3>
            <ul className="space-y-2.5">
              {section.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Documentation;
