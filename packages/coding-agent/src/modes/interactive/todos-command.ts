/**
 * /todos slash command — lists todo items tracked in the current session branch.
 *
 * Todos are stored as details on toolResult messages produced by the "todo" tool
 * (see examples/extensions/todo.ts).  The command scans the branch in order and
 * keeps the last snapshot, which is the authoritative state for the current branch.
 */

import type { SessionEntry } from "../../core/session-manager.ts";

export interface TodoItem {
	id: number;
	text: string;
	done: boolean;
}

interface TodoDetails {
	todos: TodoItem[];
}

/**
 * Extract the current todo list from a session branch.
 *
 * Scans all entries in order and returns the `todos` array from the last
 * toolResult message whose toolName is "todo".  Returns an empty array when
 * no such message exists.
 */
export function getTodosFromBranch(entries: SessionEntry[]): TodoItem[] {
	let latest: TodoItem[] = [];

	for (const entry of entries) {
		if (entry.type !== "message") continue;
		const msg = entry.message;
		if (msg.role !== "toolResult" || msg.toolName !== "todo") continue;

		const details = msg.details as TodoDetails | undefined;
		if (details?.todos) {
			latest = details.todos;
		}
	}

	return latest;
}

/**
 * Format a todo list as plain text for display in the chat.
 *
 * Returns a multi-line string.  An empty list produces a single "No todos"
 * line so callers always get a non-empty string.
 */
export function formatTodos(todos: TodoItem[]): string {
	if (todos.length === 0) {
		return "No todos";
	}

	const done = todos.filter((t) => t.done).length;
	const lines: string[] = [`Todos (${done}/${todos.length} completed)`];

	for (const todo of todos) {
		const check = todo.done ? "[x]" : "[ ]";
		lines.push(`  ${check} #${todo.id} ${todo.text}`);
	}

	return lines.join("\n");
}
