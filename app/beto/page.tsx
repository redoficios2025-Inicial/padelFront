"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { useUser } from "../app/components/userContext";

export default function Login() {
  const { loginUser } = useUser();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { email, password } = formData;

    const userMap: Record<
      string,
      { id: string; nombre: string; email: string; rol: "admin" | "vendedor" }
    > = {
      admin: { id: "1", nombre: "Admin User", email: "admin@empresa.com", rol: "admin" },
      vendedor: { id: "2", nombre: "Vendedor User", email: "vendedor@empresa.com", rol: "vendedor" },
    };

    setTimeout(() => {
      if (userMap[email] && password === "123456") {
        loginUser(userMap[email]);
      } else {
        setError("Credenciales incorrectas");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>🔐 Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="error">{error}</p>}
          <input
            type="text"
            name="email"
            placeholder="Usuario"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Cargando..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="demo">
          <p>🧪 <strong>Admin:</strong> admin / 123456</p>
          <p>🧪 <strong>Vendedor:</strong> vendedor / 123456</p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 30% 50%, rgba(168, 85, 247, 0.15), transparent 60%);
        }
        .login-card {
          background: #111;
          color: #fff;
          padding: 2rem;
          border-radius: 1rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          text-align: center;
        }
        input {
          width: 100%;
          padding: 0.75rem;
          margin: 0.5rem 0;
          border-radius: 0.5rem;
          border: 1px solid #a855f7;
          background: #1a1a1a;
          color: white;
        }
        button {
          background: linear-gradient(135deg, #a855f7, #ec4899);
          border: none;
          border-radius: 0.75rem;
          padding: 0.75rem;
          width: 100%;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: 0.3s;
        }
        button:hover:not(:disabled) {
          opacity: 0.9;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .error {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 0.5rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}
