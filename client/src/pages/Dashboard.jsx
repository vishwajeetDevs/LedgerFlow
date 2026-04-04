import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { getDashboardSummary, getCategorySummary } from "../api/dashboardApi";
import { getRecords } from "../api/recordApi";
import { getUsers } from "../api/userApi";
import { getCategoryName } from "../utils/categories";
import { useAuth } from "../context/AuthContext";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);

const barColors = [
  "bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500",
  "bg-violet-500", "bg-orange-500", "bg-teal-500",
];

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [records, setRecords] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [chartMonths, setChartMonths] = useState(6);
  const chartMonthsRef = useRef(6);
  chartMonthsRef.current = chartMonths;

  const chartScrollRef = useCallback((node) => {
    if (!node) return;

    const handler = (e) => {
      const current = chartMonthsRef.current;
      const goingDown = e.deltaY > 0;
      const goingUp = e.deltaY < 0;

      if (goingDown && current > 2) {
        e.preventDefault();
        setHoveredPoint(null);
        setChartMonths((prev) => Math.max(2, prev - 1));
      } else if (goingUp && current < 6) {
        e.preventDefault();
        setHoveredPoint(null);
        setChartMonths((prev) => Math.min(6, prev + 1));
      }
    };

    node.addEventListener("wheel", handler, { passive: false });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, categoryRes] = await Promise.all([
          getDashboardSummary(),
          getCategorySummary(),
        ]);
        setData(summaryRes.data);
        setCategoryData(categoryRes.data || []);

        const recordsRes = await getRecords();
        setRecords(recordsRes.data || []);

        if (user?.role === 3) {
          const usersRes = await getUsers();
          setUsersList(usersRes.data || []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.role]);

  const allUserGrowth = (() => {
    if (usersList.length === 0) return [];
    const months = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      months[key] = 0;
    }
    usersList.forEach((u) => {
      const d = new Date(u.created_at);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      if (key in months) months[key]++;
    });
    const entries = Object.entries(months);
    let cumulative = usersList.filter((u) => {
      const d = new Date(u.created_at);
      const firstMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      return d < firstMonth;
    }).length;
    return entries.map(([month, count]) => {
      cumulative += count;
      return { month, added: count, total: cumulative };
    });
  })();
  const userGrowth = allUserGrowth.length > 0
    ? allUserGrowth.slice(allUserGrowth.length - chartMonths)
    : [];
  const maxGrowth = userGrowth.length > 0
    ? Math.max(...userGrowth.map((d) => d.total), 1)
    : 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-400 text-lg">Unable to load dashboard</p>
      </div>
    );
  }

  const savingsRate =
    data.totalIncome > 0
      ? ((data.balance / data.totalIncome) * 100).toFixed(1)
      : 0;

  const expenseRatio =
    data.totalIncome > 0
      ? ((data.totalExpense / data.totalIncome) * 100).toFixed(1)
      : 0;

  const recentRecords = records.slice(0, 6);

  const expenseCategories = categoryData
    .filter((c) => c.type === "expense")
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  const incomeCategories = categoryData
    .filter((c) => c.type === "income")
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  const maxExpense = expenseCategories[0]?.total || 1;
  const maxIncome = incomeCategories[0]?.total || 1;

  const roleBreakdown = usersList.reduce(
    (acc, u) => {
      if (u.role_id === 1) acc.viewers++;
      else if (u.role_id === 2) acc.analysts++;
      else if (u.role_id === 3) acc.admins++;
      if (u.is_active) acc.active++;
      else acc.inactive++;
      return acc;
    },
    { viewers: 0, analysts: 0, admins: 0, active: 0, inactive: 0 }
  );

  return (
    <div>
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Welcome back, {user?.name}
          {user?.role >= 2
            ? " — System-wide overview"
            : " — Your personal overview"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-lg p-6 animate-fade-in-up stagger-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <p className="text-sm text-green-700 dark:text-green-400 font-medium">
              {user?.role >= 2 ? "Gross Revenue" : "Total Income"}
            </p>
          </div>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100">{formatCurrency(data.totalIncome)}</p>
          <p className="text-xs text-green-600 mt-2 font-medium">
            {user?.role >= 2 ? "Across all users" : "All time earnings"}
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg p-6 animate-fade-in-up stagger-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
            <p className="text-sm text-red-700 dark:text-red-400 font-medium">
              {user?.role >= 2 ? "Total Outflow" : "Total Expense"}
            </p>
          </div>
          <p className="text-3xl font-bold text-red-900 dark:text-red-100">{formatCurrency(data.totalExpense)}</p>
          <p className="text-xs text-red-600 mt-2 font-medium">
            {user?.role >= 2 ? "Across all users" : "All time spending"}
          </p>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-lg p-6 animate-fade-in-up stagger-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <p className="text-sm text-indigo-700 dark:text-indigo-400 font-medium">
              {user?.role >= 2 ? "Net Position" : "Net Balance"}
            </p>
          </div>
          <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">{formatCurrency(data.balance)}</p>
          <p className="text-xs text-indigo-600 mt-2 font-medium">
            {savingsRate}% savings rate &middot; {data.balance >= 0 ? "Surplus" : "Deficit"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6 animate-fade-in-up stagger-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Income by Category</h3>
          {incomeCategories.length > 0 ? (
            <div className="space-y-4">
              {incomeCategories.map((cat, i) => (
                <div key={cat.categoryId}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{cat.categoryName}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(cat.total)}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div
                      className={`${barColors[i % barColors.length]} h-2 rounded-full transition-all`}
                      style={{ width: `${(cat.total / maxIncome) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No income recorded</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6 animate-fade-in-up stagger-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Expense by Category</h3>
          {expenseCategories.length > 0 ? (
            <div className="space-y-4">
              {expenseCategories.map((cat, i) => (
                <div key={cat.categoryId}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{cat.categoryName}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(cat.total)}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div
                      className={`${barColors[i % barColors.length]} h-2 rounded-full transition-all`}
                      style={{ width: `${(cat.total / maxExpense) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No expenses recorded</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6 animate-fade-in-up stagger-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Income</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(data.totalIncome)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Expense</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(data.totalExpense)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Savings</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(data.balance)}</span>
            </div>
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Expense ratio</span>
                <span className="text-sm font-semibold text-indigo-600">{expenseRatio}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-red-400 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(expenseRatio, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-gray-500">Savings rate</span>
                <span className="text-sm font-semibold text-green-600">{savingsRate}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                <div
                  className="bg-green-400 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {user?.role === 3 && usersList.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6 animate-fade-in-up stagger-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">User Growth</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Last {chartMonths} month{chartMonths > 1 ? "s" : ""} &middot; Scroll to zoom
                </p>
              </div>
              <Link to="/users" className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
                Manage
              </Link>
            </div>

            {(() => {
              const chartW = 560;
              const chartH = 220;
              const padL = 44;
              const padR = 20;
              const padTop = 28;
              const padBot = 36;
              const plotW = chartW - padL - padR;
              const plotH = chartH - padTop - padBot;
              const stepX = userGrowth.length > 1 ? plotW / (userGrowth.length - 1) : plotW;
              const yPad = maxGrowth * 0.1;
              const yMax = maxGrowth + yPad;

              const points = userGrowth.map((d, i) => ({
                x: padL + i * stepX,
                y: padTop + plotH - (d.total / yMax) * plotH,
                idx: i,
                ...d,
              }));

              const curvePath = points.reduce((path, p, i) => {
                if (i === 0) return `M${p.x},${p.y}`;
                const prev = points[i - 1];
                const cx1 = prev.x + stepX * 0.4;
                const cx2 = p.x - stepX * 0.4;
                return `${path} C${cx1},${prev.y} ${cx2},${p.y} ${p.x},${p.y}`;
              }, "");

              const areaPath = `${curvePath} L${points[points.length - 1].x},${padTop + plotH} L${points[0].x},${padTop + plotH} Z`;

              const yTicks = 5;

              return (
                <div ref={chartScrollRef} className="relative mt-2" onMouseLeave={() => setHoveredPoint(null)}>
                  <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-56" overflow="visible">
                    <defs>
                      <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
                        <stop offset="50%" stopColor="#a5b4fc" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="strokeFill" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#a5b4fc" />
                        <stop offset="40%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                      <filter id="dotShadow">
                        <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#6366f1" floodOpacity="0.3" />
                      </filter>
                    </defs>

                    {Array.from({ length: yTicks + 1 }, (_, i) => {
                      const val = Math.round((yMax / yTicks) * i);
                      const y = padTop + plotH - (i / yTicks) * plotH;
                      return (
                        <g key={i}>
                          <line x1={padL} x2={chartW - padR} y1={y} y2={y} stroke={i === 0 ? "#e2e8f0" : "#f1f5f9"} strokeWidth="1" />
                          <text x={padL - 10} y={y + 3.5} textAnchor="end" className="text-[9px] fill-gray-400 font-medium">{val}</text>
                        </g>
                      );
                    })}

                    <path d={areaPath} fill="url(#areaFill)" className="chart-area" />

                    <path
                      ref={(node) => { if (node) node.style.setProperty("--path-length", Math.ceil(node.getTotalLength())); }}
                      d={curvePath}
                      fill="none"
                      stroke="url(#strokeFill)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="chart-line"
                      style={{ "--path-length": 800 }}
                    />

                    {points.map((p) => (
                      <g key={p.month}>
                        {hoveredPoint === p.idx && (
                          <>
                            <line x1={p.x} y1={padTop} x2={p.x} y2={padTop + plotH} stroke="#6366f1" strokeWidth="1" strokeDasharray="3 3" opacity="0.25" />
                            <circle cx={p.x} cy={p.y} r="14" fill="#6366f1" opacity="0.08" />
                            <circle cx={p.x} cy={p.y} r="8" fill="#6366f1" opacity="0.12" />
                          </>
                        )}

                        <circle
                          cx={p.x} cy={p.y}
                          r={hoveredPoint === p.idx ? 5 : 3.5}
                          fill="#fff"
                          stroke={hoveredPoint === p.idx ? "#4f46e5" : "#6366f1"}
                          strokeWidth={hoveredPoint === p.idx ? 2.5 : 2}
                          filter={hoveredPoint === p.idx ? "url(#dotShadow)" : undefined}
                          className="chart-dot transition-all duration-200"
                          style={{ animationDelay: `${0.3 + p.idx * 0.04}s` }}
                        />

                        <text
                          x={p.x} y={padTop + plotH + 18} textAnchor="middle"
                          className={`text-[10px] chart-label transition-colors ${hoveredPoint === p.idx ? "fill-indigo-600 font-semibold" : "fill-gray-400 font-medium"}`}
                          style={{ animationDelay: `${0.3 + p.idx * 0.04}s` }}
                        >
                          {p.month}
                        </text>

                        {p.added > 0 && (
                          <text
                            x={p.x} y={padTop + plotH + 30} textAnchor="middle"
                            className="text-[9px] fill-emerald-500 font-semibold chart-label"
                            style={{ animationDelay: `${0.35 + p.idx * 0.04}s` }}
                          >
                            +{p.added}
                          </text>
                        )}

                        <rect
                          x={p.x - stepX / 2} y={0} width={stepX} height={chartH}
                          fill="transparent"
                          onMouseEnter={() => setHoveredPoint(p.idx)}
                          className="cursor-pointer"
                        />
                      </g>
                    ))}
                  </svg>

                  {hoveredPoint !== null && points[hoveredPoint] && (() => {
                    const p = points[hoveredPoint];
                    const pctLeft = ((p.x / chartW) * 100);
                    const clampedLeft = Math.max(18, Math.min(82, pctLeft));
                    return (
                      <div
                        className="absolute z-10 bg-gray-900/95 backdrop-blur-sm text-white rounded-lg shadow-xl px-4 py-3 text-xs pointer-events-none animate-fade-in"
                        style={{ left: `${clampedLeft}%`, top: "0", transform: "translateX(-50%) translateY(-100%)", minWidth: "160px" }}
                      >
                        <p className="font-semibold text-sm mb-2">{p.month}</p>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-400">Total users</span>
                          <span className="font-bold">{p.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">New this month</span>
                          <span className="font-semibold text-indigo-300">+{p.added}</span>
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-gray-900/95 rotate-45 rounded-sm" />
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6 animate-fade-in-up stagger-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">User Stats</h3>

            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-indigo-600">{usersList.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Users</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Admins</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{roleBreakdown.admins}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Analysts</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{roleBreakdown.analysts}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Viewers</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{roleBreakdown.viewers}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                <span className="text-sm font-semibold text-green-600">{roleBreakdown.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Inactive</span>
                <span className="text-sm font-semibold text-red-600">{roleBreakdown.inactive}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {records.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm animate-fade-in-up stagger-5">
          <div className="p-6 pb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Latest Transactions</h3>
          </div>

          {recentRecords.length > 0 ? (
            <>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {recentRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        record.type === "income" ? "bg-green-50" : "bg-red-50"
                      }`}>
                        <svg
                          className={`w-4 h-4 ${record.type === "income" ? "text-green-600" : "text-red-600"}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          {record.type === "income" ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                          )}
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{getCategoryName(record.category_id)}</p>
                        <p className="text-xs text-gray-400">{record.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${
                        record.type === "income" ? "text-green-600" : "text-red-600"
                      }`}>
                        {record.type === "income" ? "+" : "-"}{formatCurrency(record.amount)}
                      </p>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        record.type === "income"
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-600"
                      }`}>
                        {record.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {records.length > 6 && (
                <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800">
                  <Link
                    to="/records"
                    className="block w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700 py-1 transition-colors"
                  >
                    View all transactions ({records.length})
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="px-6 pb-6">
              <p className="text-sm text-gray-400 text-center py-8">No transactions yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
