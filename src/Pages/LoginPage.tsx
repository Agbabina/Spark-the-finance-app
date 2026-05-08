
import { useState } from "react";
import axios from "axios";

interface Props {
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

function LoginPage({ setIsLoggedIn }: Props) {
    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        
        console.log('Form data:', form);
        console.log('Is register:', isRegister);
        
        try {
            if (isRegister) {
                console.log('Sending register request to:', 'http://localhost:5219/api/auth/register');
                const response = await axios.post('http://localhost:5219/api/auth/register', form);
                console.log('Register response:', response.data);
                alert('Registered successfully');
                setIsRegister(false);
                setForm({ username: "", email: "", password: "" });
            } else {
                console.log('Sending login request to:', 'http://localhost:5219/api/auth/login');
                const loginData = { username: form.username, password: form.password };
                console.log('Login data:', loginData);
                const response = await axios.post('http://localhost:5219/api/auth/login', loginData);
                console.log('Login response:', response.data);
                localStorage.setItem('token', response.data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                setIsLoggedIn(true);
            }
        } catch (error: any) {
            console.error('Full error:', error);
            console.error('Error response:', error.response);
            const message = error.response?.data?.message || error.response?.data?.errors?.[0] || 'An error occurred';
            setErrorMessage(message);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow w-96 space-y-3">
                <h1 className="font-bold text-xl">{isRegister ? 'Register' : 'Login'}</h1>

                {errorMessage && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {errorMessage}
                    </div>
                )}

                <input
                    name="username"
                    placeholder="Username"
                    onChange={handleChange}
                    value={form.username}
                    className="w-full border p-2 rounded"
                    required
                />

                {isRegister && (
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        onChange={handleChange}
                        value={form.email}
                        className="w-full border p-2 rounded"
                        required
                    />
                )}

                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    onChange={handleChange}
                    value={form.password}
                    className="w-full border p-2 rounded"
                    required
                />

                <button className="w-full bg-blue-500 text-white p-2 rounded">
                    {isRegister ? 'Register' : 'Login'}
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setIsRegister(!isRegister);
                        setErrorMessage("");
                    }}
                    className="w-full text-blue-500"
                >
                    {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
                </button>
            </form>
        </div>
    );
}

export default LoginPage;