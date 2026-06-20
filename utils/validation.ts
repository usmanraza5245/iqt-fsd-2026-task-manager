// Shared task-input parsing and validation.
//
// Lives here so the API routes have a single source of truth for the rules,

export const TITLE_MAX_LENGTH = 200;
export const DESCRIPTION_MAX_LENGTH = 2_000;

export type CreateTaskInput = {
  title: string;
  description: string | null;
  completed: boolean;
};

export type UpdateTaskInput = Partial<CreateTaskInput>;

export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const ok = <T>(data: T): ParseResult<T> => ({ ok: true, data });
const fail = (error: string): ParseResult<never> => ({ ok: false, error });

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseTitle(raw: unknown): ParseResult<string> {
  if (typeof raw !== "string" || !raw.trim()) {
    return fail("Title is required");
  }
  const title = raw.trim();
  if (title.length > TITLE_MAX_LENGTH) {
    return fail(`Title must be at most ${TITLE_MAX_LENGTH} characters`);
  }
  return ok(title);
}

function parseDescription(raw: unknown): ParseResult<string | null> {
  if (typeof raw !== "string") return ok(null);
  const description = raw.trim();
  if (description.length > DESCRIPTION_MAX_LENGTH) {
    return fail(
      `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters`,
    );
  }
  return ok(description || null);
}

/** Validate the body of a create (POST) request. Title is required. */
export function parseCreateInput(body: unknown): ParseResult<CreateTaskInput> {
  if (!isRecord(body)) return fail("Request body must be a JSON object");

  const title = parseTitle(body.title);
  if (!title.ok) return title;

  const description = parseDescription(body.description);
  if (!description.ok) return description;

  return ok({
    title: title.data,
    description: description.data,
    completed: typeof body.completed === "boolean" ? body.completed : false,
  });
}

/**
 * Validate the body of an update (PUT) request. Every field is optional, but
 * any field that *is* present must be valid — only provided fields are returned,
 * so partial updates leave the rest untouched.
 */
export function parseUpdateInput(body: unknown): ParseResult<UpdateTaskInput> {
  if (!isRecord(body)) return fail("Request body must be a JSON object");

  const data: UpdateTaskInput = {};

  if ("title" in body) {
    const title = parseTitle(body.title);
    if (!title.ok) return title;
    data.title = title.data;
  }

  if ("description" in body) {
    const description = parseDescription(body.description);
    if (!description.ok) return description;
    data.description = description.data;
  }

  if (typeof body.completed === "boolean") {
    data.completed = body.completed;
  }

  return ok(data);
}
