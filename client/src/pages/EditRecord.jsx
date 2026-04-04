import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecords, updateRecord } from "../api/recordApi";
import { categories } from "../utils/categories";
import DatePicker from "../components/DatePicker";
import { toast } from "../components/Toast";

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

const EditRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);

  useEffect(() => {
    const fetchRecord = async () => {
      const res = await getRecords();
      const record = res.data.find((r) => r.id == id);
      if (record) {
        const dateParts = record.date?.split("-");
        const formattedDate = dateParts?.length === 3
          ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
          : record.date;
        setForm({ ...record, date: formattedDate });
      }
    };
    fetchRecord();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.amount || Number(form.amount) <= 0) {
      return toast.error("Amount is required and must be greater than 0");
    }
    if (!form.category_id) {
      return toast.error("Please select a category");
    }
    if (!form.date) {
      return toast.error("Please select a date");
    }

    try {
      await updateRecord(id, {
        ...form,
        amount: Number(form.amount),
        category_id: Number(form.category_id),
      });
      toast.success("Record updated successfully");
      navigate("/records");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (!form) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="max-w-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 animate-fade-in-up">Edit Record</h2>

      <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in-up stagger-1">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className={inputClass}
            >
              {categories
                .filter((c) => c.type === form.type)
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <DatePicker
              value={form.date}
              onChange={(val) => setForm({ ...form, date: val })}
              placeholder="Select date"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input
              name="notes"
              value={form.notes || ""}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              Update
            </button>
            <button
              type="button"
              onClick={() => navigate("/records")}
              className="px-5 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRecord;
