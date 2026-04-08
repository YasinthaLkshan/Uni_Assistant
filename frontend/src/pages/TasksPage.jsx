import { useEffect, useMemo, useState } from "react";

import {
  EmptyStateCard,
  GlassCard,
  LoadingSpinner,
  PrimaryButton,
  SectionTitle,
  SecondaryButton,
  StatusBadge,
} from "../components";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../services/taskService";
import { extractApiErrorMessage } from "../utils/error";

const INITIAL_FORM = {
  title: "",
  type: "assignment",
  deadline: "",
  priority: "medium",
  description: "",
  email: "",
};

const STATUS_OPTIONS = ["Not Started", "In Progress", "Completed"];

const toDateTimeLocal = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const pad = (num) => `${num}`.padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getUrgencyBadgeClass = (urgency) => {
  if (urgency === "High") {
    return "danger";
  }

  if (urgency === "Medium") {
    return "warning";
  }

  return "success";
};

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [apiError, setApiError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    title: "",
    type: "",
    deadline: "",
    email: "",
  });

  const isEditMode = Boolean(activeTaskId);

  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)),
    [tasks]
  );

  const loadTasks = async () => {
    try {
      setApiError("");
      setLoading(true);
      const response = await getTasks();
      setTasks(response.data || []);
    } catch (err) {
      setApiError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setApiError("");

    // Restrict title to letters and numbers only
    if (name === "title") {
      const alphanumericOnly = value.replace(/[^a-zA-Z0-9\s]/g, "");
      setForm((prev) => ({
        ...prev,
        [name]: alphanumericOnly,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (name in fieldErrors) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setActiveTaskId(null);
    setApiError("");
    setFieldErrors({
      title: "",
      type: "",
      deadline: "",
      email: "",
    });
  };

  const validateForm = () => {
    const nextErrors = {
      title: "",
      type: "",
      deadline: "",
      email: "",
    };

    if (!form.title.trim()) {
      nextErrors.title = "Please enter a task title.";
    } else if (!/^[a-zA-Z0-9\s]+$/.test(form.title)) {
      nextErrors.title = "Title must contain only letters and numbers.";
    }

    if (!form.type) {
      nextErrors.type = "Please select a task type.";
    }

    if (!form.deadline) {
      nextErrors.deadline = "Please choose a deadline.";
    }

    if (form.deadline) {
      const parsedDeadline = new Date(form.deadline);
      if (Number.isNaN(parsedDeadline.getTime())) {
        nextErrors.deadline = "Please provide a valid deadline date and time.";
      } else if (parsedDeadline.getTime() < Date.now()) {
        nextErrors.deadline = "Deadline cannot be in the past.";
      }
    }

    // Email validation - optional but must be valid if provided
    if (form.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        nextErrors.email = "Please enter a valid email address.";
      }
    }

    setFieldErrors(nextErrors);

    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (hasErrors) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      title: form.title.trim(),
      type: form.type,
      deadline: form.deadline,
      priority: form.priority,
      description: form.description.trim(),
      email: form.email.trim(),
    };

    try {
      setApiError("");
      setIsSaving(true);

      if (isEditMode) {
        await updateTask(activeTaskId, payload);
      } else {
        await createTask(payload);
      }

      await loadTasks();
      resetForm();
    } catch (err) {
      setApiError(extractApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (task) => {
    setApiError("");
    setFieldErrors({
      title: "",
      type: "",
      deadline: "",
      email: "",
    });
    setActiveTaskId(task._id);
    setForm({
      title: task.title || "",
      type: task.type || "assignment",
      deadline: toDateTimeLocal(task.deadline),
      priority: task.priority || "medium",
      description: task.description || "",
      email: task.email || "",
    });
  };

  const handleDelete = async (taskId) => {
    try {
      setApiError("");
      await deleteTask(taskId);
      if (activeTaskId === taskId) {
        resetForm();
      }
      await loadTasks();
    } catch (err) {
      setApiError(extractApiErrorMessage(err));
    }
  };

  const handleStatusUpdate = async (taskId, nextStatus) => {
    try {
      setApiError("");
      await updateTask(taskId, { status: nextStatus });
      setTasks((prev) => prev.map((task) => (task._id === taskId ? { ...task, status: nextStatus } : task)));
    } catch (err) {
      setApiError(extractApiErrorMessage(err));
    }
  };

  return (
    <section className="dashboard tasks-page tasks-student-clean">
      <GlassCard className="section-entrance tm-hero-card">
        <p className="eyebrow">Task Management</p>
        <h1 className="dashboard-title">Plan and Track Your Workload</h1>
        <p>Add, update, and organize tasks with clear urgency signals and clean focus.</p>
      </GlassCard>

      {apiError ? <p className="form-error section-entrance">{apiError}</p> : null}

      <div className="tm-grid">
        <GlassCard as="section" className="section-entrance tm-form-panel" style={{ animationDelay: "80ms" }}>
          <SectionTitle
            eyebrow={isEditMode ? "Edit Task" : "Add Task"}
            rightContent={<StatusBadge label={`${tasks.length} Total`} level="low" />}
          />

          <form className="tm-form" onSubmit={handleSubmit}>
            <label>
              Title
              <input
                className="ui-input"
                type="text"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                placeholder="Database assignment"
                required
              />
              {fieldErrors.title ? <p className="tm-field-error">{fieldErrors.title}</p> : null}
            </label>

            <div className="tm-form-row">
              <label>
                Type
                <select className="ui-input" name="type" value={form.type} onChange={handleInputChange}>
                  <option value="assignment">Assignment</option>
                  <option value="exam">Exam</option>
                  <option value="presentation">Presentation</option>
                </select>
                {fieldErrors.type ? <p className="tm-field-error">{fieldErrors.type}</p> : null}
              </label>

              <label>
                Priority
                <select className="ui-input" name="priority" value={form.priority} onChange={handleInputChange}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>

            <div className="tm-form-row">
              <label>
                Deadline
                <input
                  className="ui-input"
                  type="datetime-local"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleInputChange}
                  required
                />
                {fieldErrors.deadline ? <p className="tm-field-error">{fieldErrors.deadline}</p> : null}
              </label>
            </div>

            <label>
              Email Notification (Optional)
              <input
                className="ui-input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
              />
              {fieldErrors.email ? <p className="tm-field-error">{fieldErrors.email}</p> : null}
            </label>

            <label>
              Description
              <textarea
                className="ui-input tm-textarea"
                name="description"
                value={form.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Add context, notes, or preparation checklist"
              />
            </label>

            <div className="tm-actions">
              <PrimaryButton type="submit" isLoading={isSaving}>
                {isSaving ? "Saving..." : isEditMode ? "Update Task" : "Add Task"}
              </PrimaryButton>
              {isEditMode ? (
                <SecondaryButton type="button" onClick={resetForm}>
                  Cancel Edit
                </SecondaryButton>
              ) : null}
            </div>
          </form>
        </GlassCard>

        <GlassCard as="section" className="ui-section section-entrance tm-list-panel" style={{ animationDelay: "140ms" }}>
          <SectionTitle
            eyebrow="Task List"
            rightContent={<StatusBadge level="low" label="Sorted by deadline" />}
          />

          {loading ? (
            <LoadingSpinner className="tm-list-loading" label="Loading tasks..." />
          ) : sortedTasks.length ? (
            <div className="tm-card-list">
              {sortedTasks.map((task) => (
                <article key={task._id} className="tm-card">
                  <div className="tm-card-top">
                    <div>
                      <h3 className="tm-card-title">{task.title}</h3>
                      <p className="tm-card-type">{task.type}</p>
                    </div>
                    <StatusBadge
                      level={getUrgencyBadgeClass(task.urgencyLevel)}
                      label={task.urgencyLevel || "Low"}
                    />
                  </div>

                  <p className="tm-meta">
                    <span className="tm-meta-label">Deadline</span>
                    <span className="tm-meta-value">{new Date(task.deadline).toLocaleString()}</span>
                    <span className="tm-meta-divider" aria-hidden="true">|</span>
                    <span className="tm-meta-label">Priority</span>
                    <span className="tm-meta-value">{task.priority}</span>
                  </p>
                  {task.description ? <p className="tm-desc">{task.description}</p> : null}

                  <div className="tm-card-controls">
                    <select
                      className="ui-input tm-status-select"
                      value={task.status}
                      onChange={(event) => handleStatusUpdate(task._id, event.target.value)}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    <div className="tm-inline-actions">
                      <SecondaryButton type="button" onClick={() => handleEdit(task)}>
                        Edit
                      </SecondaryButton>
                      <SecondaryButton
                        className="tm-delete-btn"
                        type="button"
                        onClick={() => handleDelete(task._id)}
                      >
                        Delete
                      </SecondaryButton>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyStateCard
              title="No tasks yet"
              description="Add your first task to start tracking assignments and deadlines."
            />
          )}
        </GlassCard>
      </div>
    </section>
  );
};

export default TasksPage;
