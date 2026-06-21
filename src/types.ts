export type TransactionType = "income" | "expense";

export interface Transaction {
    id: number;
    title: string;
    amount: number;
    type: TransactionType;
    category?: string;
    date: string;
}

export interface Budget {
    id: number;
    category: string;
    limit: number;
    month: number;
    year: number;
}

export interface Goal {
    id: number;
    title: string;
    targetAmount: number;
    currentAmount: number;
    targetDate?: string | null;
}

export interface AiInsight {
    summary: string;
    actions: string[];
}

export interface AiQuestionResponse {
    answer: string;
}

export interface AiTransactionDraft {
    title: string;
    amount: number;
    type: TransactionType;
    category: string;
    date: string;
    note: string;
}

