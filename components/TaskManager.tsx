"use client";

import { useState } from "react";
import TaskItem from "./TaskItem";
import { useTasks } from "@/hooks/useTasks";
import { fieldClass } from "./fieldStyles";
import { TITLE_MAX_LENGTH, DESCRIPTION_MAX_LENGTH } from "@/utils/validation";

export default function TaskManager() {
  const { tasks, loading, error, create, toggle, edit, remove } = useTasks();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      await create({
        title: trimmed,
        description: description.trim() || undefined,
      });
      setTitle("");
      setDescription("");
    } catch {
      // error is surfaced by the hook; keep the form values for a retry
    } finally {
      setSubmitting(false);
    }
  }

  const remaining = tasks.filter((t) => !t.completed).length;

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          aria-label="Task title"
          className={fieldClass}
          maxLength={TITLE_MAX_LENGTH}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          aria-label="Task description"
          rows={2}
          className={`mt-2 resize-y ${fieldClass}`}
          maxLength={DESCRIPTION_MAX_LENGTH}
        />
        <button
          type="submit"
          disabled={!title.trim() || submitting}
          className="mt-3 inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {submitting ? "Adding…" : "Add Task"}
        </button>
      </form>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-center text-sm text-zinc-500">Loading tasks…</p>
      ) : tasks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
          No tasks yet. Add your first one above.
        </p>
      ) : (
        <>
          <p className="text-sm text-zinc-500">
            {remaining} of {tasks.length} remaining
          </p>
          <ul className="space-y-2">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggle}
                onEdit={edit}
                onDelete={remove}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
