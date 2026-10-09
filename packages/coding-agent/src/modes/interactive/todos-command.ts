/**
 * /todos command: extract and render todo items from the current session branch.
 *
 * Todos are stored in the `details` field of tool-result messages whose `toolName`
 * is "todo". The last such result on the current branch holds the authoritative
 * state (each result carries the full list after the operation).
 */

import type { SessionEntry } from "../../core/session-manager.ts";
import type { Theme } from "./theme/theme.ts";

export interface TodoItem {
	id: number;
	text: string;
	done: boolean;
}

interface TodoDetails {
	todos: TodoItem[];
}

function isTodoDetails(value: unknown): value is TodoDetails {
	if (typeof value !== "object" || value === null) return false;
	const obj = value as Record<string, unknown>;
	return Array.isArray(obj.todos);
}

/**
 * Scan the branch for the most recent "todo" tool-result entry and return its
 * todo list. Returns an empty array when no todo tool has been used yet.
 */
export function extractTodosFromBranch(branch: readonly SessionEntry[]): TodoItem[] {
	let latest: TodoItem[] = [];
	for (const entry of branch) {
		if (entry.type !== "message") continue;
		const msg = entry.message;
		if (msg.role !== "toolResult" || msg.toolName !== "todo") continue;
		if (isTodoDetails(msg.details)) {
			latest = msg.details.todos;
		}
	}
	return latest;
}

/**
 * Format a todo list as a themed string for display in the chat viewport.
 * The returned string is suitable for use inside a ThemedText component.
 */
export function renderTodosText(todos: TodoItem[], th: Theme): string {
	let text = `${th.bold("Todos")}\n\n`;
	if (todos.length === 0) {
		text += th.fg("dim", "No todos yet.");
		return text;
	}
	const done = todos.filter((t) => t.done).length;
	text += `${th.fg("dim", `${done}/${todos.length} completed`)}\n\n`;
	for (const todo of todos) {
		const check = todo.done ? th.fg("success", "✓") : th.fg("dim", "○");
		const id = th.fg("accent", `#${todo.id}`);
		const label = todo.done ? th.fg("dim", todo.text) : th.fg("text", todo.text);
		text += `${check} ${id} ${label}\n`;
	}
	return text.trimEnd();
}
