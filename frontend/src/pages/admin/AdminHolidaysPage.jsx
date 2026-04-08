import { useEffect, useMemo, useState } from "react";

import {
  createHoliday,
  deleteHoliday,
  listHolidays,
  updateHoliday,
} from "../../services/holidayService";
import { extractApiErrorMessage } from "../../utils/error";

const HOLIDAY_TYPES = ["poya", "public", "university"];

const HOLIDAY_TYPE_LABELS = {
  poya: "Poya Day",
  public: "Public Holiday",
  university: "University Closed",
};

const EMPTY_FORM = {
  date: "",
  name: "",
  type: "",
  description: "",
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const AdminHolidaysPage = () => {
  const todayDate = new Date().toISOString().slice(0, 10);
  const [records, setRecords] = useState([]);
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const [typeFilter, setTypeFilter] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const activeFilter = useMemo(() => {
    const filters = {};
    if (yearFilter) filters.year = yearFilter;
    if (typeFilter) filters.type = typeFilter;
    return filters;
  }, [yearFilter, typeFilter]);

  const loadHolidays = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await listHolidays(activeFilter);
      setRecords(response.data || []);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, [activeFilter.year, activeFilter.type]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId("");
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.date) {
      setError("Date is required");
      return;
    }

    if (!form.name.trim()) {
      setError("Holiday name is required");
      return;
    }

    if (!form.type) {
      setError("Holiday type is required");
      return;
    }

    if (form.date < todayDate) {
      setError("Holiday date cannot be in the past");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        date: form.date,
        name: form.name.trim(),
        type: form.type,
        description: form.description.trim(),
      };

      if (editingId) {
        await updateHoliday(editingId, payload);
      } else {
        await createHoliday(payload);
      }

      resetForm();
      await loadHolidays();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (record) => {
    setForm({
      date: formatDate(record.date),
      name: record.name || "",
      type: record.type || "",
      description: record.description || "",
    });
    setEditingId(record._id);
  };

  const handleDelete = async (id) => {
    try {
      setError("");
      await deleteHoliday(id);
      await loadHolidays();
      if (editingId === id) resetForm();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

  return (
    <section className="admin-page-grid section-entrance">
      <article className="admin-glass-card admin-module-card">
        <p className="eyebrow">Admin Holidays</p>
        <h2>Holiday Calendar</h2>
        <p>Manage university closed days — Poya days, public holidays, and university closures. Lecturers cannot schedule lectures on these dates.</p>

        <h3 className="admin-subsection-title">Filters</h3>

        <div className="admin-filter-row">
          <label>
            Year
            <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>

          <label>
            Type
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              {HOLIDAY_TYPES.map((t) => (
                <option key={t} value={t}>{HOLIDAY_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </label>
        </div>

        <h3 className="admin-subsection-title">Holiday Form</h3>

        <form className="admin-form-grid admin-module-form-grid" onSubmit={handleSubmit}>
          <label>
            Date
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleInputChange}
              min={todayDate}
              required
            />
          </label>

          <label>
            Holiday Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              placeholder="e.g. Vesak Poya Day"
              required
            />
          </label>

          <label>
            Type
            <select name="type" value={form.type} onChange={handleInputChange} required>
              <option value="">Select Type</option>
              {HOLIDAY_TYPES.map((t) => (
                <option key={t} value={t}>{HOLIDAY_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </label>

          <label className="admin-form-span-full">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleInputChange}
              rows={2}
              placeholder="Optional description"
            />
          </label>

          <div className="admin-form-actions admin-form-span-full">
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Saving..." : editingId ? "Update Holiday" : "Add Holiday"}
            </button>
            <button type="button" className="ghost-btn" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>

        {error ? <p className="form-error">{error}</p> : null}

        <h3 className="admin-subsection-title">Holiday List ({records.length})</h3>

        <div className="admin-data-table-wrap">
          {loading ? <p>Loading holidays...</p> : null}
          {!loading && records.length === 0 ? <p>No holidays found for this year.</p> : null}

          {!loading && records.length > 0 ? (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Holiday Name</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => {
                  const d = new Date(record.date);
                  const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()];
                  return (
                    <tr key={record._id}>
                      <td>{formatDate(record.date)}</td>
                      <td>{dayName}</td>
                      <td><strong>{record.name}</strong></td>
                      <td>
                        <span style={{
                          padding: "0.15rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          background: record.type === "poya"
                            ? "rgba(251,191,36,0.15)"
                            : record.type === "public"
                              ? "rgba(59,130,246,0.15)"
                              : "rgba(168,85,247,0.15)",
                          color: record.type === "poya"
                            ? "#fbbf24"
                            : record.type === "public"
                              ? "#60a5fa"
                              : "#a855f7",
                        }}>
                          {HOLIDAY_TYPE_LABELS[record.type] || record.type}
                        </span>
                      </td>
                      <td>{record.description || "-"}</td>
                      <td>
                        <div className="admin-row-actions">
                          <button type="button" className="ghost-btn" onClick={() => handleEdit(record)}>
                            Edit
                          </button>
                          <button type="button" className="ui-btn is-ghost" onClick={() => handleDelete(record._id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : null}
        </div>
      </article>
    </section>
  );
};

export default AdminHolidaysPage;
