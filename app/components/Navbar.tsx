"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import stylesNavbar from "../stylesNavbar/Navbar.module.css";
import { useUser } from "./userContext";

const Navbar: React.FC = () => {
  const { user, logoutUser } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Evitar scroll cuando el menú está abierto
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
  }, [isMenuOpen]);

  return (
    <nav className={stylesNavbar.navbar}>
      <div className={stylesNavbar.navbarContainer}>
        {/* Logo */}
        <Link href="/">
          <div className={stylesNavbar.navbarLogo}>
            <img
              src="/assets/padeljona.jpg"
              alt="Logo"
              className={stylesNavbar.logoImage}
            />
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className={`${stylesNavbar.navbarMenu} ${stylesNavbar.desktopMenu}`}>
          {!user ? (
            <>
              <Link href="/login" className={stylesNavbar.navLink}>Login</Link>
              <Link href="/productos" className={stylesNavbar.navLink}>Productos</Link>
              <Link href="/registro" className={`${stylesNavbar.navLink} ${stylesNavbar.btnRegister}`}>Registro</Link>
            </>
          ) : (
            <>
              {/* Rutas para vendedores y admins */}
              {(user.rol === "admin" || user.rol === "vendedor") && (
                <>
                  <Link href="/crear-producto" className={stylesNavbar.navLink}>Crear Producto</Link>
                  <Link href="/dashboard" className={stylesNavbar.navLink}>Inventario</Link>
                  <Link href="/ayuda" className={stylesNavbar.navLink}>Ayuda</Link>
                </>
              )}

              {/* Solo admin */}
              {user.rol === "admin" && (
                <>
                  <Link href="/proveedores" className={stylesNavbar.navLink}>Proveedores</Link>
                  <Link href="/todos-productos" className={stylesNavbar.navLink}>Todos los Productos</Link>
                </>
              )}

              <div className={stylesNavbar.userMenu}>
                <div className={stylesNavbar.userInfo}>
                  <div className={stylesNavbar.userAvatar}>{user.nombre.charAt(0).toUpperCase()}</div>
                  <div className={stylesNavbar.userDetails}>
                    <span className={stylesNavbar.userName}>{user.nombre}</span>
                    <span className={stylesNavbar.userRole}>{user.rol}</span>
                  </div>
                </div>
                <button onClick={logoutUser} className={`${stylesNavbar.navLink} ${stylesNavbar.btnRegister}`}>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`${stylesNavbar.hamburger} ${isMenuOpen ? stylesNavbar.active : ""}`}
          onClick={toggleMenu}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Menu */}
        <div className={`${stylesNavbar.mobileMenu} ${isMenuOpen ? stylesNavbar.active : ""}`}>
          {!user ? (
            <>
              <Link href="/login" className={stylesNavbar.mobileLink} onClick={closeMenu}>Login</Link>
              <Link href="/productos" className={stylesNavbar.mobileLink} onClick={closeMenu}>Productos</Link>
              <Link href="/registro" className={`${stylesNavbar.mobileLink} ${stylesNavbar.mobileLinkHighlight}`} onClick={closeMenu}>Registro</Link>
            </>
          ) : (
            <>
              {(user.rol === "admin" || user.rol === "vendedor") && (
                <>
                  <Link href="/crear-producto" className={stylesNavbar.mobileLink} onClick={closeMenu}>Crear Producto</Link>
                  <Link href="/inventario" className={stylesNavbar.mobileLink} onClick={closeMenu}>Inventario</Link>
                  <Link href="/ayuda" className={stylesNavbar.mobileLink} onClick={closeMenu}>Ayuda</Link>
                </>
              )}
              {user.rol === "admin" && (
                <>
                  <Link href="/proveedores" className={stylesNavbar.mobileLink} onClick={closeMenu}>Proveedores</Link>
                  <Link href="/todos-productos" className={stylesNavbar.mobileLink} onClick={closeMenu}>Todos los Productos</Link>
                </>
              )}
              <div className={stylesNavbar.mobileUserInfo}>
                <div className={stylesNavbar.mobileUserAvatar}>{user.nombre.charAt(0).toUpperCase()}</div>
                <div>
                  <div className={stylesNavbar.mobileUserName}>{user.nombre}</div>
                  <div className={stylesNavbar.mobileUserRole}>{user.rol}</div>
                </div>
              </div>
              <button onClick={() => { logoutUser(); closeMenu(); }} className={stylesNavbar.mobileBtnLogout}>
                Cerrar Sesión
              </button>
            </>
          )}
        </div>

        {/* Overlay */}
        {isMenuOpen && <div className={stylesNavbar.overlay} onClick={closeMenu}></div>}
      </div>
    </nav>
  );
};

export default Navbar;

