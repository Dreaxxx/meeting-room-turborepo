'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { login, register } from '../lib/auth';

type Mode = 'login' | 'register';

export default function AuthPage() {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>('login');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    const api = process.env.NEXT_PUBLIC_API_URL;

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setMsg(null);

        if (mode === 'register') {
            if (!name.trim()) return setErr('Le nom est requis.');
            if (password.length < 6) return setErr('Mot de passe trop court (min 6).');
            if (password !== confirm) return setErr('Les mots de passe ne correspondent pas.');
        }

        setLoading(true);
        try {
            if (mode === 'login') {
                const res = await login(email, password);
                console.log('res', res);

                const token = res.data?.accessToken;
                if (!token) throw new Error('Jeton manquant dans la réponse.');
                localStorage.setItem('token', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setMsg('Connecté ✅');
                router.push('/');
            } else {
                await register(email, password, name);
                setMsg('Compte créé ✅ Vous pouvez vous connecter.');
                setMode('login');
            }
        } catch (e: any) {
            const apiMessage =
                e?.response?.data?.message ||
                e?.response?.data?.error ||
                e?.message ||
                'Erreur inconnue';
            setErr(Array.isArray(apiMessage) ? apiMessage.join(', ') : String(apiMessage));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="grid" style={{ gap: 24 }}>
            <div className="card" style={{ borderRadius: 12, padding: 16, boxShadow: '0 4px 12px rgba(0,0,0,.06)' }}>
                <div className="row" style={{ alignItems: 'center', marginBottom: 12 }}>
                    <h1 className="h1" style={{ margin: 0 }}>
                        {mode === 'login' ? 'Se connecter' : "Créer un compte"}
                    </h1>
                </div>

                <div className="row" style={{ gap: 12, marginBottom: 12 }}>
                    <button
                        className="btn"
                        onClick={() => setMode('login')}
                        disabled={mode === 'login'}
                        aria-pressed={mode === 'login'}
                        style={{ marginRight: '13px' }}
                    >
                        Connexion
                    </button>
                    <button
                        className="btn"
                        onClick={() => setMode('register')}
                        disabled={mode === 'register'}
                        aria-pressed={mode === 'register'}
                    >
                        Inscription
                    </button>
                </div>

                <form onSubmit={onSubmit} className="grid" style={{ gap: 12, maxWidth: 420 }}>
                    {mode === 'register' && (
                        <div>
                            <label className="label" style={{ display: 'block', marginBottom: 6 }}>
                                Nom
                            </label>
                            <input
                                className="input"
                                data-testid="name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>
                    )}

                    <div>
                        <label className="label" style={{ display: 'block', marginBottom: 6 }}>
                            Email
                        </label>
                        <input
                            className="input"
                            data-testid="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="john@exemple.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="label" style={{ display: 'block', marginBottom: 6 }}>
                            Mot de passe
                        </label>
                        <input
                            className="input"
                            data-testid="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    {mode === 'register' && (
                        <div>
                            <label className="label" style={{ display: 'block', marginBottom: 6 }}>
                                Confirmer le mot de passe
                            </label>
                            <input
                                className="input"
                                data-testid="confirm"
                                type="password"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    )}

                    <div className="row" style={{ alignItems: 'center', gap: 12, marginTop: 6 }}>
                        <button className="btn" type="submit" disabled={loading}>
                            {loading ? 'Patientez…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                        </button>

                        {msg && <span style={{ marginLeft: 12 }}>✅ {msg}</span>}
                        {err && <span style={{ marginLeft: 12 }}>❌ {err}</span>}
                    </div>
                </form>
            </div>
        </div>
    );
}
