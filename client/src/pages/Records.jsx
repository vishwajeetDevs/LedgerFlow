import { useEffect, useState } from "react";
import { getRecords, deleteRecord, updateRecord, createRecord } from "../api/recordApi";
import { categories, getCategoryName } from "../utils/categories";
import { useAuth } from "../context/AuthContext";
import { toast } from "../components/Toast";
import DatePicker from "../components/DatePicker";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import Tooltip from "../components/Tooltip";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

const PER_PAGE = 10;

const Records = () => {
  const { user } = useAuth();
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState({
    type: "",
    category_id: "",
    startDate: "",
    endDate: "",
  });
  const [sortBy, setSortBy] = useState("date_desc");

  const [deleteModal, setDeleteModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [createModal, setCreateModal] = useState(false);
  const todayStr = new Date().toISOString().split("T")[0];
  const [createForm, setCreateForm] = useState({
    amount: "",
    type: "income",
    category_id: "",
    date: todayStr,
    notes: "",
  });

  const isOwner = (record) => record.user_id === user?.id;
  const canModify = (record) => user?.role === 3 || isOwner(record);

  const fetchRecords = async () => {
    try {
      const res = await getRecords();
      setAllRecords(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({ type: "", category_id: "", startDate: "", endDate: "" });
    setSearchQuery("");
    setSortBy("date_desc");
    setCurrentPage(1);
  };

  const openDeleteModal = (record) => setDeleteModal(record);
  const closeDeleteModal = () => setDeleteModal(null);

  const confirmDelete = async () => {
    try {
      await deleteRecord(deleteModal.id);
      setAllRecords(allRecords.filter((r) => r.id !== deleteModal.id));
      closeDeleteModal();
      toast.success("Record deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const openEditModal = (record) => {
    setEditModal(record);
    const dateParts = record.date?.split("-");
    const formattedDate = dateParts?.length === 3
      ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
      : record.date;
    setEditForm({
      amount: record.amount,
      type: record.type,
      category_id: record.category_id,
      date: formattedDate,
      notes: record.notes || "",
    });
  };
  const closeEditModal = () => { setEditModal(null); };

  const handleEditSave = async () => {
    if (!editForm.amount || Number(editForm.amount) <= 0) {
      return toast.error("Amount is required and must be greater than 0");
    }
    if (!editForm.category_id) {
      return toast.error("Please select a category");
    }
    if (!editForm.date) {
      return toast.error("Please select a date");
    }

    try {
      const res = await updateRecord(editModal.id, {
        ...editForm,
        amount: Number(editForm.amount),
        category_id: Number(editForm.category_id),
      });
      setAllRecords((prev) =>
        prev.map((r) => (r.id === editModal.id ? { ...r, ...res.data } : r))
      );
      closeEditModal();
      toast.success("Record updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const openCreateModal = () => {
    setCreateForm({ amount: "", type: "income", category_id: "", date: todayStr, notes: "" });
    setCreateModal(true);
  };
  const closeCreateModal = () => setCreateModal(false);

  const handleCreate = async () => {
    if (!createForm.amount || Number(createForm.amount) <= 0) {
      return toast.error("Amount is required and must be greater than 0");
    }
    if (!createForm.category_id) {
      return toast.error("Please select a category");
    }
    if (!createForm.date) {
      return toast.error("Please select a date");
    }

    try {
      await createRecord({
        ...createForm,
        amount: Number(createForm.amount),
        category_id: Number(createForm.category_id),
      });
      closeCreateModal();
      fetchRecords();
      toast.success("Record created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Create failed");
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredRecords = allRecords
    .filter((r) => (filters.type ? r.type === filters.type : true))
    .filter((r) => (filters.category_id ? r.category_id === Number(filters.category_id) : true))
    .filter((r) => {
      if (!filters.startDate) return true;
      const recordDate = new Date(r.date.split("-").reverse().join("-"));
      return recordDate >= new Date(filters.startDate);
    })
    .filter((r) => {
      if (!filters.endDate) return true;
      const recordDate = new Date(r.date.split("-").reverse().join("-"));
      return recordDate <= new Date(filters.endDate);
    })
    .filter((r) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const categoryName = getCategoryName(r.category_id).toLowerCase();
      const notes = (r.notes || "").toLowerCase();
      const userName = (r.user_name || "").toLowerCase();
      return categoryName.includes(q) || notes.includes(q) || userName.includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "date_desc") return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "date_asc") return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === "amount_desc") return Number(b.amount) - Number(a.amount);
      if (sortBy === "amount_asc") return Number(a.amount) - Number(b.amount);
      return 0;
    });

  const totalPages = Math.ceil(filteredRecords.length / PER_PAGE);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  const exportCSV = () => {
    const headers = ["User", "Amount", "Type", "Category", "Date", "Notes"];
    const rows = filteredRecords.map((r) => [
      r.user_name || "",
      r.amount,
      r.type,
      getCategoryName(r.category_id),
      r.date,
      (r.notes || "").replace(/,/g, " "),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions-ledger.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <p className="text-gray-500">Loading records...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h2>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            + Create Record
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-center gap-4 animate-fade-in-up stagger-1">
        <div className="relative">
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search notes, category, user..."
            className="border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          name="category_id"
          value={filters.category_id}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <DatePicker
          value={filters.startDate}
          onChange={(val) => { setFilters({ ...filters, startDate: val }); setCurrentPage(1); }}
          placeholder="Start date"
        />
        <DatePicker
          value={filters.endDate}
          onChange={(val) => { setFilters({ ...filters, endDate: val }); setCurrentPage(1); }}
          placeholder="End date"
        />

        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
          <option value="amount_desc">Amount: High to Low</option>
          <option value="amount_asc">Amount: Low to High</option>
        </select>

        <button
          onClick={resetFilters}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Reset
        </button>

        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
          Showing {paginatedRecords.length} of {filteredRecords.length} records
        </span>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden animate-fade-in-up stagger-2">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
            <tr>
              {user?.role >= 2 && <th className="px-6 py-3">User</th>}
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Notes</th>
              {user?.role !== 2 && <th className="px-6 py-3">Actions</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {paginatedRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                {user?.role >= 2 && (
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {record.user_name || `User #${record.user_id}`}
                  </td>
                )}
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  {formatCurrency(record.amount)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      record.type === "income"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {record.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{getCategoryName(record.category_id)}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{record.date}</td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{record.notes}</td>

                {user?.role !== 2 && (
                  <td className="px-6 py-4">
                    {canModify(record) && (
                      <div className="flex items-center gap-1.5">
                        <Tooltip text="Edit">
                          <button
                            onClick={() => openEditModal(record)}
                            className="p-1.5 text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </Tooltip>
                        <Tooltip text="Delete">
                          <button
                            onClick={() => openDeleteModal(record)}
                            className="p-1.5 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </Tooltip>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRecords.length === 0 && (
          <p className="text-center text-gray-400 py-10">No records found</p>
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <Modal open={!!deleteModal} onClose={closeDeleteModal} maxWidth="max-w-sm">
        {deleteModal && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Record</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-5 text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <p><span className="font-medium text-gray-900 dark:text-white">Amount:</span> {formatCurrency(deleteModal.amount)}</p>
              <p><span className="font-medium text-gray-900 dark:text-white">Category:</span> {getCategoryName(deleteModal.category_id)}</p>
              <p><span className="font-medium text-gray-900 dark:text-white">Type:</span> {deleteModal.type}</p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={!!editModal} onClose={closeEditModal}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Record</h3>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <input
                  type="number"
                  value={editForm.amount || ""}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, type: "income", category_id: "" })}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all cursor-pointer ${
                      (editForm.type || "income") === "income"
                        ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:border-green-300"
                    }`}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, type: "expense", category_id: "" })}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all cursor-pointer ${
                      (editForm.type || "income") === "expense"
                        ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:border-red-300"
                    }`}
                  >
                    Expense
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories
                    .filter((c) => c.type === (editForm.type || "income"))
                    .map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, category_id: c.id })}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all cursor-pointer ${
                          Number(editForm.category_id) === c.id
                            ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:border-indigo-300"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <DatePicker
                  value={editForm.date}
                  onChange={(val) => setEditForm({ ...editForm, date: val })}
                  placeholder="Select date"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <input
                  value={editForm.notes || ""}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
      </Modal>

      <Modal open={createModal} onClose={closeCreateModal}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Record</h3>
              <button onClick={closeCreateModal} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <input
                  type="number"
                  value={createForm.amount}
                  onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                  placeholder="Enter amount"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, type: "income", category_id: "" })}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all cursor-pointer ${
                      createForm.type === "income"
                        ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:border-green-300"
                    }`}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, type: "expense", category_id: "" })}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all cursor-pointer ${
                      createForm.type === "expense"
                        ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:border-red-300"
                    }`}
                  >
                    Expense
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories
                    .filter((c) => c.type === createForm.type)
                    .map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCreateForm({ ...createForm, category_id: c.id })}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all cursor-pointer ${
                          createForm.category_id === c.id
                            ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:border-indigo-300"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <DatePicker
                  value={createForm.date}
                  onChange={(val) => setCreateForm({ ...createForm, date: val })}
                  placeholder="Select date"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <input
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  placeholder="Optional notes"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={closeCreateModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                Create
              </button>
            </div>
      </Modal>
    </div>
  );
};

export default Records;
