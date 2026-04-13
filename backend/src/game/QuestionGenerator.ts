import { evaluate } from 'mathjs';
import { v4 as uuidv4 } from 'uuid';
import { Question } from '../types';

type Difficulty = 'easy' | 'medium' | 'hard';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateEasy(): string {
  const a = randInt(2, 50);
  const b = randInt(2, 50);
  const op = pick(['+', '-', '*']);
  if (op === '-' && b > a) return `${b} - ${a}`;
  return `${a} ${op} ${b}`;
}

function generateMedium(): string {
  const type = randInt(0, 2);
  if (type === 0) {
    // Multi-step with parentheses
    const a = randInt(2, 20);
    const b = randInt(2, 20);
    const c = randInt(2, 10);
    const op1 = pick(['+', '-']);
    const op2 = pick(['+', '*', '-']);
    return `${c} * (${a} ${op1} ${b}) ${op2} ${randInt(1, 20)}`;
  } else if (type === 1) {
    // Three-operand
    const a = randInt(5, 50);
    const b = randInt(2, 20);
    const c = randInt(2, 20);
    return `${a} + ${b} * ${c}`;
  } else {
    // Integer division (no remainder)
    const b = randInt(2, 12);
    const result = randInt(2, 15);
    const a = b * result;
    return `${a} / ${b} + ${randInt(1, 30)}`;
  }
}

function generateHard(): string {
  const type = randInt(0, 2);
  if (type === 0) {
    // Exponentiation
    const base = randInt(2, 8);
    const exp = randInt(2, 3);
    const add = randInt(1, 50);
    return `${base} ^ ${exp} + ${add}`;
  } else if (type === 1) {
    // Nested parentheses
    const a = randInt(2, 15);
    const b = randInt(2, 15);
    const c = randInt(2, 10);
    const d = randInt(1, 10);
    return `(${a} + ${b}) * (${c} - ${d})`;
  } else {
    // Percentage calculation → whole number result
    const percent = pick([10, 20, 25, 50]);
    const base = randInt(2, 20) * (100 / percent); // guarantees integer result
    return `${percent}% * ${base} + ${randInt(1, 50)}`;
  }
}

export function generateQuestion(difficulty?: Difficulty): Question {
  const diff = difficulty || pick<Difficulty>(['easy', 'easy', 'medium', 'medium', 'hard']);

  let expression: string;
  let answer: number;

  // Keep regenerating until we get a valid integer answer
  let attempts = 0;
  do {
    if (diff === 'easy') expression = generateEasy();
    else if (diff === 'medium') expression = generateMedium();
    else expression = generateHard();

    try {
      const raw = evaluate(expression);
      answer = typeof raw === 'number' ? raw : raw.toNumber();
    } catch {
      answer = NaN;
    }
    attempts++;
    if (attempts > 20) {
      // Fallback to safe easy question
      expression = `${randInt(1, 99)} + ${randInt(1, 99)}`;
      answer = evaluate(expression);
      break;
    }
  } while (isNaN(answer) || !isFinite(answer) || answer !== Math.round(answer));

  return {
    id: uuidv4(),
    expression,
    answer: Math.round(answer),
    difficulty: diff,
    startedAt: Date.now(),
  };
}
