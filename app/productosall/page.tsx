// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { FaWhatsapp, FaSearch, FaArrowLeft, FaStar, FaFilter } from 'react-icons/fa';
// import styles from '../productosallcss/productos.module.css';
// import Footer from '../components/Footer';

// const API_URL = 'https://padel-back-kohl.vercel.app/api/productos';

// interface Producto {
//     _id: string;
//     codigo: string;
//     nombre: string;
//     marca: string;
//     descripcion: string;
//     precio: number;
//     precioFinal: number;
//     moneda: 'ARS' | 'USD';
//     descuento: number;
//     imagenUrl: string;
//     categoria: 'pelota' | 'ropa' | 'accesorio';
//     destacado: boolean;
//     whatsapp: string;
//     recargos: {
//         transporte: number;
//         margen: number;
//         otros: number;
//     };
//     createdAt: string;
//     updatedAt: string;
// }

// export default function ProductosPage() {
//     const router = useRouter();
//     const [productos, setProductos] = useState<Producto[]>([]);
//     const [filtros, setFiltros] = useState({
//         buscar: '',
//         categoria: 'todos',
//         destacado: false,
//     });
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string>('');
//     const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);
//     const [showModal, setShowModal] = useState(false);

//     useEffect(() => {
//         cargarProductos();
//     }, [filtros]);

//     const cargarProductos = async () => {
//         setLoading(true);
//         setError('');
//         try {
//             const params = new URLSearchParams();
//             if (filtros.categoria !== 'todos') {
//                 params.append('categoria', filtros.categoria);
//             }
//             if (filtros.destacado) {
//                 params.append('destacado', 'true');
//             }
//             if (filtros.buscar) {
//                 params.append('buscar', filtros.buscar);
//             }

//             const res = await fetch(`${API_URL}?${params}`);
//             const data = await res.json();

//             if (data.success) {
//                 setProductos(data.data);
//             } else {
//                 setError('Error al cargar productos');
//             }
//         } catch (err) {
//             console.error('Error al cargar productos:', err);
//             setError('Error de conexión con el servidor');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const formatearPrecio = (precio: number, moneda: 'ARS' | 'USD'): string => {
//         if (moneda === 'ARS') {
//             return `$${precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
//         }
//         return `USD $${precio.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
//     };

//     const handleWhatsApp = (producto: Producto) => {
//         const mensaje = `Hola! Estoy interesado en: *${producto.nombre}* - ${producto.marca} (Código: ${producto.codigo})\nPrecio: ${formatearPrecio(producto.precioFinal, producto.moneda)}`;
//         const url = `https://wa.me/${producto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
//         window.open(url, '_blank');
//     };

//     const verDetalle = (producto: Producto) => {
//         setProductoDetalle(producto);
//         setShowModal(true);
//     };

//     if (loading) {
//         return (
//             <div className={styles.loadingContainer}>
//                 <div className={styles.spinner}></div>
//                 <p>Cargando productos...</p>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className={styles.container}>
//                 <div className={styles.errorContainer}>
//                     <h2>⚠️ {error}</h2>
//                     <button onClick={cargarProductos} className={styles.retryBtn}>
//                         Reintentar
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className={styles.container}>
//             {/* Header */}
//             <section className={styles.header}>
//                 <button onClick={() => router.push('/')} className={styles.backBtn}>
//                     <FaArrowLeft /> Volver al Inicio
//                 </button>
//                 <h1 className={styles.title}>Catálogo Completo</h1>
//                 <p className={styles.subtitle}>Todos nuestros productos disponibles</p>
//             </section>

//             {/* Filtros */}
//             <section className={styles.filtrosSection}>
//                 <div className={styles.filtrosContainer}>
//                     <div className={styles.filtroItem}>
//                         <FaSearch className={styles.icon} />
//                         <input
//                             type="text"
//                             placeholder="Buscar por nombre, marca o código..."
//                             value={filtros.buscar}
//                             onChange={(e) => setFiltros({ ...filtros, buscar: e.target.value })}
//                             className={styles.searchInput}
//                         />
//                     </div>

//                     <div className={styles.filtroItem}>
//                         <FaFilter className={styles.icon} />
//                         <select
//                             value={filtros.categoria}
//                             onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
//                             className={styles.selectInput}
//                         >
//                             <option value="todos">Todas las categorías</option>
//                             <option value="pelota">⚽ Pelotas</option>
//                             <option value="ropa">👕 Ropa</option>
//                             <option value="accesorio">🎒 Accesorios</option>
//                         </select>
//                     </div>

//                     <label className={styles.checkboxLabel}>
//                         <input
//                             type="checkbox"
//                             checked={filtros.destacado}
//                             onChange={(e) => setFiltros({ ...filtros, destacado: e.target.checked })}
//                             className={styles.checkbox}
//                         />
//                         <FaStar className={styles.starIcon} />
//                         Solo destacados
//                     </label>
//                 </div>

//                 <div className={styles.resultadosInfo}>
//                     <p>Se encontraron <strong>{productos.length}</strong> productos</p>
//                 </div>
//             </section>

//             {/* Grid de Productos */}
//             <section className={styles.productosSection}>
//                 {productos.length === 0 ? (
//                     <div className={styles.noProductos}>
//                         <p>No se encontraron productos con los filtros seleccionados</p>
//                         <button onClick={() => setFiltros({ buscar: '', categoria: 'todos', destacado: false })} className={styles.limpiarBtn}>
//                             Limpiar Filtros
//                         </button>
//                     </div>
//                 ) : (
//                     <div className={styles.productosGrid}>
//                         {productos.map((producto) => (
//                             <article key={producto._id} className={styles.productCard}>
//                                 {producto.destacado && (
//                                     <div className={styles.badge}>⭐ Destacado</div>
//                                 )}
//                                 {producto.descuento > 0 && (
//                                     <div className={styles.descuentoBadge}>-{producto.descuento}%</div>
//                                 )}

//                                 <div className={styles.imageContainer} onClick={() => verDetalle(producto)}>
//                                     {producto.imagenUrl ? (
//                                         <img
//                                             src={producto.imagenUrl}
//                                             alt={producto.nombre}
//                                             className={styles.productImage}
//                                         />
//                                     ) : (
//                                         <div className={styles.noImage}>
//                                             <img
//                                                 src="./assets/europadel.jpg"
//                                                 alt="Imagen por defecto"
//                                                 className="w-full h-full object-cover rounded"
//                                             />

//                                         </div>
//                                     )}
//                                 </div>

//                                 <div className={styles.productInfo}>
//                                     <div className={styles.categoriaTag}>
//                                         {producto.categoria === 'pelota' && '⚽'}
//                                         {producto.categoria === 'ropa' && '👕'}
//                                         {producto.categoria === 'accesorio' && '🎒'}
//                                         {' '}{producto.categoria}
//                                     </div>
//                                     <span className={styles.marca}>{producto.marca}</span>
//                                     <h3 className={styles.productName}>{producto.nombre}</h3>
//                                     <p className={styles.descripcion}>{producto.descripcion}</p>
//                                     <p className={styles.codigo}>Código: {producto.codigo}</p>

//                                     <div className={styles.precioContainer}>
//                                         {producto.descuento > 0 ? (
//                                             <>
//                                                 <span className={styles.precioTachado}>
//                                                     {formatearPrecio(producto.precio, producto.moneda)}
//                                                 </span>
//                                                 <span className={styles.precioFinal}>
//                                                     {formatearPrecio(producto.precioFinal, producto.moneda)}
//                                                 </span>
//                                             </>
//                                         ) : (
//                                             <span className={styles.precioFinal}>
//                                                 {formatearPrecio(producto.precioFinal, producto.moneda)}
//                                             </span>
//                                         )}
//                                     </div>

//                                     <div className={styles.actions}>
//                                         <button
//                                             className={styles.verDetalleBtn}
//                                             onClick={() => verDetalle(producto)}
//                                         >
//                                             Ver Detalle
//                                         </button>
//                                         <button
//                                             className={styles.whatsappBtn}
//                                             onClick={() => handleWhatsApp(producto)}
//                                         >
//                                             <FaWhatsapp /> WhatsApp
//                                         </button>
//                                     </div>
//                                 </div>
//                             </article>
//                         ))}
//                     </div>
//                 )}
//             </section>

//             {/* Modal Detalle */}
//             {showModal && productoDetalle && (
//                 <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
//                     <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
//                         <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>

//                         <div className={styles.modalGrid}>
//                             <div className={styles.modalImage}>
//                                 {productoDetalle.imagenUrl ? (
//                                     <img src={productoDetalle.imagenUrl} alt={productoDetalle.nombre} />
//                                 ) : (
//                                     <div className={styles.noImageModal}>Sin imagen</div>
//                                 )}
//                             </div>

//                             <div className={styles.modalInfo}>
//                                 <div className={styles.modalHeader}>
//                                     {productoDetalle.destacado && <span className={styles.modalBadge}>⭐ Destacado</span>}
//                                     <span className={styles.modalCategoria}>{productoDetalle.categoria}</span>
//                                 </div>

//                                 <h2 className={styles.modalTitle}>{productoDetalle.nombre}</h2>
//                                 <p className={styles.modalMarca}>{productoDetalle.marca}</p>
//                                 <p className={styles.modalCodigo}>Código: {productoDetalle.codigo}</p>

//                                 <div className={styles.modalDescripcion}>
//                                     <h3>Descripción</h3>
//                                     <p>{productoDetalle.descripcion}</p>
//                                 </div>

//                                 <div className={styles.modalPrecio}>
//                                     {productoDetalle.descuento > 0 && (
//                                         <>
//                                             <span className={styles.modalPrecioTachado}>
//                                                 {formatearPrecio(productoDetalle.precio, productoDetalle.moneda)}
//                                             </span>
//                                             <span className={styles.modalDescuento}>-{productoDetalle.descuento}%</span>
//                                         </>
//                                     )}
//                                     <span className={styles.modalPrecioFinal}>
//                                         {formatearPrecio(productoDetalle.precioFinal, productoDetalle.moneda)}
//                                     </span>
//                                 </div>

//                                 <button
//                                     className={styles.modalWhatsappBtn}
//                                     onClick={() => handleWhatsApp(productoDetalle)}
//                                 >
//                                     <FaWhatsapp /> Consultar por WhatsApp
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <Footer />
//         </div>
//     );
// }



'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaWhatsapp, FaSearch, FaArrowLeft, FaStar, FaFilter } from 'react-icons/fa';
import styles from '../productosallcss/productos.module.css';
import Footer from '../components/Footer';

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

export default function ProductosPage() {
    const router = useRouter();
    const [productos, setProductos] = useState<Producto[]>([]);
    const [filtros, setFiltros] = useState({
        buscar: '',
        categoria: 'todos',
        destacado: false,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        cargarProductos();
    }, [filtros]);

    const cargarProductos = async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (filtros.categoria !== 'todos') {
                params.append('categoria', filtros.categoria);
            }
            if (filtros.destacado) {
                params.append('destacado', 'true');
            }
            if (filtros.buscar) {
                params.append('buscar', filtros.buscar);
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

    const verDetalle = (producto: Producto) => {
        setProductoDetalle(producto);
        setShowModal(true);
    };

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
            {/* Header */}
            <section className={styles.header}>
                <button onClick={() => router.push('/')} className={styles.backBtn}>
                    <FaArrowLeft /> Volver al Inicio
                </button>
                <h1 className={styles.title}>Catálogo Completo</h1>
                <p className={styles.subtitle}>Todos nuestros productos disponibles</p>
            </section>

            {/* Filtros */}
            <section className={styles.filtrosSection}>
                <div className={styles.filtrosContainer}>
                    <div className={styles.filtroItem}>
                        <FaSearch className={styles.icon} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, marca o código..."
                            value={filtros.buscar}
                            onChange={(e) => setFiltros({ ...filtros, buscar: e.target.value })}
                            className={`${styles.searchInput} inputBlack`}
                        />
                    </div>

                    <div className={styles.filtroItem}>
                        <FaFilter className={styles.icon} />
                        <select
                            value={filtros.categoria}
                            onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                            className={`${styles.selectInput} inputBlack`}
                        >
                            <option value="todos">Todas las categorías</option>
                            <option value="pelota">⚽ Pelotas</option>
                            <option value="ropa">👕 Ropa</option>
                            <option value="accesorio">🎒 Accesorios</option>
                        </select>
                    </div>

                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={filtros.destacado}
                            onChange={(e) => setFiltros({ ...filtros, destacado: e.target.checked })}
                            className={styles.checkbox}
                        />
                        <FaStar className={styles.starIcon} />
                        Solo destacados
                    </label>
                </div>

                <div className={styles.resultadosInfo}>
                    <p>Se encontraron <strong>{productos.length}</strong> productos</p>
                </div>
            </section>

            {/* Grid de Productos */}
            <section className={styles.productosSection}>
                {productos.length === 0 ? (
                    <div className={styles.noProductos}>
                        <p>No se encontraron productos con los filtros seleccionados</p>
                        <button onClick={() => setFiltros({ buscar: '', categoria: 'todos', destacado: false })} className={styles.limpiarBtn}>
                            Limpiar Filtros
                        </button>
                    </div>
                ) : (
                    <div className={styles.productosGrid}>
                        {productos.map((producto) => (
                            <article key={producto._id} className={styles.productCard}>
                                {producto.destacado && (
                                    <div className={styles.badge}>⭐ Destacado</div>
                                )}
                                {producto.descuento > 0 && (
                                    <div className={styles.descuentoBadge}>-{producto.descuento}%</div>
                                )}

                                <div className={styles.imageContainer} onClick={() => verDetalle(producto)}>
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
                                    <div className={styles.categoriaTag}>
                                        {producto.categoria === 'pelota' && '⚽'}
                                        {producto.categoria === 'ropa' && '👕'}
                                        {producto.categoria === 'accesorio' && '🎒'}
                                        {' '}{producto.categoria}
                                    </div>
                                    <span className={styles.marca}>{producto.marca}</span>
                                    <h3 className={styles.productName}>{producto.nombre}</h3>
                                    <p className={styles.descripcion}>{producto.descripcion}</p>
                                    <p className={styles.codigo}>Código: {producto.codigo}</p>

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

                                    <div className={styles.actions}>
                                        <button
                                            className={styles.verDetalleBtn}
                                            onClick={() => verDetalle(producto)}
                                        >
                                            Ver Detalle
                                        </button>
                                        <button
                                            className={styles.whatsappBtn}
                                            onClick={() => handleWhatsApp(producto)}
                                        >
                                            <FaWhatsapp /> WhatsApp
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* Modal Detalle */}
            {showModal && productoDetalle && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>

                        <div className={styles.modalGrid}>
                            <div className={styles.modalImage}>
                                {productoDetalle.imagenUrl ? (
                                    <img src={productoDetalle.imagenUrl} alt={productoDetalle.nombre} />
                                ) : (
                                    <div className={styles.noImageModal}>Sin imagen</div>
                                )}
                            </div>

                            <div className={styles.modalInfo}>
                                <div className={styles.modalHeader}>
                                    {productoDetalle.destacado && <span className={styles.modalBadge}>⭐ Destacado</span>}
                                    <span className={styles.modalCategoria}>{productoDetalle.categoria}</span>
                                </div>

                                <h2 className={styles.modalTitle}>{productoDetalle.nombre}</h2>
                                <p className={styles.modalMarca}>{productoDetalle.marca}</p>
                                <p className={styles.modalCodigo}>Código: {productoDetalle.codigo}</p>

                                <div className={styles.modalDescripcion}>
                                    <h3>Descripción</h3>
                                    <p>{productoDetalle.descripcion}</p>
                                </div>

                                <div className={styles.modalPrecio}>
                                    {productoDetalle.descuento > 0 && (
                                        <>
                                            <span className={styles.modalPrecioTachado}>
                                                {formatearPrecio(productoDetalle.precio, productoDetalle.moneda)}
                                            </span>
                                            <span className={styles.modalDescuento}>-{productoDetalle.descuento}%</span>
                                        </>
                                    )}
                                    <span className={styles.modalPrecioFinal}>
                                        {formatearPrecio(productoDetalle.precioFinal, productoDetalle.moneda)}
                                    </span>
                                </div>

                                <button
                                    className={styles.modalWhatsappBtn}
                                    onClick={() => handleWhatsApp(productoDetalle)}
                                >
                                    <FaWhatsapp /> Consultar por WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />

            {/* 🔹 Estilos adicionales para inputs y responsividad */}
            <style jsx>{`
                .inputBlack {
                    color: #000;
                    background-color: #fff;
                    border: 1px solid #ccc;
                    padding: 8px;
                    border-radius: 6px;
                    font-size: 14px;
                    width: 100%;
                    max-width: 100%;
                }

                .inputBlack::placeholder {
                    color: #555;
                }

                @media (max-width: 768px) {
                    .${styles.filtrosContainer} {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 10px;
                    }
                    .inputBlack {
                        width: 100%;
                        font-size: 16px;
                    }
                }
            `}</style>
        </div>
    );
}

