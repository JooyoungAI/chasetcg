import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, isConfigured } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login({ setMockAuthUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (isConfigured && auth) {
            try {
                await signInWithEmailAndPassword(auth, email, password);
                navigate('/admin');
            } catch (err) {
                setError('Failed to log in. Please check your credentials.');
                console.error(err);
            }
        } else {
            // Mock Auth Fallback when Firebase is not connected
            if ((email === 'jooyoung.kim.ai@gmail.com' || email === 'admin@chasetcg.com') && password === 'ChaseTCG17~') {
                setMockAuthUser({ uid: 'mock-admin-123', email });
                navigate('/admin');
            } else {
                setError('Invalid credentials, or Firebase is not connected.');
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-card glass-panel">
                <div className="login-header">
                    <h2>Admin Login</h2>
                    <p>Sign in to access the dashboard</p>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn">Secure Login</button>
                </form>
            </div>
        </div>
    );
}
