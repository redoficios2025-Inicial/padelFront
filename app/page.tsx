'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaWhatsapp, FaShoppingCart, FaStar, FaFire } from 'react-icons/fa';
import styles from './stylesPage/page.module.css';
import Footer from './components/Footer';

const API_URL = 'https://padel-back-kohl.vercel.app/api/productos';

interface Producto {
  _id: string;
  codigo: string;
  nombre: string;
  marca: string;
  descripcion: string;
  precio: number;
  precioFinal: number;
  moneda: 'ARS' | 'USD';
  descuento: number;
  imagenUrl: string;
  categoria: 'pelota' | 'ropa' | 'accesorio';
  destacado: boolean;
  whatsapp: string;
  recargos: {
    transporte: number;
    margen: number;
    otros: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function HomePage() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'pelota' | 'ropa' | 'accesorio'>('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    cargarProductos();
  }, [filtro]);

  const cargarProductos = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filtro !== 'todos') {
        params.append('categoria', filtro);
      }

      const res = await fetch(`${API_URL}?${params}`);
      const data = await res.json();

      if (data.success) {
        setProductos(data.data);
      } else {
        setError('Error al cargar productos');
      }
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const formatearPrecio = (precio: number, moneda: 'ARS' | 'USD'): string => {
    if (moneda === 'ARS') {
      return `$${precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    }
    return `USD $${precio.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const handleWhatsApp = (producto: Producto) => {
    const mensaje = `Hola! Estoy interesado en: *${producto.nombre}* - ${producto.marca} (Código: ${producto.codigo})\nPrecio: ${formatearPrecio(producto.precioFinal, producto.moneda)}`;
    const url = `https://wa.me/${producto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const handleVerMas = () => {
    router.push('/productosall');
  };

  // Mostrar solo los primeros 6 productos
  const productosLimitados = productos.slice(0, 6);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2>⚠️ {error}</h2>
          <button onClick={cargarProductos} className={styles.retryBtn}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Hero Section con Imagen de Fondo */}
      <section className={styles.hero}>
        {/* Imagen de fondo con blur */}
        <div className={styles.heroBackground}>
          <Image
            src="/assets/padel.jpg"
            alt="Cancha de pádel"
            fill
            priority
            quality={90}
            className={styles.heroBgImage}
            sizes="100vw"
          />
        </div>

        <div className={styles.heroOverlay}></div>

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <FaFire className={styles.fireIcon} />
            Tienda de Pádel Premium
          </h1>
          <p className={styles.heroSubtitle}>
            Las mejores pelotas y ropa deportiva para tu juego
          </p>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <FaStar className={styles.statIcon} />
              <span>+500 clientes satisfechos</span>
            </div>
            <div className={styles.stat}>
              <FaShoppingCart className={styles.statIcon} />
              <span>Envíos a todo el país</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className={styles.filtros}>
        <button
          className={`${styles.filtroBtn} ${filtro === 'todos' ? styles.active : ''}`}
          onClick={() => setFiltro('todos')}
        >
          Todos los Productos
        </button>
        <button
          className={`${styles.filtroBtn} ${filtro === 'pelota' ? styles.active : ''}`}
          onClick={() => setFiltro('pelota')}
        >
          ⚽ Pelotas
        </button>
        <button
          className={`${styles.filtroBtn} ${filtro === 'ropa' ? styles.active : ''}`}
          onClick={() => setFiltro('ropa')}
        >
          👕 Ropa Deportiva
        </button>
        <button
          className={`${styles.filtroBtn} ${filtro === 'accesorio' ? styles.active : ''}`}
          onClick={() => setFiltro('accesorio')}
        >
          🎒 Accesorios
        </button>
      </section>

      {/* Grid de Productos */}
      <section className={styles.productosSection}>
        {productosLimitados.length === 0 ? (
          <div className={styles.noProductos}>
            <p>No hay productos disponibles en esta categoría</p>
          </div>
        ) : (
          <>
            <div className={styles.verMasContainer}>
              <button onClick={handleVerMas} className={styles.verMasBtn}>
                Ver Más Productos ({productos.length - 6} más)
              </button>
            </div>
            <div className={styles.productosGrid}>
              {productosLimitados.map((producto) => {
                return (
                  <article key={producto._id} className={styles.productCard}>
                    {producto.destacado && (
                      <div className={styles.badge}>⭐ Destacado</div>
                    )}
                    {producto.descuento > 0 && (
                      <div className={styles.descuentoBadge}>-{producto.descuento}%</div>
                    )}

                    <div className={styles.imageContainer}>
                      {producto.imagenUrl ? (
                        <img
                          src={producto.imagenUrl}
                          alt={producto.nombre}
                          className={styles.productImage}
                        />
                      ) : (
                        <div className={styles.noImage}>
                          <img
                            src="./assets/europadel.jpg"
                            alt="Imagen por defecto"
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      )}
                    </div>

                    <div className={styles.productInfo}>
                      <span className={styles.marca}>{producto.marca}</span>
                      <h3 className={styles.productName}>{producto.nombre}</h3>
                      <p className={styles.descripcion}>{producto.descripcion}</p>

                      <div className={styles.precioContainer}>
                        {producto.descuento > 0 ? (
                          <>
                            <span className={styles.precioTachado}>
                              {formatearPrecio(producto.precio, producto.moneda)}
                            </span>
                            <span className={styles.precioFinal}>
                              {formatearPrecio(producto.precioFinal, producto.moneda)}
                            </span>
                          </>
                        ) : (
                          <span className={styles.precioFinal}>
                            {formatearPrecio(producto.precioFinal, producto.moneda)}
                          </span>
                        )}
                      </div>

                      <button
                        className={styles.whatsappBtn}
                        onClick={() => handleWhatsApp(producto)}
                      >
                        <FaWhatsapp /> Consultar por WhatsApp
                      </button>
                    </div>
                  </article>

                );
              })}
            </div>

            {/* Botón Ver Más */}
            {productos.length > 6 && (
              <div className={styles.verMasContainer}>
                <button onClick={handleVerMas} className={styles.verMasBtn}>
                  Ver Más Productos ({productos.length - 6} más)
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}