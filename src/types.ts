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

export interface BankAccount {
    id: number;
    userId: string;
    institutionName: string;
    accountType: string;
    accountName: string;
    lastFourDigits: string;
    balance: number;
    isActive: boolean;
    connectedAt: string;
}

export interface ConnectionRequest {
    id: number;
    requesterId: string;
    receiverId: string;
    status: string;
    createdAt: string;
    respondedAt?: string;
    requester?: { id: string; username: string; email: string };
    receiver?: { id: string; username: string; email: string };
}

export interface SharedTransaction {
    id: number;
    originalTransactionId: number;
    sharedByUserId: string;
    sharedWithUserId: string;
    category: string;
    amount: number;
    type: string;
    date: string;
    description?: string;
    createdAt: string;
}

