/**
 * quiz.ts — Interactive multiple-choice quizzes with instant feedback
 *
 * Registers the `quiz` tool. Presents questions in a full-screen-ish TUI:
 * arrows (or number keys) to answer, instant ✓/✗ feedback with explanation,
 * and a final score summary. Returns per-question results to the LLM so it
 * can give honest, targeted feedback and log a quiz report to the vault.
 *
 * In non-TUI modes the tool returns an error so the LLM quizzes in chat.
 */

import { StringEnum } from "@earendil-works/pi-ai";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Key, matchesKey, Text, visibleWidth, wrapTextWithAnsi } from "@earendil-works/pi-tui";
import { Type } from "typebox";

interface QuizQuestion {
	prompt: string;
	options: string[];
	correctIndex: number;
	explanation: string;
	difficulty?: "easy" | "medium" | "hard";
}

interface AnswerRecord {
	index: number;
	prompt: string;
	chosen: string;
	chosenIndex: number;
	correct: string;
	correctIndex: number;
	isCorrect: boolean;
	explanation: string;
	difficulty: string;
}

interface QuizResult {
	subject: string;
	topic: string;
	total: number;
	answered: number;
	correct: number;
	percent: number;
	passed: boolean;
	passScore: number;
	cancelled: boolean;
	answers: AnswerRecord[];
	completedAt: string;
}

const QuestionSchema = Type.Object({
	prompt: Type.String({ description: "Question text" }),
	options: Type.Array(Type.String(), {
		minItems: 2,
		maxItems: 8,
		description: "Answer options (2-8), all plausible",
	}),
	correctIndex: Type.Integer({ description: "0-based index of the correct option" }),
	explanation: Type.String({ description: "Why the correct answer is correct (shown after answering)" }),
	difficulty: Type.Optional(StringEnum(["easy", "medium", "hard"] as const)),
});

const QuizParams = Type.Object({
	subject: Type.String({ description: "Subject being studied" }),
	topic: Type.String({ description: "Topic or phase being quizzed" }),
	questions: Type.Array(QuestionSchema, { minItems: 1, description: "Quiz questions" }),
	passScore: Type.Optional(
		Type.Integer({ minimum: 0, maximum: 100, description: "Pass threshold in percent. Default: 70" }),
	),
});

function errorResult(message: string): { content: { type: "text"; text: string }[] } {
	return { content: [{ type: "text", text: message }] };
}

export default function quiz(pi: ExtensionAPI) {
	pi.registerTool({
		name: "quiz",
		label: "Quiz",
		description:
			"Run an interactive multiple-choice quiz for the user: arrows or number keys to answer, instant feedback with explanations, final score vs pass threshold. Returns detailed per-question results so you can give honest feedback. Use after each topic/phase and during reviews. Do NOT reveal answers in chat before calling this tool.",
		promptSnippet: "Run interactive multiple-choice quizzes with instant feedback and scoring",
		promptGuidelines: [
			"Use quiz after teaching each topic or phase to verify understanding; never state quiz answers in chat before the quiz runs.",
			"After quiz finishes, give honest feedback based on the returned per-question results, then log a quiz report with learning_log.",
		],
		parameters: QuizParams,

		async execute(_toolCallId, params, signal, _onUpdate, ctx) {
			if (ctx.mode !== "tui") {
				return errorResult(
					"Quiz TUI unavailable (non-interactive mode). Ask the questions in chat one at a time instead, then grade them yourself.",
				);
			}

			// Validate questions
			const questions: QuizQuestion[] = params.questions;
			for (let i = 0; i < questions.length; i++) {
				const q = questions[i];
				if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
					return errorResult(`Question ${i + 1}: correctIndex ${q.correctIndex} out of range (0-${q.options.length - 1}).`);
				}
				if (new Set(q.options).size !== q.options.length) {
					return errorResult(`Question ${i + 1}: duplicate options.`);
				}
			}

			const passScore = params.passScore ?? 70;
			const total = questions.length;

			const result = await ctx.ui.custom<QuizResult>((tui, theme, _kb, done) => {
				let qIndex = 0;
				let optionIndex = 0;
				let phase: "question" | "feedback" | "summary" = "question";
				let cachedLines: string[] | undefined;
				const answers: AnswerRecord[] = [];

				function refresh() {
					cachedLines = undefined;
					tui.requestRender();
				}

				function finish(cancelled: boolean) {
					const correct = answers.filter((a) => a.isCorrect).length;
					const answered = answers.length;
					const percent = answered > 0 ? Math.round((correct / total) * 100) : 0;
					done({
						subject: params.subject,
						topic: params.topic,
						total,
						answered,
						correct,
						percent,
						passed: percent >= passScore && answered === total,
						passScore,
						cancelled,
						answers: [...answers],
						completedAt: new Date().toISOString(),
					});
				}

				function recordAnswer(chosenIndex: number) {
					const q = questions[qIndex];
					answers[qIndex] = {
						index: qIndex,
						prompt: q.prompt,
						chosen: q.options[chosenIndex],
						chosenIndex,
						correct: q.options[q.correctIndex],
						correctIndex: q.correctIndex,
						isCorrect: chosenIndex === q.correctIndex,
						explanation: q.explanation,
						difficulty: q.difficulty ?? "medium",
					};
				}

				function handleInput(data: string) {
					if (signal?.aborted) {
						finish(true);
						return;
					}

					if (phase === "question") {
						// Number keys: quick select + confirm
						if (data.length === 1 && data >= "1" && data <= String(Math.min(9, questions[qIndex].options.length))) {
							const idx = Number(data) - 1;
							optionIndex = idx;
							recordAnswer(idx);
							phase = "feedback";
							refresh();
							return;
						}
						if (matchesKey(data, Key.up)) {
							optionIndex = Math.max(0, optionIndex - 1);
							refresh();
							return;
						}
						if (matchesKey(data, Key.down)) {
							optionIndex = Math.min(questions[qIndex].options.length - 1, optionIndex + 1);
							refresh();
							return;
						}
						if (matchesKey(data, Key.enter)) {
							recordAnswer(optionIndex);
							phase = "feedback";
							refresh();
							return;
						}
						if (matchesKey(data, Key.escape)) {
							finish(true);
						}
						return;
					}

					if (phase === "feedback") {
						if (matchesKey(data, Key.enter) || matchesKey(data, Key.escape) || data === " ") {
							if (qIndex < total - 1) {
								qIndex++;
								optionIndex = 0;
								phase = "question";
							} else {
								phase = "summary";
							}
							refresh();
						}
						return;
					}

					// summary
					if (matchesKey(data, Key.enter) || matchesKey(data, Key.escape) || data === " ") {
						finish(false);
					}
				}

				function render(width: number): string[] {
					if (cachedLines) return cachedLines;

					const lines: string[] = [];
					const w = Math.max(1, width);

					function addWrapped(text: string) {
						lines.push(...wrapTextWithAnsi(text, w));
					}

					function addWrappedWithPrefix(prefix: string, text: string) {
						const pw = visibleWidth(prefix);
						if (pw >= w) {
							addWrapped(prefix + text);
							return;
						}
						const wrapped = wrapTextWithAnsi(text, w - pw);
						const cont = " ".repeat(pw);
						for (let i = 0; i < wrapped.length; i++) {
							lines.push(`${i === 0 ? prefix : cont}${wrapped[i]}`);
						}
					}

					lines.push(theme.fg("accent", "─".repeat(w)));

					if (phase === "question" || phase === "feedback") {
						const q = questions[qIndex];
						const diff = q.difficulty ? ` · ${q.difficulty}` : "";
						addWrappedWithPrefix(
							" ",
							theme.fg("muted", `Question ${qIndex + 1}/${total}${diff} — `) +
								theme.fg("toolTitle", theme.bold(params.topic)),
						);
						lines.push("");
						addWrappedWithPrefix(" ", theme.fg("text", theme.bold(q.prompt)));
						lines.push("");

						for (let i = 0; i < q.options.length; i++) {
							const selected = i === optionIndex;
							const prefix = selected ? theme.fg("accent", "> ") : "  ";
							const label = `${i + 1}. ${q.options[i]}`;
							addWrappedWithPrefix(prefix, theme.fg(selected ? "accent" : "text", label));
						}

						if (phase === "feedback") {
							const a = answers[qIndex];
							lines.push("");
							if (a.isCorrect) {
								addWrappedWithPrefix(" ", theme.fg("success", theme.bold(`✓ Correct!`)));
							} else {
								addWrappedWithPrefix(" ", theme.fg("error", theme.bold(`✗ Not quite.`)));
								addWrappedWithPrefix(" ", theme.fg("muted", `Your answer: ${a.chosen}`));
								addWrappedWithPrefix(" ", theme.fg("success", `Correct answer: ${a.correct}`));
							}
							lines.push("");
							addWrappedWithPrefix(" ", theme.fg("dim", a.explanation));
							lines.push("");
							addWrappedWithPrefix(" ", theme.fg("muted", "Enter → continue"));
						} else {
							lines.push("");
							addWrappedWithPrefix(
								" ",
								theme.fg("dim", "↑↓ or 1-8 select · Enter confirm · Esc abort"),
							);
						}
					} else {
						// summary
						const correct = answers.filter((a) => a.isCorrect).length;
						const percent = Math.round((correct / total) * 100);
						const passed = percent >= passScore;
						addWrappedWithPrefix(
							" ",
							theme.fg("toolTitle", theme.bold(`Quiz complete — ${params.topic}`)),
						);
						lines.push("");
						addWrappedWithPrefix(
							" ",
							theme.fg(
								passed ? "success" : "error",
								theme.bold(
									`Score: ${correct}/${total} (${percent}%) — ${passed ? "PASSED" : "NEEDS WORK"} (threshold ${passScore}%)`,
								),
							),
						);
						lines.push("");
						for (let i = 0; i < total; i++) {
							const a = answers[i];
							if (!a) continue;
							const mark = a.isCorrect ? theme.fg("success", "✓") : theme.fg("error", "✗");
							addWrappedWithPrefix(" ", `${mark} Q${i + 1}: ${a.prompt.split("\n")[0].slice(0, w - 6)}`);
						}
						lines.push("");
						addWrappedWithPrefix(" ", theme.fg("muted", "Enter → finish and return results"));
					}

					lines.push(theme.fg("accent", "─".repeat(w)));
					cachedLines = lines;
					return lines;
				}

				return {
					render,
					invalidate: () => {
						cachedLines = undefined;
					},
					handleInput,
				};
			});

			// Build LLM-facing report
			const lines: string[] = [];
			if (result.cancelled) {
				lines.push(
					`Quiz ABORTED by user after ${result.answered}/${result.total} questions (${result.correct} correct so far).`,
				);
			} else {
				lines.push(
					`Quiz completed: "${params.topic}" (${params.subject}). Score: ${result.correct}/${result.total} (${result.percent}%) — ${result.passed ? "PASSED" : "FAILED"} (threshold ${passScore}%).`,
				);
			}
			lines.push("Per-question results:");
			for (const a of result.answers) {
				if (!a) continue;
				if (a.isCorrect) {
					lines.push(`${a.index + 1}. ✓ (${a.difficulty}) "${a.chosen}" — correct`);
				} else {
					lines.push(
						`${a.index + 1}. ✗ (${a.difficulty}) chose "${a.chosen}", correct was "${a.correct}" — Q: ${a.prompt.replace(/\n/g, " ")}`,
					);
				}
			}
			lines.push(
				"Next: give honest feedback on the misses (name the misconception, not just the topic), write the quiz report to the vault, and log this with learning_log.",
			);

			return {
				content: [{ type: "text", text: lines.join("\n") }],
				details: result,
			};
		},

		renderCall(args, theme) {
			const n = Array.isArray(args.questions) ? args.questions.length : 0;
			let text = theme.fg("toolTitle", theme.bold("quiz ")) + theme.fg("accent", `${n} questions`);
			if (args.topic) text += theme.fg("dim", ` — ${args.topic}`);
			return new Text(text, 0, 0);
		},

		renderResult(result, _options, theme) {
			const details = result.details as QuizResult | undefined;
			if (!details) {
				const text = result.content[0];
				return new Text(text?.type === "text" ? text.text : "", 0, 0);
			}
			if (details.cancelled) {
				return new Text(
					theme.fg("warning", `⏹ Aborted — ${details.correct}/${details.answered} correct so far`),
					0,
					0,
				);
			}
			const icon = details.passed ? theme.fg("success", "✓") : theme.fg("error", "✗");
			const marks = details.answers.map((a) => (a?.isCorrect ? theme.fg("success", "✓") : theme.fg("error", "✗"))).join(" ");
			return new Text(
				`${icon} ${theme.fg("toolTitle", theme.bold(details.topic))}: ${details.correct}/${details.total} (${details.percent}%) ${marks}`,
				0,
				0,
			);
		},
	});
}
