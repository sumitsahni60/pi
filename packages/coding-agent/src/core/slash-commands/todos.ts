/**
 * Logic for the /todos slash command.
 *
 * Todo state is stored in `toolResult` message details by the `todo` tool
 * (see examples/extensions/todo.ts). The current list is the `todos` array
 * on the last such result in the active branch.
 */

import type { ToolResultMessage } from "@earendil-works/pi-ai";
import type { SessionEntry } from "../session-manager.ts";

export interface TodoItem {
	id: number;
	text: string;
	done: boolean;
}

interface TodoDetails {
	todos: TodoItem[];
}

function isTodoDetails(value: unknown): value is TodoDetails {
	if (!value || typeof value !== "object") return false;
	const obj = value as Record<string, unknown>;
	if (!Array.isArray(obj.todos)) return false;
	return obj.todos.every(
		(t) =>
			t !== null &&
			typeof t === "object" &&
			typeof (t as Record<string, unknown>).id === "number" &&
			typeof (t as Record<string, unknown>).text === "string" &&
			typeof (t as Record<string, unknown>).done === "boolean",
	);
}

/**
 * Extract the current todo list from the active session branch.
 *
 * Scans the branch entries in order and returns the `todos` array from the
 * last `toolResult` message whose `toolName` is `"todo"` and whose `details`
 * passes the shape check. Returns an empty array when no such entry exists.
 */
export function getTodosFromBranch(branch: SessionEntry[]): TodoItem[] {
	let latest: TodoItem[] = [];
	for (const entry of branch) {
		if (entry.type !== "message") continue;
		const msg = entry.message;
		if (msg.role !== "toolResult") continue;
		const toolResult = msg as ToolResultMessage;
		if (toolResult.toolName !== "todo") continue;
		if (isTodoDetails(toolResult.details)) {
			latest = toolResult.details.todos;
		}
	}
	return latest;
}
