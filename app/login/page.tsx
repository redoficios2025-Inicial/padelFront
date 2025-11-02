"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useUser, User } from "../components/userContext";
import Link from 'next/link';


interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

export default function Login() {
  const router = useRouter();
  const { loginUser } = useUser();
  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("https://padel-back-kohl.vercel.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        setError(data?.user?.nombre || "Credenciales incorrectas");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Usuario o contraseña incorrectos",
        });
      } else {
        // Guardar usuario y token en context + localStorage
        loginUser(data.user, "token" + data.token);
        localStorage.setItem("token", data.token); // Guardás el token aparte


        Swal.fire({
          icon: "success",
          title: "Bienvenido",
          text: `Hola ${data.user.nombre}!`,
          showConfirmButton: false,
          timer: 1500,
        });

        // Redirigir a home después del SweetAlert
        setTimeout(() => router.push("/"), 1600);
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión. Intenta nuevamente.");
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error de conexión. Intenta nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-white">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">🔐 Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

          <div className="mb-4">
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="mb-4 relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span
              className="absolute right-3 top-2.5 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-purple-600 text-white rounded-md font-semibold hover:bg-purple-700 transition"
            >
              {isLoading ? "Cargando..." : "Iniciar sesión"}
            </button>

            <Link
              href="/resetpass"
              className="w-full py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition text-center"
            >
              Recuperar contraseña
            </Link>
          </div>
        </form>




      </div>
    </div>
  );
}
