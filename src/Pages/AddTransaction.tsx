import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type {Transaction} from "../types.ts";

interface Props {
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    darkMode: boolean;
}

function AddTransaction({ setTransactions }: Props) {
    const navigate = useNavigate();

    const [form, setForm] = useState<Omit<Transaction, 'id'>>({
        title: "",
        amount: 0,
        type: "expense",
        category: "",
        date: new Date().toISOString().split('T')[0] // Default to today's date
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({
            ...form,
            [e.target.name]:
                e.target.name === "amount"
                    ? Number(e.target.value)
                    : e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5219/api/transactions', form);
            setTransactions(prev => [...prev, response.data]);
            navigate("/");
        } catch (error) {
            console.error('Error adding transaction:', error);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900">

            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow w-96 space-y-3"
            >
                <h1 className="font-bold text-xl">Add Transaction</h1>

                <input
                    name="title"
                    placeholder="Title"
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                />

                <input
                    name="amount"
                    type="number"
                    placeholder="Amount"
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                />

                <select name="type" onChange={handleChange} className="w-full border p-2">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>

                {/* 🚨 HIDE CATEGORY FOR INCOME */}
                {form.type === "expense" && (
                    <select name="category" onChange={handleChange} className="w-full border p-2">
                        <option>Food</option>
                        <option>Bills</option>
                        <option>Transport</option>
                        <option>Other</option>
                    </select>
                )}

                <input
                    type="date"
                    name="date"
                    onChange={handleChange}
                    className="w-full border p-2"
                    required
                />

                <button className="w-full bg-blue-500 text-white p-2 rounded">
                    Save
                </button>
            </form>

        </div>
    );
}

export default AddTransaction;