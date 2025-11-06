// 'use client';

// import { useState, useEffect } from 'react';
// import Image from 'next/image';
// import { FaWhatsapp, FaShoppingCart, FaStar, FaFire } from 'react-icons/fa';
// import styles from './stylesPage/page.module.css';
// import Footer from './components/Footer';
// import padelImage from '../public/assets/padeljona.jpg'; // ajusta la ruta según tu estructura

// const API_URL = 'https://padel-back-kohl.vercel.app/api/productos';

// interface Producto {
//   _id: string;
//   codigo: string;
//   nombre: string;
//   marca: string;
//   descripcion: string;
//   precio: number;
//   precioFinal: number;
//   moneda: 'ARS' | 'USD';
//   descuento: number;
//   imagenUrl: string;
//   categoria: 'pelota' | 'ropa' | 'accesorio';
//   destacado: boolean;
//   whatsapp: string;
//   recargos: {
//     transporte: number;
//     margen: number;
//     otros: number;
//   };
//   createdAt: string;
//   updatedAt: string;
// }

// export default function HomePage() {
//   const [productos, setProductos] = useState<Producto[]>([]);
//   const [filtro, setFiltro] = useState<'todos' | 'pelota' | 'ropa' | 'accesorio'>('todos');
//   const [busqueda, setBusqueda] = useState<string>('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string>('');

//   useEffect(() => {
//     cargarProductos();
//   }, [filtro]);

//   const cargarProductos = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const params = new URLSearchParams();
//       if (filtro !== 'todos') {
//         params.append('categoria', filtro);
//       }

//       const res = await fetch(`${API_URL}?${params}`);
//       const data = await res.json();

//       if (data.success) {
//         setProductos(data.data);
//       } else {
//         setError('Error al cargar productos');
//       }
//     } catch (err) {
//       console.error('Error al cargar productos:', err);
//       setError('Error de conexión con el servidor');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatearPrecio = (precio: number, moneda: 'ARS' | 'USD'): string => {
//     if (moneda === 'ARS') {
//       return `$${precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
//     }
//     return `USD $${precio.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
//   };

//   const calcularPrecioConDescuento = (precioFinal: number, descuento: number): number => {
//     return precioFinal * (1 - descuento / 100);
//   };

//   const handleWhatsApp = (producto: Producto) => {
//     const precioMostrar = producto.descuento > 0
//       ? calcularPrecioConDescuento(producto.precioFinal, producto.descuento)
//       : producto.precioFinal;

//     const mensaje = `Hola! Estoy interesado en: *${producto.nombre}* - ${producto.marca} (Código: ${producto.codigo})\nPrecio: ${formatearPrecio(precioMostrar, producto.moneda)}`;
//     const url = `https://wa.me/${producto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
//     window.open(url, '_blank');
//   };

//   const handleVerMas = () => {
//     window.location.href = '/productosall';
//   };

//   const productosLimitados = productos.slice(0, 6);

//   // Filtrar productos por búsqueda
//   const productosFiltrados = productosLimitados.filter(producto => {
//     const searchTerm = busqueda.toLowerCase();
//     return (
//       producto.nombre.toLowerCase().includes(searchTerm) ||
//       producto.marca.toLowerCase().includes(searchTerm) ||
//       producto.descripcion.toLowerCase().includes(searchTerm) ||
//       producto.codigo.toLowerCase().includes(searchTerm)
//     );
//   });

//   if (loading) {
//     return (
//       <div className={styles.loadingContainer}>
//         <div className={styles.spinner}></div>
//         <p>Cargando productos...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className={styles.container}>
//         <div style={{
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           minHeight: '100vh',
//           padding: '2rem'
//         }}>
//           <div style={{
//             background: 'white',
//             borderRadius: '1.5rem',
//             boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
//             padding: '3rem',
//             textAlign: 'center',
//             maxWidth: '500px'
//           }}>
//             <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff4757', marginBottom: '1.5rem' }}>
//               ⚠️ {error}
//             </h2>
//             <button
//               onClick={cargarProductos}
//               style={{
//                 padding: '1rem 2rem',
//                 background: 'linear-gradient(135deg, #667eea, #764ba2)',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '1rem',
//                 fontWeight: '700',
//                 cursor: 'pointer',
//                 fontSize: '1rem'
//               }}
//             >
//               Reintentar
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={styles.container}>
//       {/* Hero Section con Imagen de Fondo */}
//       <section className={styles.hero}>
//         {/* Imagen de fondo con blur */}
//         <div className={styles.heroBackground}>
//           <Image
//             src="/assets/padel.jpg"
//             alt="Cancha de pádel"
//             fill
//             priority
//             quality={90}
//             className={styles.heroBgImage}
//             sizes="100vw"
//           />
//         </div>

//         <div className={styles.heroOverlay}></div>

//         <div className={styles.heroContent}>


// <h1 className={styles.heroTitle}>
//   <Image
//     src={padelImage}
//     alt="Ícono de Pádel"
//     className={styles.fireIcon}
//     width={40}      // ajusta según lo necesites
//     height={40}     // ajusta según lo necesites
//   />
//   Tienda de Pádel Premium
// </h1>

//           <p className={styles.heroSubtitle}>
//             Las mejores pelotas y ropa deportiva para tu juego
//           </p>
//           <div className={styles.heroStats}>
//             <div className={styles.stat}>
//               <FaStar className={styles.statIcon} />
//               <span>+500 clientes satisfechos</span>
//             </div>
//             <div className={styles.stat}>
//               <FaShoppingCart className={styles.statIcon} />
//               <span>Envíos a todo el país</span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Filtros */}
//       <section className={styles.filtros}>
//         <div style={{
//           display: 'flex',
//           flexDirection: 'column',
//           gap: '1.5rem',
//           width: '100%',
//           maxWidth: '1400px',
//           margin: '0 auto'
//         }}>
//           {/* Buscador */}
//           <div style={{
//             display: 'flex',
//             justifyContent: 'center',
//             width: '100%'
//           }}>
//             <input
//               type="text"
//               placeholder="🔍 Buscar productos por nombre, marca o código..."
//               value={busqueda}
//               onChange={(e) => setBusqueda(e.target.value)}
//               style={{
//                 width: '100%',
//                 maxWidth: '600px',
//                 padding: '1rem 1.5rem',
//                 fontSize: '1rem',
//                 border: '2px solid rgba(102, 126, 234, 0.2)',
//                 borderRadius: '100px',
//                 outline: 'none',
//                 transition: 'all 0.3s ease',
//                 boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
//                 backgroundColor: 'white',
//                 color: '#000000'
//               }}
//               onFocus={(e) => {
//                 e.target.style.borderColor = '#667eea';
//                 e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.15)';
//               }}
//               onBlur={(e) => {
//                 e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
//                 e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
//               }}
//             />
//           </div>

//           {/* Contador de resultados */}
//           {busqueda && (
//             <div style={{
//               textAlign: 'center',
//               color: '#667eea',
//               fontWeight: '600',
//               fontSize: '0.938rem'
//             }}>
//               {productosFiltrados.length === 0
//                 ? '❌ No se encontraron productos'
//                 : `✓ ${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? 's' : ''} encontrado${productosFiltrados.length !== 1 ? 's' : ''}`
//               }
//             </div>
//           )}
//         </div>
//       </section>

//       {/* Grid de Productos */}
//       <section className={styles.productosSection}>
//         {productosFiltrados.length === 0 ? (
//           <div className={styles.noProductos}>
//             <p>{busqueda
//               ? `No se encontraron productos que coincidan con "${busqueda}"`
//               : 'No hay productos disponibles en esta categoría'
//             }</p>
//           </div>
//         ) : (
//           <>
//             <div className={styles.productosGrid}>
//               {productosFiltrados.map((producto) => {
//                 const precioConDescuento = producto.descuento > 0
//                   ? calcularPrecioConDescuento(producto.precioFinal, producto.descuento)
//                   : producto.precioFinal;

//                 return (
//                   <article key={producto._id} className={styles.productCard}>
//                     {producto.destacado && (
//                       <div className={styles.badge}>⭐ Destacado</div>
//                     )}

//                     <div className={styles.imageContainer}>
//                       {producto.imagenUrl ? (
//                         <img
//                           src={producto.imagenUrl}
//                           alt={producto.nombre}
//                           className={styles.productImage}
//                         />
//                       ) : (
//                         <div className={styles.noImage}>
//                           <img
//                             src="./assets/europadel.jpg"
//                             alt="Imagen por defecto"
//                             style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                           />
//                         </div>
//                       )}

//                       {/* Etiqueta de PRECIO sobre la imagen */}
//                       <div className={styles.precioSobreImagen}>
//                         <div className={`${styles.precioFinalImagen} ${producto.moneda === 'USD' ? styles.precioUSD : ''}`}>
//                           {producto.descuento > 0
//                             ? formatearPrecio(precioConDescuento, producto.moneda)
//                             : formatearPrecio(producto.precioFinal, producto.moneda)
//                           }
//                         </div>
//                       </div>
//                     </div>

//                     <div className={styles.productInfo}>
//                       <div className={styles.topLabels}>
//                         <span className={styles.marca}>{producto.marca}</span>
//                         {producto.descuento > 0 && (
//                           <span className={styles.descuentoBadge}>-{producto.descuento}%</span>
//                         )}
//                       </div>

//                       {producto.descuento > 0 && (
//                         <div className={styles.precioTachado}>
//                           {formatearPrecio(producto.precioFinal, producto.moneda)}
//                         </div>
//                       )}

//                       <h3 className={styles.productName}>{producto.nombre}</h3>
//                       <p className={styles.descripcion}>{producto.descripcion}</p>

//                       <button
//                         className={styles.whatsappBtn}
//                         onClick={() => handleWhatsApp(producto)}
//                       >
//                         <FaWhatsapp /> Consultar por WhatsApp
//                       </button>
//                     </div>
//                   </article>
//                 );
//               })}
//             </div>

//             {/* Botón Ver Más */}
//             {productos.length > 6 && (
//               <div className={styles.verMasContainer}>
//                 <button onClick={handleVerMas} className={styles.verMasBtn}>
//                   Ver Más Productos ({productos.length - 6} más)
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </section>
//       {/* Footer */}
//       <Footer />
//     </div>
//   );
// }






'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaWhatsapp, FaShoppingCart, FaStar, FaFire } from 'react-icons/fa';
import styles from './stylesPage/page.module.css';
import Footer from './components/Footer';
import padelImage from '../public/assets/padeljona.jpg';

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
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'pelota' | 'ropa' | 'accesorio'>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
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

  // Calcular precio sin descuento (precio tachado)
  // Los recargos vienen como porcentajes del precio base (ej: 15, 30, 5)
  // precio base + (precio * suma de porcentajes / 100)
  const calcularPrecioSinDescuento = (precio: number, recargos: { transporte: number; margen: number; otros: number }): number => {
    const porcentajeTotal = recargos.transporte + recargos.margen + recargos.otros;
    return precio + (precio * porcentajeTotal / 100);
  };

  const handleWhatsApp = (producto: Producto) => {
    // Usamos el precioFinal que ya tiene el descuento aplicado
    const mensaje = `Hola! Estoy interesado en: *${producto.nombre}* - ${producto.marca} (Código: ${producto.codigo})\nPrecio: ${formatearPrecio(producto.precioFinal, producto.moneda)}`;
    const url = `https://wa.me/${producto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const handleVerMas = () => {
    window.location.href = '/productosall';
  };

  const productosLimitados = productos.slice(0, 6);

  const productosFiltrados = productosLimitados.filter(producto => {
    const searchTerm = busqueda.toLowerCase();
    return (
      producto.nombre.toLowerCase().includes(searchTerm) ||
      producto.marca.toLowerCase().includes(searchTerm) ||
      producto.descripcion.toLowerCase().includes(searchTerm) ||
      producto.codigo.toLowerCase().includes(searchTerm)
    );
  });

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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1.5rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            padding: '3rem',
            textAlign: 'center',
            maxWidth: '500px'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff4757', marginBottom: '1.5rem' }}>
              ⚠️ {error}
            </h2>
            <button
              onClick={cargarProductos}
              style={{
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
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
            <Image
              src={padelImage}
              alt="Ícono de Pádel"
              className={styles.fireIcon}
              width={40}
              height={40}
            />
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

      {/* Filtros y buscador */}
      <section className={styles.filtros}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <input
              type="text"
              placeholder="🔍 Buscar productos por nombre, marca o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '600px',
                padding: '1rem 1.5rem',
                fontSize: '1rem',
                border: '2px solid rgba(102, 126, 234, 0.2)',
                borderRadius: '100px',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                backgroundColor: 'white',
                color: '#000000'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
              }}
            />
          </div>

          {busqueda && (
            <div style={{ textAlign: 'center', color: '#667eea', fontWeight: '600', fontSize: '0.938rem' }}>
              {productosFiltrados.length === 0
                ? '❌ No se encontraron productos'
                : `✓ ${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? 's' : ''} encontrado${productosFiltrados.length !== 1 ? 's' : ''}`
              }
            </div>
          )}
        </div>
      </section>

      {/* Grid de Productos */}
      <section className={styles.productosSection}>
        {productosFiltrados.length === 0 ? (
          <div className={styles.noProductos}>
            <p>{busqueda
              ? `No se encontraron productos que coincidan con "${busqueda}"`
              : 'No hay productos disponibles en esta categoría'
            }</p>
          </div>
        ) : (
          <>
            <div className={styles.productosGrid}>
              {productosFiltrados.map((producto) => {
                // Precio sin descuento (tachado): precio base + todos los recargos
                const precioSinDescuento = calcularPrecioSinDescuento(producto.precio, producto.recargos);

                // Precio con descuento: viene directo de precioFinal de la BD
                const precioConDescuento = producto.precioFinal;

                return (
                  <article key={producto._id} className={styles.productCard}>
                    {producto.destacado && <div className={styles.badge}>⭐ Destacado</div>}

                    <div className={styles.imageContainer}>
                      {producto.imagenUrl ? (
                        <img src={producto.imagenUrl} alt={producto.nombre} className={styles.productImage} />
                      ) : (
                        <div className={styles.noImage}>
                          <img src="./assets/europadel.jpg" alt="Imagen por defecto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}

                      {/* Precio sobre imagen */}
                      <div className={styles.precioSobreImagen}>
                        <div className={`${styles.precioFinalImagen} ${producto.moneda === 'USD' ? styles.precioUSD : ''}`}>
                          {formatearPrecio(precioConDescuento, producto.moneda)}
                        </div>
                      </div>
                    </div>

                    {/* Contenido de la tarjeta */}
                    <div className={styles.productInfo}>
                      <div className={styles.topLabels}>
                        <span className={styles.marca}>{producto.marca}</span>
                        {producto.descuento > 0 && <span className={styles.descuentoBadge}>-{producto.descuento}%</span>}
                      </div>

                      {producto.descuento > 0 && (
                        <div className={styles.precioTachado}>
                          {formatearPrecio(precioSinDescuento, producto.moneda)}
                        </div>
                      )}

                      <h3 className={styles.productName}>{producto.nombre}</h3>
                      <p className={styles.descripcion}>{producto.descripcion}</p>

                      {/* Botón siempre al final */}
                      <div className={styles.btnContainer}>
                        <button className={styles.whatsappBtn} onClick={() => handleWhatsApp(producto)}>
                          <FaWhatsapp /> Consultar por WhatsApp
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

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

      <Footer />
    </div>
  );
}
