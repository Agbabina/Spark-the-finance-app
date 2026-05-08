import { useNavigate } from "react-router-dom";
import type { Transaction } from "../types.ts";

interface Props {
    transactions: Transaction[];
}

function Transactions({ transactions }: Props) {
    const navigate = useNavigate();

    return (
        <div className="p-4 min-h-screen bg-gray-100">

            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">Transactions</h1>

                <button
                    onClick={() => navigate("/add")}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                    + Add
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">

                {transactions.length === 0 ? (
                    <p>No transactions yet</p>
                ) : (
                    transactions.map((t, i) => (
                        <div key={i} className="flex justify-between border-b py-2">
                            <div>
                                <p className="font-semibold">{t.title}</p>
                                <p className="text-sm text-gray-500">{t.date}</p>
                            </div>

                            <p className={t.type === "income" ? "text-green-500" : "text-red-500"}>
                                {t.type === "income" ? "+" : "-"}₦{t.amount}
                            </p>
                        </div>
                    ))
                )}

            </div>
        </div>
    );
}

export default Transactions;