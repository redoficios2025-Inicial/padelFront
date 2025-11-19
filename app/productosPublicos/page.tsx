"use client";
import { useState, useEffect } from 'react';
import { Trash2, RefreshCw, Eye, Package, DollarSign, AlertCircle, Store } from 'lucide-react';

const API_PRODUCTOS_PUBLICOS = 'https://padel-back-kohl.vercel.app/api/productos-vendedor/publicos';
// const API_PRODUCTOS_PUBLICOS = 'https://europadel-back.vercel.app/api/productos-vendedor/publicos';

interface ProductoPublico {
    _id: string;
    productoAdminId: string;
    productoVendedorId: string;
    vendedorId: string;
    codigo: string;
    nombre: string;
    marca: string;
    descripcion: string;
    stock: number;
    precio: number;
    precioFinal: number;
    moneda: 'ARS' | 'USD';
    descuento: number;
    categoria: 'paleta' | 'ropa' | 'accesorio';
    destacado: boolean;
    imagenUrl: string;
    whatsappAdmin: string;
    userWhatsapp: string;
    recargos: {
        transporte: number;
        margen: number;
        otros: number;
    };
    createdAt: string;
    updatedAt: string;
}

interface Props {
    vendedorId: string;
    onClose?: () => void;
}

export default function GestionProductosPublicos({ vendedorId, onClose }: Props) {
    const [productosPublicos, setProductosPublicos] = useState<ProductoPublico[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [productoDetalle, setProductoDetalle] = useState<ProductoPublico | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [busqueda, setBusqueda] = useState<string>('');

    useEffect(() => {
        if (vendedorId) {
            cargarProductosPublicos();
        }
    }, [vendedorId]);

    const obtenerToken = (): string | null => {
        const token = sessionStorage.getItem('vendedorToken');
        if (!token || token === 'VENDEDOR_TOKEN_2024') {
            console.error('❌ Token inválido');
            return null;
        }
        return token;
    };

    const cargarProductosPublicos = async () => {
        console.log('🔍 Cargando productos públicos del vendedor:', vendedorId);
        setLoading(true);
        setError('');

        try {
            const token = obtenerToken();
            if (!token) {
                setError('No hay token válido. Inicia sesión nuevamente.');
                setLoading(false);
                return;
            }

            const res = await fetch(`${API_PRODUCTOS_PUBLICOS}?vendedorId=${vendedorId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                throw new Error(`Error ${res.status}: ${await res.text()}`);
            }

            const data = await res.json();
            console.log('📦 Productos públicos recibidos:', data);

            if (data.success) {
                setProductosPublicos(data.data);
            } else {
                setError(data.message || 'Error al cargar productos');
            }
        } catch (err) {
            console.error('❌ Error al cargar productos públicos:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    const eliminarProductoPublico = async (id: string) => {
        if (!confirm('⚠️ ¿Estás seguro de eliminar este producto de la tienda pública?\n\nEsto NO eliminará tu producto personalizado del panel de vendedor.')) {
            return;
        }

        console.log('🗑️ Eliminando producto público:', id);
        setLoading(true);

        try {
            const token = obtenerToken();
            if (!token) {
                alert('❌ No hay token válido. Inicia sesión nuevamente.');
                setLoading(false);
                return;
            }

            const res = await fetch(`${API_PRODUCTOS_PUBLICOS}/${id}?vendedorId=${vendedorId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await res.json();

            if (res.ok && data.success) {
                alert('✅ Producto eliminado de la tienda pública exitosamente');
                await cargarProductosPublicos();
            } else {
                alert('❌ Error: ' + (data.message || 'Error desconocido'));
            }
        } catch (err) {
            console.error('❌ Error al eliminar:', err);
            alert('❌ Error de conexión al eliminar producto');
        } finally {
            setLoading(false);
        }
    };

    const verDetalle = (producto: ProductoPublico) => {
        setProductoDetalle(producto);
        setShowModal(true);
    };

    const fmt = (precio: number, moneda: 'ARS' | 'USD') => {
        return moneda === 'ARS'
            ? `$${precio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : `EUR €${precio.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const productosFiltrados = productosPublicos.filter(p => 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.codigo.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-4 sm:p-6 md:p-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <Store size={32} />
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold">🏪 Productos en Tienda Pública</h2>
                            <p className="text-purple-100 text-sm">Gestiona qué productos se muestran a los clientes</p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg font-semibold transition"
                        >
                            Cerrar
                        </button>
                    )}
                </div>

                <div className="bg-purple-700 bg-opacity-50 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                        <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-semibold mb-1">ℹ️ Información importante:</p>
                            <ul className="space-y-1 text-purple-100">
                                <li>• Estos son los productos que los CLIENTES ven en la tienda</li>
                                <li>• Si el admin elimina un producto, seguirá aquí hasta que TÚ lo elimines</li>
                                <li>• Eliminar de aquí NO elimina tu producto del panel de vendedor</li>
                                <li>• Total de productos públicos: <strong>{productosPublicos.length}</strong></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {/* Controles */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                    type="text"
                    placeholder="🔍 Buscar producto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 outline-none text-gray-900"
                />
                <button
                    onClick={cargarProductosPublicos}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
            </div>

            {/* Lista de Productos */}
            {loading && productosPublicos.length === 0 ? (
                <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Cargando productos públicos...</p>
                </div>
            ) : productosFiltrados.length === 0 ? (
                <div className="text-center py-10 bg-purple-50 rounded-xl">
                    <Store size={60} className="text-purple-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-semibold">
                        {busqueda 
                            ? 'No se encontraron productos con ese criterio' 
                            : 'No tienes productos publicados en la tienda pública'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Los productos se publican automáticamente cuando los creas o editas
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {productosFiltrados.map((producto) => (
                        <div 
                            key={producto._id} 
                            className="bg-white border-2 border-purple-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-purple-400 transition-all duration-300"
                        >
                            {/* Imagen */}
                            {producto.imagenUrl ? (
                                <div className="relative h-48 bg-gray-100">
                                    <img 
                                        src={producto.imagenUrl} 
                                        alt={producto.nombre} 
                                        className="w-full h-full object-cover" 
                                    />
                                    <span className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                        🏪 PÚBLICO
                                    </span>
                                </div>
                            ) : (
                                <div className="relative h-48 flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                                    <Package size={40} className="text-purple-300" />
                                </div>
                            )}

                            {/* Contenido */}
                            <div className="p-4">
                                <div className="flex justify-between mb-2 gap-1.5 flex-wrap">
                                    <span className="bg-gray-800 text-white px-2 py-1 rounded-lg text-xs font-bold">
                                        {producto.codigo}
                                    </span>
                                    <span className="bg-purple-600 text-white px-2 py-1 rounded-lg text-xs font-bold capitalize">
                                        {producto.categoria}
                                    </span>
                                </div>

                                <h3 className="text-base font-bold mb-1 truncate text-gray-900">
                                    {producto.nombre}
                                </h3>
                                <p className="text-sm font-semibold text-purple-700 mb-2">
                                    {producto.marca}
                                </p>
                                <p className="text-xs text-gray-700 mb-3 line-clamp-2">
                                    {producto.descripcion}
                                </p>

                                {/* Precios */}
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 p-3 rounded-xl mb-3">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs text-gray-700 font-semibold">Precio Final:</span>
                                        <span className="text-base font-bold text-purple-700">
                                            {fmt(producto.precioFinal, producto.moneda)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-900">Stock:</span>
                                        <span className={`text-sm font-bold ${
                                            producto.stock > 5 
                                                ? 'text-emerald-700' 
                                                : producto.stock > 0 
                                                    ? 'text-amber-700' 
                                                    : 'text-red-700'
                                        }`}>
                                            {producto.stock}
                                        </span>
                                    </div>
                                    {producto.descuento > 0 && (
                                        <span className="inline-block w-full text-center px-2 py-1 rounded-lg text-xs font-bold bg-red-600 text-white mt-2">
                                            -{producto.descuento}% OFF
                                        </span>
                                    )}
                                </div>

                                {/* Botones */}
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => verDetalle(producto)}
                                        className="py-2.5 bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white rounded-lg font-semibold transition shadow-md text-sm flex items-center justify-center gap-1"
                                    >
                                        <Eye size={16} />
                                        Ver
                                    </button>
                                    <button
                                        onClick={() => eliminarProductoPublico(producto._id)}
                                        disabled={loading}
                                        className="py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold transition shadow-md text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                                    >
                                        <Trash2 size={16} />
                                        Quitar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Detalle */}
            {showModal && productoDetalle && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" 
                    onClick={() => setShowModal(false)}
                >
                    <div 
                        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 flex justify-between items-center z-10 rounded-t-3xl">
                            <h2 className="text-2xl font-bold">📦 Detalle del Producto Público</h2>
                            <button 
                                onClick={() => setShowModal(false)} 
                                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center text-3xl transition"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    {productoDetalle.imagenUrl ? (
                                        <img 
                                            src={productoDetalle.imagenUrl} 
                                            alt={productoDetalle.nombre} 
                                            className="w-full rounded-2xl shadow-xl border-2 border-gray-200" 
                                        />
                                    ) : (
                                        <div className="w-full h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow-xl border-2 border-gray-200 flex items-center justify-center">
                                            <Package size={80} className="text-purple-300" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="bg-gray-800 text-white px-3 py-1.5 rounded-xl font-bold text-sm">
                                            {productoDetalle.codigo}
                                        </span>
                                        <span className="bg-purple-600 text-white px-3 py-1.5 rounded-xl font-bold text-sm capitalize">
                                            {productoDetalle.categoria}
                                        </span>
                                        <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-1.5 rounded-xl font-bold text-sm">
                                            🏪 PÚBLICO
                                        </span>
                                    </div>

                                    <div className="border-b-2 border-gray-200 pb-3">
                                        <p className="text-sm text-gray-600 font-semibold mb-1">Nombre</p>
                                        <p className="text-2xl font-bold text-gray-900">{productoDetalle.nombre}</p>
                                    </div>

                                    <div className="border-b-2 border-gray-200 pb-3">
                                        <p className="text-sm text-gray-600 font-semibold mb-1">Marca</p>
                                        <p className="text-xl font-semibold text-purple-700">{productoDetalle.marca}</p>
                                    </div>

                                    <div className="border-b-2 border-gray-200 pb-3">
                                        <p className="text-sm text-gray-600 font-semibold mb-1">Descripción</p>
                                        <p className="text-gray-900 leading-relaxed">{productoDetalle.descripcion}</p>
                                    </div>

                                    <div className="border-b-2 border-gray-200 pb-3">
                                        <p className="text-sm text-gray-600 font-semibold mb-1">Stock Disponible</p>
                                        <p className={`text-xl font-bold ${
                                            productoDetalle.stock > 5 
                                                ? 'text-emerald-700' 
                                                : productoDetalle.stock > 0 
                                                    ? 'text-amber-700' 
                                                    : 'text-red-700'
                                        }`}>
                                            {productoDetalle.stock} {productoDetalle.stock === 1 ? 'unidad' : 'unidades'}
                                        </p>
                                    </div>

                                    <div className="border-b-2 border-gray-200 pb-3">
                                        <p className="text-sm text-gray-600 font-semibold mb-1">WhatsApp de contacto</p>
                                        <p className="text-lg font-semibold text-purple-700">{productoDetalle.userWhatsapp}</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-400 p-5 rounded-2xl">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                <DollarSign size={24} className="text-purple-600" />
                                                Precio Final:
                                            </span>
                                            <span className="text-3xl font-bold text-purple-700">
                                                {fmt(productoDetalle.precioFinal, productoDetalle.moneda)}
                                            </span>
                                        </div>
                                        {productoDetalle.descuento > 0 && (
                                            <div className="bg-red-100 border border-red-300 px-3 py-2 rounded-lg text-center">
                                                <span className="text-red-700 font-bold">
                                                    🔥 Descuento: -{productoDetalle.descuento}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}