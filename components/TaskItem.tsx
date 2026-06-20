"use client";

import { memo, useState } from "react";
import type { Task } from "@/utils/types";
import type { EditableFields } from "@/hooks/useTasks";
import { fieldClass } from "./fieldStyles";
import ConfirmDialog from "./ConfirmDialog";
import { TITLE_MAX_LENGTH, DESCRIPTION_MAX_LENGTH } from "@/utils/validation";

type Props = {
  task: Task;
  // Whether this row is the one currently open for editing. The active row is
  // tracked by the parent so only one task can be edited at a time.
  editing: boolean;
  onEditingChange: (id: number | null) => void;
  onToggle: (task: Task) => void;
  onEdit: (task: Task, fields: EditableFields) => Promise<void>;
  onDelete: (task: Task) => void;
};

function TaskItem({
  task,
  editing,
  onEditingChange,
  onToggle,
  onEdit,
  onDelete,
}: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function startEditing() {
    setTitle(task.title);
    setDescription(task.description ?? "");
    onEditingChange(task.id);
  }

  async function save() {
    const trimmed = title.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      await onEdit(task, { title: trimmed, description: description.trim() });
      onEditingChange(null);
    } catch {
      // error surfaced by parent; keep edit mode open for a retry
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <li className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Task title"
          className={fieldClass}
          maxLength={TITLE_MAX_LENGTH}
          autoFocus
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Description (optional)"
          aria-label="Task description"
          className={`mt-2 resize-y ${fieldClass}`}
          maxLength={DESCRIPTION_MAX_LENGTH}
        />
        <div className="mt-3 flex gap-2">
          <button
            onClick={save}
            disabled={!title.trim() || saving}
            className="cursor-pointer rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => onEditingChange(null)}
            className="cursor-pointer rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        </div>
      </li>
    );
  }

  const titleClass = task.completed
    ? "text-zinc-400 line-through dark:text-zinc-500"
    : "text-zinc-900 dark:text-zinc-100";
  const descriptionClass = task.completed
    ? "text-zinc-400 line-through dark:text-zinc-600"
    : "text-zinc-500 dark:text-zinc-400";

  return (
    <li className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task)}
        aria-label={task.completed ? "Mark as not done" : "Mark as done"}
        className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-zinc-900 dark:accent-zinc-100"
      />
      <div className="min-w-0 flex-1">
        <p className={`break-words text-sm font-medium ${titleClass}`}>
          {task.title}
        </p>
        {task.description && (
          <p className={`mt-1 break-words text-sm ${descriptionClass}`}>
            {task.description}
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          onClick={startEditing}
          className="cursor-pointer rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          Edit
        </button>
        <button
          onClick={() => setConfirmingDelete(true)}
          className="cursor-pointer rounded-md px-2 py-1 text-sm text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
        >
          Delete
        </button>
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          title="Delete task?"
          message={`“${task.title}” will be permanently deleted.`}
          confirmLabel="Delete"
          onConfirm={() => {
            setConfirmingDelete(false);
            onDelete(task);
          }}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </li>
  );
}

// Memoized so untouched rows don't re-render when sibling tasks change; the
// handlers from `useTasks` are stable, so referential equality holds.
export default memo(TaskItem);
