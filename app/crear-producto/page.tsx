
"use client";
import { useState, useEffect, useRef } from 'react';
import { Edit2, Plus, X, Save, Search, Filter, Star, Package, DollarSign, Tag, Phone, AlertCircle, Trash2, RefreshCw } from 'lucide-react';
import { useUser } from '../components/userContext';
import { useRouter } from 'next/navigation';
import GestionProductosPublicos from '../productosPublicos/page';

const API_URL = 'https://padel-back-kohl.vercel.app/api/productos';
const API_VENDEDOR = 'https://padel-back-kohl.vercel.app/api/productos-vendedor';

interface ProductoForm {
    productoAdminId?: string;
    stock: string;
    codigo: string;
    nombre: string;
    marca: string;
    descripcion: string;
    precioAdminFijo: string;
    precioFinal: number;
    moneda: 'ARS' | 'USD';
    descuento: string;
    imagen: string;
    imagenUrl: string;
    categoria: 'paleta' | 'ropa' | 'accesorio';
    destacado: boolean;
    whatsapp: string;
    recargoTransporte: string;
    recargoMargen: string;
    recargoOtros: string;
}

interface Producto {
    _id?: string;
    id?: string;
    soloVendedores: boolean;
    soloUsuarios: boolean;
    stock: number;
    codigo: string;
    nombre: string;
    marca: string;
    descripcion: string;
    precio: number;
    precioAdminFijo?: number;
    precioFinal: number;
    moneda: 'ARS' | 'USD';
    descuento: number;
    imagenUrl: string;
    categoria: 'paleta' | 'ropa' | 'accesorio';
    destacado: boolean;
    whatsapp: string;
    recargos: {
        transporte: number;
        margen: number;
        otros: number;
    };
    productoAdmin?: boolean;
    productoVendedor?: boolean;
    vendedorId?: string;
    productoAdminId?: string;
    yaPersonalizado?: boolean;
    createdAt: string;
    updatedAt: string;
}

interface Login {
    id: string;
    email: string;
    password: string;
}

interface Filtros {
    buscar: string;
    categoria: string;
}

const initialForm: ProductoForm = {
    codigo: '', nombre: '', marca: '', descripcion: '', precioAdminFijo: '', precioFinal: 0, stock: '0',
    moneda: 'ARS', descuento: '0', imagen: '', imagenUrl: '', categoria: 'paleta',
    destacado: false, whatsapp: '', recargoTransporte: '0', recargoMargen: '0', recargoOtros: '0',
};

export default function VendedorProductos() {
    const { user } = useUser();
    const router = useRouter();
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [login, setLogin] = useState<Login>({ id: '', email: '', password: '' });
    const [vendedorId, setVendedorId] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [sincronizando, setSincronizando] = useState<boolean>(false);
    const [form, setForm] = useState<ProductoForm>(initialForm);
    const [productosAdmin, setProductosAdmin] = useState<Producto[]>([]);
    const [misProductos, setMisProductos] = useState<Producto[]>([]);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [editingProductId, setEditingProductId] = useState<string>('');
    const [preview, setPreview] = useState<string>('');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);
    const [filtros, setFiltros] = useState<Filtros>({ buscar: '', categoria: 'todos' });
    const [vistaActual, setVistaActual] = useState<'admin' | 'mis-productos' | 'publicos'>('admin');
    const [whatsappVendedor, setWhatsappVendedor] = useState<string>('');
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (sessionStorage.getItem('isAuthenticatedVendedor') === 'true') {
            setIsAuth(true);
            const savedId = sessionStorage.getItem('vendedorId') || '';
            const savedWhatsapp = sessionStorage.getItem('vendedorWhatsapp') || '';
            setVendedorId(savedId);
            setWhatsappVendedor(savedWhatsapp);
        }

        if (user && user.rol === 'vendedor') {
            setLogin(prev => ({ ...prev, id: user.id }));
        }
    }, [user]);

    useEffect(() => {
        if (isAuth && vendedorId) {
            console.log('✅ Condiciones cumplidas, sincronizando...');
            sincronizarProductos();
        } else {
            console.log('⚠️ No se sincroniza. isAuth:', isAuth, 'vendedorId:', vendedorId);
        }
    }, [isAuth, vendedorId]);

    useEffect(() => {
        if (isAuth) calcular();
    }, [form.precioAdminFijo, form.descuento, form.recargoTransporte, form.recargoMargen, form.recargoOtros, isAuth]);

    const sincronizarManualmente = async () => {
        console.log('🔄 Sincronización manual solicitada');
        await sincronizarProductos();
        alert('✅ Sincronización completada');
    };

    const handleLogin = async () => {
        console.log('🔑 Intentando login...');
        setLoading(true);
        setError('');

        if (!login.email || !login.password) {
            setLoading(false);
            setError('Por favor completa email y contraseña');
            return;
        }

        try {
            const response = await fetch('https://padel-back-kohl.vercel.app/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: login.email,
                    password: login.password
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error en el login');
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Error en el login');
            }

            let usuario;
            let token;

            if (data.data) {
                usuario = data.data;
                token = data.token || data.data.token;
            } else if (data.usuario) {
                usuario = data.usuario;
                token = data.token;
            } else if (data.user) {
                usuario = data.user;
                token = data.token;
            } else {
                usuario = data;
                token = data.token;
            }

            if (!usuario) {
                throw new Error('No se recibieron datos del usuario');
            }

            if (!token) {
                throw new Error('No se recibió token del servidor');
            }

            if (token === 'VENDEDOR_TOKEN_2024' || token.includes('VENDEDOR_TOKEN')) {
                throw new Error('Token de desarrollo detectado. Contacta al administrador.');
            }

            if (usuario.rol !== 'vendedor') {
                throw new Error(`Este usuario tiene rol "${usuario.rol}", no "vendedor"`);
            }

            const userId = usuario.id || usuario._id;

            if (!userId) {
                throw new Error('No se recibió ID del usuario');
            }

            sessionStorage.setItem('isAuthenticatedVendedor', 'true');
            sessionStorage.setItem('vendedorToken', token);
            sessionStorage.setItem('vendedorId', userId);
            sessionStorage.setItem('vendedorWhatsapp', usuario.whatsapp || '+54 9 341 XXX XXXX');

            setIsAuth(true);
            setVendedorId(userId);
            setWhatsappVendedor(usuario.whatsapp || '+54 9 341 XXX XXXX');

            console.log('🎉 Login exitoso! Iniciando sincronización...');

        } catch (err) {
            console.error('❌ Error completo en login:', err);
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido en el login';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        sessionStorage.clear();
        setIsAuth(false);
        setProductosAdmin([]);
        setMisProductos([]);
        setVendedorId('');
        setWhatsappVendedor('');
        reset();
    };

    const calcular = () => {
        const precioBase = parseFloat(form.precioAdminFijo) || 0;
        const descuentoPorcentaje = parseFloat(form.descuento) || 0;
        const transportePorcentaje = parseFloat(form.recargoTransporte) || 0;
        const margenPorcentaje = parseFloat(form.recargoMargen) || 0;
        const otrosPorcentaje = parseFloat(form.recargoOtros) || 0;

        const precioConDescuento = precioBase * (1 - descuentoPorcentaje / 100);
        const totalRecargos = transportePorcentaje + margenPorcentaje + otrosPorcentaje;
        const precioFinal = precioConDescuento * (1 + totalRecargos / 100);

        setForm(prev => ({ ...prev, precioFinal: precioFinal }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type } = target;
        const checked = target.checked;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5242880) {
            alert('Imagen muy grande (máx 5MB)');
            if (fileRef.current) fileRef.current.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            const r = reader.result as string;
            setForm(prev => ({ ...prev, imagen: r }));
            setPreview(r);
        };
        reader.readAsDataURL(file);
    };

    const obtenerToken = (): string | null => {
        const token = sessionStorage.getItem('vendedorToken');
        if (!token) {
            console.error('❌ No hay token en sessionStorage');
            return null;
        }
        if (token === 'VENDEDOR_TOKEN_2024') {
            console.error('❌ Token de desarrollo detectado. Debes hacer login nuevamente.');
            alert('⚠️ Token inválido. Por favor, cierra sesión e inicia sesión nuevamente.');
            return null;
        }
        return token;
    };


    // const sincronizarProductos = async (): Promise<void> => {
    //     const token = sessionStorage.getItem('vendedorToken');
    //     try {
    //         setLoading(true);

    //         // ✅ Verificar que tenemos usuario y token
    //         if (!user?.id) {
    //             throw new Error('No se encontró el ID del vendedor');
    //         }

    //         if (!token) {
    //             throw new Error('No hay token de autenticación');
    //         }

    //         const resSincronizar = await fetch(`${API_URL}/productos-vendedor/sincronizar`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${token}`,
    //             },
    //             body: JSON.stringify({
    //                 vendedorId: user.id
    //             })
    //         });

    //         if (!resSincronizar.ok) {
    //             const errorText = await resSincronizar.text();
    //             throw new Error(`Error ${resSincronizar.status}: ${errorText}`);
    //         }

    //         const dataSincronizar = await resSincronizar.json();

    //         console.log('✅ Sincronización exitosa:', dataSincronizar);

    //         // Aquí puedes agregar más lógica según la respuesta
    //         if (dataSincronizar.success) {
    //             alert(`Sincronización exitosa: ${dataSincronizar.message}`);
    //         }

    //     } catch (error) {
    //         console.error('❌ Error al sincronizar productos:', error);
    //         setError(error instanceof Error ? error.message : 'Error desconocido');
    //     } finally {
    //         setLoading(false);
    //     }
    // };


const sincronizarProductos = async (): Promise<void> => {
    const token = sessionStorage.getItem('vendedorToken');
    try {
        setLoading(true);

        if (!user?.id) {
            throw new Error('No se encontró el ID del vendedor');
        }

        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        // ✅ Usar la URL base correcta (sin /productos)
        const BASE_API = 'https://padel-back-kohl.vercel.app/api';
        
        const resSincronizar = await fetch(`${BASE_API}/productos-vendedor/sincronizar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                vendedorId: user.id
            })
        });

        if (!resSincronizar.ok) {
            const errorText = await resSincronizar.text();
            throw new Error(`Error ${resSincronizar.status}: ${errorText}`);
        }

        const dataSincronizar = await resSincronizar.json();

        console.log('✅ Sincronización exitosa:', dataSincronizar);

        if (dataSincronizar.success) {
            alert(`Sincronización exitosa: ${dataSincronizar.message}`);
            // Recargar productos después de sincronizar
            await cargarMisProductos();
        }

    } catch (error) {
        console.error('❌ Error al sincronizar productos:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
        alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
        setLoading(false);
    }
};


    const cargarProductosAdmin = async () => {
        console.log('🔍 Cargando productos del admin...');
        try {
            const token = obtenerToken();
            if (!token) return;

            const res = await fetch(API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                throw new Error(`Error ${res.status}: ${await res.text()}`);
            }

            const data = await res.json();

            if (data.success) {
                const resPersonalizados = await fetch(
                    `${API_VENDEDOR}?vendedorId=${vendedorId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const dataPersonalizados = await resPersonalizados.json();

                const idsPersonalizados = dataPersonalizados.success
                    ? dataPersonalizados.data
                        .filter((p: Producto) => p.productoAdminId)
                        .map((p: Producto) => p.productoAdminId)
                    : [];

                const productosDisponibles = data.data.filter((p: Producto) => {
                    return p.productoAdmin === true;
                }).map((p: Producto) => ({
                    ...p,
                    yaPersonalizado: idsPersonalizados.includes(p._id || p.id)
                }));

                setProductosAdmin(productosDisponibles);
            }
        } catch (e) {
            console.error('❌ Error al cargar productos admin:', e);
        }
    };

    const cargarMisProductos = async () => {
        console.log('🔍 Cargando MIS productos...');
        try {
            const token = obtenerToken();
            if (!token) return;

            const res = await fetch(`${API_VENDEDOR}?vendedorId=${vendedorId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                throw new Error(`Error ${res.status}: ${await res.text()}`);
            }

            const data = await res.json();

            if (data.success) {
                const misProductosVendedor = data.data.filter((p: Producto) => {
                    return p.productoAdmin === false &&
                        p.productoVendedor === true &&
                        p.vendedorId === vendedorId;
                });

                setMisProductos(misProductosVendedor);
            }
        } catch (e) {
            console.error('❌ Error al cargar mis productos:', e);
        }
    };

    const eliminarProducto = async (id: string) => {
        if (!id) {
            alert('❌ ID de producto no válido');
            return;
        }

        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        setLoading(true);
        try {
            const token = obtenerToken();
            if (!token) {
                alert('❌ No hay token válido. Inicia sesión nuevamente.');
                setLoading(false);
                return;
            }

            const idVendedorActual = vendedorId || user?.id;
            if (!idVendedorActual) {
                alert('❌ No se pudo identificar el vendedor');
                setLoading(false);
                return;
            }

            const res = await fetch(`${API_VENDEDOR}/${id}?vendedorId=${idVendedorActual}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await res.json();

            if (res.ok && data.success) {
                alert('✅ Producto eliminado exitosamente');
                await cargarMisProductos();
                await cargarProductosAdmin();
            } else {
                alert('❌ Error al eliminar: ' + (data.message || 'Error desconocido'));
            }
        } catch (err) {
            console.error('❌ Error al eliminar:', err);
            alert('❌ Error de conexión al eliminar producto');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = obtenerToken();
            if (!token) {
                setError('No hay token válido. Inicia sesión nuevamente.');
                setLoading(false);
                return;
            }

            if (!form.productoAdminId && !editMode) {
                setError('Debes seleccionar un producto del admin primero');
                setLoading(false);
                return;
            }

            const idVendedorActual = vendedorId || user?.id;
            if (!idVendedorActual) {
                setError('No se pudo identificar el vendedor. Inicia sesión nuevamente.');
                setLoading(false);
                return;
            }

            if (!form.whatsapp || form.whatsapp.trim() === '') {
                setError('El número de WhatsApp es obligatorio');
                setLoading(false);
                return;
            }

            const payload = {
                productoAdminId: form.productoAdminId,
                vendedorId: idVendedorActual,
                codigo: form.codigo,
                soloUsuarios: true,
                soloVendedores: false,
                nombre: form.nombre,
                marca: form.marca,
                descripcion: form.descripcion,
                stock: parseInt(form.stock) || 0,
                precioAdminFijo: parseFloat(form.precioAdminFijo),
                moneda: form.moneda,
                descuento: parseFloat(form.descuento) || 0,
                imagen: form.imagen || form.imagenUrl,
                imagenUrl: form.imagenUrl,
                categoria: form.categoria,
                destacado: form.destacado,
                whatsapp: form.whatsapp,
                recargoTransporte: parseFloat(form.recargoTransporte) || 0,
                recargoMargen: parseFloat(form.recargoMargen) || 0,
                recargoOtros: parseFloat(form.recargoOtros) || 0,
                productoAdmin: false
            };

            let url = API_VENDEDOR;
            let method = 'POST';

            if (editMode && editingProductId) {
                url = `${API_VENDEDOR}/${editingProductId}`;
                method = 'PUT';
            }

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('La respuesta del servidor no es JSON');
            }

            const data = await res.json();

            if (res.ok && data.success) {
                alert(editMode ? '✅ ¡Producto actualizado exitosamente!' : '✅ ¡Producto creado exitosamente!');
                reset();
                await cargarProductosAdmin();
                await cargarMisProductos();
                setVistaActual('mis-productos');
            } else {
                const errorMsg = data.message || 'Error desconocido del servidor';
                setError(errorMsg);
                alert('❌ Error: ' + errorMsg);
            }
        } catch (err) {
            console.error('❌ Error completo:', err);
            const errorMsg = err instanceof Error ? err.message : 'Error de conexión desconocido';
            setError(errorMsg);
            alert('❌ ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const seleccionarProductoAdmin = (p: Producto) => {
        if (p.yaPersonalizado) {
            alert('⚠️ Ya personalizaste este producto. Edítalo desde "Mis Productos"');
            return;
        }

        const productoId = p._id || p.id || '';
        setForm({
            productoAdminId: productoId,
            codigo: p.codigo,
            nombre: p.nombre,
            marca: p.marca,
            descripcion: p.descripcion,
            stock: p.stock.toString(),
            precioAdminFijo: (p.precio).toString(),
            precioFinal: p.precioFinal,
            moneda: p.moneda,
            descuento: '0',
            imagen: '',
            imagenUrl: p.imagenUrl,
            categoria: p.categoria,
            destacado: p.destacado,
            whatsapp: whatsappVendedor,
            recargoTransporte: '0',
            recargoMargen: '0',
            recargoOtros: '0',
        });
        setPreview(p.imagenUrl);
        setEditMode(false);
        setEditingProductId('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const editarMiProducto = (p: Producto) => {
        const productoId = p._id || p.id || '';
        setForm({
            productoAdminId: p.productoAdminId,
            codigo: p.codigo,
            nombre: p.nombre,
            marca: p.marca,
            descripcion: p.descripcion,
            stock: p.stock.toString(),
            precioAdminFijo: (p.precio).toString(),
            precioFinal: p.precioFinal,
            moneda: p.moneda,
            descuento: p.descuento.toString(),
            imagen: '',
            imagenUrl: p.imagenUrl,
            categoria: p.categoria,
            destacado: p.destacado,
            whatsapp: p.whatsapp,
            recargoTransporte: p.recargos.transporte.toString(),
            recargoMargen: p.recargos.margen.toString(),
            recargoOtros: p.recargos.otros.toString(),
        });
        setPreview(p.imagenUrl);
        setEditMode(true);
        setEditingProductId(productoId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const verDetalle = (p: Producto) => {
        setProductoDetalle(p);
        setShowModal(true);
    };

    const reset = () => {
        setForm(initialForm);
        setPreview('');
        setEditMode(false);
        setEditingProductId('');
        if (fileRef.current) fileRef.current.value = '';
    };

    const fmt = (p: number | undefined, m: 'ARS' | 'USD') => {
        const precio = p ?? 0;
        return m === 'ARS'
            ? `$${precio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : `EUR €${precio.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const productosFiltrados = (vistaActual === 'admin' ? productosAdmin : misProductos).filter(p => {
        const matchBuscar = p.nombre.toLowerCase().includes(filtros.buscar.toLowerCase()) ||
            p.marca.toLowerCase().includes(filtros.buscar.toLowerCase()) ||
            p.codigo.toLowerCase().includes(filtros.buscar.toLowerCase());
        const matchCategoria = filtros.categoria === 'todos' || p.categoria === filtros.categoria;
        return matchBuscar && matchCategoria;
    });

    // Pantalla de Login
    if (!isAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
                            <Package size={40} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            Panel Vendedor
                        </h1>
                        <p className="text-gray-600">Gestiona tus productos</p>
                    </div>

                    <div className="space-y-4">
                        {user && user.rol === 'vendedor' ? (
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700">
                                    ID Vendedor
                                </label>
                                <input
                                    type="password"
                                    value={login.id || user.id}
                                    readOnly
                                    className="w-full px-4 py-3 border-2 border-emerald-300 bg-emerald-50 rounded-xl outline-none cursor-not-allowed text-gray-900"
                                />
                                <p className="text-xs text-emerald-600 mt-1 font-semibold">
                                    ✅ ID autocompletado desde tu sesión
                                </p>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700">
                                    ID Vendedor
                                </label>
                                <input
                                    type="password"
                                    value={login.id}
                                    onChange={e => setLogin(p => ({ ...p, id: e.target.value }))}
                                    required
                                    placeholder="Tu ID de vendedor"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 outline-none transition text-gray-900"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Consulta tu ID con el administrador
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                value={login.email}
                                onChange={e => setLogin(p => ({ ...p, email: e.target.value }))}
                                required
                                placeholder="vendedor@email.com"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 outline-none transition text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={login.password}
                                onChange={e => setLogin(p => ({ ...p, password: e.target.value }))}
                                required
                                placeholder="••••••"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 outline-none transition text-gray-900"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold disabled:opacity-50 hover:shadow-lg transition transform hover:scale-105"
                        >
                            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                        </button>

                        <div className="bg-blue-50 border-l-4 border-blue-500 px-4 py-3 rounded-lg text-sm">
                            <p className="text-blue-700 font-semibold mb-1">ℹ️ Información:</p>
                            <ul className="text-blue-600 text-xs space-y-1">
                                <li>• Usa las credenciales que te proporcionó el administrador</li>
                                <li>• Si no recuerdas tu contraseña, contacta al administrador</li>
                                <li>• El ID debe ser el mismo que te asignaron</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Panel Principal (cuando está autenticado)
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 p-3 sm:p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {sincronizando && (
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-4 mb-4 shadow-lg">
                        <div className="flex items-center justify-center gap-3">
                            <RefreshCw className="animate-spin" size={24} />
                            <span className="font-semibold">Sincronizando productos nuevos...</span>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl p-4 mb-4 sm:mb-6 shadow-lg border border-gray-100">
                    <div className="flex flex-col gap-3">
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                🛍️ Panel de Vendedor
                            </h1>
                            <p className="text-gray-600 mt-1 text-xs sm:text-sm flex items-center gap-2">
                                <Phone size={14} className="text-emerald-600" />
                                WhatsApp: <strong className="text-emerald-600">{whatsappVendedor}</strong>
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={() => router.push(`/dashboard/${user?.id}`)}
                                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm rounded-xl font-semibold transition shadow-md"
                            >
                                📊 Dashboard
                            </button>

                            <button
                                onClick={sincronizarManualmente}
                                disabled={sincronizando}
                                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm rounded-xl font-semibold transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={16} className={sincronizando ? 'animate-spin' : ''} />
                                {sincronizando ? 'Sincronizando...' : 'Sincronizar Productos'}
                            </button>

                            <button
                                onClick={logout}
                                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm rounded-xl font-semibold transition shadow-md"
                            >
                                Cerrar Sesión
                            </button>

                            <button
                                onClick={() => setVistaActual('admin')}
                                className={`w-full sm:w-auto px-4 py-2.5 text-sm rounded-xl font-semibold transition shadow-md ${vistaActual === 'admin'
                                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-500'
                                    }`}
                            >
                            </button>

                            <button
                                onClick={() => setVistaActual('mis-productos')}
                                className={`w-full sm:w-auto px-4 py-2.5 text-sm rounded-xl font-semibold transition shadow-md ${vistaActual === 'mis-productos'
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-500'
                                    }`}
                            >
                                🏪 Mis Productos ({misProductos.length})
                            </button>

                            <button
                                onClick={() => setVistaActual('publicos')}
                                className={`w-full sm:w-auto px-4 py-2.5 text-sm rounded-xl font-semibold transition shadow-md ${vistaActual === 'publicos'
                                    ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white'
                                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-pink-500'
                                    }`}
                            >
                                🌐 Productos Públicos
                            </button>
                        </div>
                    </div>
                </div>

                {vistaActual === 'publicos' ? (
                    <GestionProductosPublicos
                        vendedorId={vendedorId}
                        onClose={() => setVistaActual('mis-productos')}
                    />
                ) : (
                    <>
                        {form.productoAdminId && (
                            <form className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-8 shadow-lg border-2 border-emerald-200" onSubmit={handleSubmit}>
                                <div className="bg-gradient-to-r from-emerald-100 to-teal-100 border-2 border-emerald-400 p-4 rounded-xl mb-6">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="text-emerald-700 flex-shrink-0 mt-1" size={24} />
                                        <div>
                                            <h3 className="font-bold text-emerald-900 mb-2">ℹ️ Instrucciones Importantes</h3>
                                            <ul className="text-sm text-emerald-800 space-y-1">
                                                <li>• {editMode ? 'Estás editando un producto existente' : 'Puedes editar todos los campos excepto el Precio Fijo Admin'}</li>
                                                <li>• El precio base está <strong>bloqueado</strong> y es el que definió el administrador</li>
                                                <li>• El <strong>WhatsApp es obligatorio</strong> y puedes cambiarlo según necesites</li>
                                                <li>• Personaliza descuentos, recargos y stock según tus necesidades</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block mb-2 font-semibold text-xs sm:text-sm flex items-center gap-2 text-gray-700">
                                            <Tag size={16} className="text-emerald-600" />
                                            Código
                                        </label>
                                        <input
                                            type="text"
                                            name="codigo"
                                            value={form.codigo}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-emerald-500 transition text-sm text-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-semibold text-xs sm:text-sm flex items-center gap-2 text-gray-700">
                                            <Package size={16} className="text-emerald-600" />
                                            Nombre
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={form.nombre}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-emerald-500 transition text-sm text-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-semibold text-xs sm:text-sm text-gray-700">Marca</label>
                                        <input
                                            type="text"
                                            name="marca"
                                            value={form.marca}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-emerald-500 transition text-sm text-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-semibold text-xs sm:text-sm flex items-center gap-2 text-gray-700">
                                            <Package size={16} className="text-emerald-600" />
                                            Stock/Cantidad
                                        </label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={form.stock}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            step="1"
                                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-emerald-500 transition text-sm text-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-semibold text-xs sm:text-sm text-gray-700">Categoría</label>
                                        <select
                                            name="categoria"
                                            value={form.categoria}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-emerald-500 transition text-sm text-gray-900"
                                        >
                                            <option value="paleta">⚽ Paleta</option>
                                            <option value="ropa">👕 Ropa</option>
                                            <option value="accesorio">🎒 Accesorio</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-semibold text-xs sm:text-sm flex items-center gap-2 text-gray-700">
                                            <DollarSign size={16} className="text-red-600" />
                                            Precio Fijo Admin 🔒
                                        </label>
                                        <input
                                            type="text"
                                            value={form.precioAdminFijo}
                                            readOnly
                                            disabled
                                            className="w-full px-3 py-2.5 border-2 border-red-300 bg-red-50 rounded-xl outline-none text-sm text-gray-900 cursor-not-allowed font-bold"
                                        />
                                        <p className="text-xs text-red-600 mt-1 font-semibold">⚠️ Este precio NO se puede modificar</p>
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-semibold text-xs sm:text-sm text-gray-700">Moneda</label>
                                        <select
                                            name="moneda"
                                            value={form.moneda}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-emerald-500 transition text-sm text-gray-900"
                                        >
                                            <option value="ARS">🇦🇷 ARS (Pesos)</option>
                                            <option value="USD">🇪🇺 EUR (€ Euros)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-semibold text-xs sm:text-sm text-gray-700 flex items-center gap-1">
                                            <span className="text-red-600">🏷️</span> Descuento (%)
                                        </label>
                                        <input
                                            type="number"
                                            name="descuento"
                                            value={form.descuento}
                                            onChange={handleChange}
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-emerald-500 transition text-sm text-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-semibold text-xs sm:text-sm flex items-center gap-2 text-gray-700">
                                            <Phone size={16} className="text-emerald-600" />
                                            WhatsApp <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="whatsapp"
                                            value={form.whatsapp}
                                            onChange={handleChange}
                                            required
                                            placeholder="+54 9 341 XXX XXXX"
                                            className="w-full px-3 py-2.5 border-2 border-emerald-300 rounded-xl outline-none focus:border-emerald-500 transition text-sm text-gray-900"
                                        />
                                        <p className="text-xs text-emerald-600 mt-1 font-semibold">✅ Campo obligatorio - Modifícalo por tu número</p>
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-semibold text-xs sm:text-sm text-gray-700">Rec. Transporte (%)</label>
                                        <input
                                            type="number"
                                            name="recargoTransporte"
                                            value={form.recargoTransporte}
                                            onChange={handleChange}
                                            step="0.01"
                                            min="0"
                                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-emerald-500 transition text-sm text-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-semibold text-xs sm:text-sm text-gray-700">Margen (%)</label>
                                        <input
                                            type="number"
                                            name="recargoMargen"
                                            value={form.recargoMargen}
                                            onChange={handleChange}
                                            step="0.01"
                                            min="0"
                                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-emerald-500 transition text-sm text-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-semibold text-xs sm:text-sm text-gray-700">Otros Recargos (%)</label>
                                        <input
                                            type="number"
                                            name="recargoOtros"
                                            value={form.recargoOtros}
                                            onChange={handleChange}
                                            step="0.01"
                                            min="0"
                                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-emerald-500 transition text-sm text-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 font-semibold cursor-pointer mt-4 sm:mt-8 bg-gradient-to-r from-yellow-50 to-amber-50 p-3 rounded-xl hover:from-yellow-100 hover:to-amber-100 transition border border-yellow-200">
                                            <input type="checkbox" name="destacado" checked={form.destacado} onChange={handleChange} className="w-5 h-5 accent-yellow-500" />
                                            <Star size={18} fill={form.destacado ? 'gold' : 'none'} className="text-yellow-500" />
                                            <span className="text-xs sm:text-sm">Producto Destacado</span>
                                        </label>
                                    </div>

                                    <div className="md:col-span-2 lg:col-span-3">
                                        <label className="block mb-2 font-semibold text-xs sm:text-sm text-gray-700">Descripción</label>
                                        <textarea
                                            name="descripcion"
                                            value={form.descripcion}
                                            onChange={handleChange}
                                            required
                                            rows={4}
                                            placeholder="Describe el producto..."
                                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-emerald-500 resize-y transition text-sm text-gray-900"
                                        />
                                    </div>

                                    <div className="md:col-span-2 lg:col-span-3">
                                        <label className="block mb-2 font-semibold text-xs sm:text-sm text-gray-700">Imagen (Opcional)</label>
                                        <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} className="hidden" />
                                        <button type="button" onClick={() => fileRef.current?.click()} className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold transition shadow-md text-sm">
                                            📷 Cambiar Imagen
                                        </button>
                                        <p className="text-xs text-gray-500 mt-2">Máximo 5MB. Se mantendrá la imagen original si no subes una nueva.</p>
                                        {preview && (
                                            <div className="mt-4 border-2 border-emerald-200 rounded-xl p-3 inline-block bg-gradient-to-br from-emerald-50 to-teal-50">
                                                <img src={preview} alt="Preview" className="max-w-full md:max-w-xs max-h-60 rounded-lg shadow-lg" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4 sm:p-6 rounded-2xl border-2 border-emerald-200">
                                        <h3 className="text-sm font-bold text-gray-800 mb-4 text-center">📊 Cálculo de Tu Precio Final</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center bg-red-50 p-3 rounded-lg border-2 border-red-300">
                                                <span className="text-sm font-semibold text-red-700">🔒 Precio Base (Admin Fijo):</span>
                                                <span className="text-lg font-bold text-red-800">{fmt(parseFloat(form.precioAdminFijo) || 0, form.moneda)}</span>
                                            </div>

                                            {parseFloat(form.descuento) > 0 && (
                                                <>
                                                    <div className="flex justify-between items-center bg-orange-50 p-3 rounded-lg border border-orange-200">
                                                        <span className="text-sm font-semibold text-orange-700">Descuento ({form.descuento}%):</span>
                                                        <span className="text-lg font-bold text-orange-600">-{fmt((parseFloat(form.precioAdminFijo) || 0) * (parseFloat(form.descuento) || 0) / 100, form.moneda)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center bg-amber-50 p-3 rounded-lg border border-amber-200">
                                                        <span className="text-sm font-semibold text-amber-700">Precio con Descuento:</span>
                                                        <span className="text-lg font-bold text-amber-600">{fmt((parseFloat(form.precioAdminFijo) || 0) * (1 - (parseFloat(form.descuento) || 0) / 100), form.moneda)}</span>
                                                    </div>
                                                </>
                                            )}

                                            {(parseFloat(form.recargoTransporte) > 0 || parseFloat(form.recargoMargen) > 0 || parseFloat(form.recargoOtros) > 0) && (
                                                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                                    <p className="text-sm font-bold text-yellow-800 mb-2">Recargos aplicados:</p>
                                                    <div className="space-y-1.5">
                                                        {parseFloat(form.recargoTransporte) > 0 && (
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-yellow-700">Transporte: {form.recargoTransporte}%</span>
                                                                <span className="font-bold text-yellow-800">+{fmt(((parseFloat(form.precioAdminFijo) || 0) * (1 - (parseFloat(form.descuento) || 0) / 100)) * (parseFloat(form.recargoTransporte) || 0) / 100, form.moneda)}</span>
                                                            </div>
                                                        )}
                                                        {parseFloat(form.recargoMargen) > 0 && (
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-yellow-700">Margen: {form.recargoMargen}%</span>
                                                                <span className="font-bold text-yellow-800">+{fmt(((parseFloat(form.precioAdminFijo) || 0) * (1 - (parseFloat(form.descuento) || 0) / 100)) * (parseFloat(form.recargoMargen) || 0) / 100, form.moneda)}</span>
                                                            </div>
                                                        )}
                                                        {parseFloat(form.recargoOtros) > 0 && (
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-yellow-700">Otros: {form.recargoOtros}%</span>
                                                                <span className="font-bold text-yellow-800">+{fmt(((parseFloat(form.precioAdminFijo) || 0) * (1 - (parseFloat(form.descuento) || 0) / 100)) * (parseFloat(form.recargoOtros) || 0) / 100, form.moneda)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center bg-gradient-to-r from-emerald-100 to-green-100 p-4 rounded-lg border-2 border-emerald-400 shadow-md">
                                                <span className="text-base font-bold text-emerald-900">💰 TU PRECIO FINAL:</span>
                                                <span className="text-2xl font-bold text-emerald-700">{fmt(form.precioFinal, form.moneda)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-2 sm:gap-3">
                                    <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-bold text-sm sm:text-base disabled:opacity-50 transition shadow-lg flex items-center justify-center gap-2">
                                        {loading ? '⏳ Guardando...' : editMode ? <><Save size={20} /> Actualizar Producto</> : <><Plus size={20} /> Crear Mi Producto</>}
                                    </button>
                                    <button type="button" onClick={reset} className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800 text-white rounded-xl font-bold text-sm sm:text-base transition shadow-lg flex items-center justify-center gap-2">
                                        <X size={20} /> Cancelar
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="bg-white rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg border border-gray-100">
                            <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2 text-gray-700">
                                        <Search size={16} className="text-emerald-600" />
                                        Buscar
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Nombre, marca o código..."
                                        value={filtros.buscar}
                                        onChange={(e) => setFiltros({ ...filtros, buscar: e.target.value })}
                                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-emerald-500 transition text-sm text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2 text-gray-700">
                                        <Filter size={16} className="text-emerald-600" />
                                        Categoría
                                    </label>
                                    <select
                                        value={filtros.categoria}
                                        onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-emerald-500 transition text-sm text-gray-900"
                                    >
                                        <option value="todos">Todas las categorías</option>
                                        <option value="paleta">⚽ Paletas</option>
                                        <option value="ropa">👕 Ropa</option>
                                        <option value="accesorio">🎒 Accesorios</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-100">
                            {loading && productosFiltrados.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
                                    <p className="mt-4 text-gray-600">Cargando productos...</p>
                                </div>
                            ) : productosFiltrados.length === 0 ? (
                                <div className="text-center py-10">
                                    <Package size={60} className="text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">
                                        {vistaActual === 'admin'
                                            ? 'No hay productos del admin disponibles'
                                            : 'Aún no has creado productos. Selecciona productos del admin para empezar.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                                    {productosFiltrados.map(p => {
                                        const productoId = p._id || p.id || '';
                                        return (
                                            <div key={productoId} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-emerald-300 transition-all duration-300">
                                                {p.imagenUrl ? (
                                                    <div className="relative h-40 sm:h-48 bg-gray-100">
                                                        <img src={p.imagenUrl} alt={p.nombre} className="w-full h-full object-cover" />
                                                        {p.destacado && (
                                                            <span className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                                                <Star size={10} fill="currentColor" /> Destacado
                                                            </span>
                                                        )}
                                                        {vistaActual === 'mis-productos' && (
                                                            <span className="absolute top-2 left-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                                                                🏪 Tuyo
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="relative h-40 sm:h-48 flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
                                                        <Package size={40} className="text-emerald-300" />
                                                        {p.destacado && (
                                                            <span className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                                                <Star size={10} fill="currentColor" /> Destacado
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="p-3 sm:p-4">
                                                    <div className="flex justify-between mb-2 gap-1.5 flex-wrap">
                                                        <span className="bg-gray-800 text-white px-2 py-1 rounded-lg text-xs font-bold">{p.codigo}</span>
                                                        <span className="bg-emerald-600 text-white px-2 py-1 rounded-lg text-xs font-bold capitalize">{p.categoria}</span>
                                                    </div>

                                                    <h3 className="text-sm sm:text-base font-bold mb-1 truncate text-gray-900">{p.nombre}</h3>
                                                    <p className="text-xs sm:text-sm font-semibold text-emerald-700 mb-2">{p.marca}</p>
                                                    <p className="text-xs text-gray-700 mb-3 line-clamp-2">{p.descripcion}</p>

                                                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300 p-2.5 sm:p-3 rounded-xl mb-3">
                                                        {p.precioAdminFijo && (
                                                            <div className="flex justify-between mb-1.5 text-xs bg-red-50 p-2 rounded border border-red-200">
                                                                <span className="text-red-700 font-semibold">🔒 Base Admin:</span>
                                                                <span className="font-bold text-red-800">{fmt(p.precio, p.moneda)}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between mb-2">
                                                            <span className="text-xs text-gray-700 font-semibold">Precio Final:</span>
                                                            <span className="text-sm sm:text-base font-bold text-emerald-700">{fmt(p.precioFinal, p.moneda)}</span>
                                                        </div>
                                                        <hr className="border-emerald-300 mb-2" />
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-xs font-bold text-gray-900">Stock:</span>
                                                            <span className={`text-sm font-bold ${p.stock > 5 ? 'text-emerald-700' : p.stock > 0 ? 'text-amber-700' : 'text-red-700'}`}>
                                                                {p.stock}
                                                            </span>
                                                        </div>
                                                        {p.descuento > 0 && (
                                                            <span className="inline-block w-full text-center px-2 py-1 rounded-lg text-xs font-bold bg-red-600 text-white">
                                                                -{p.descuento}% OFF
                                                            </span>
                                                        )}
                                                    </div>

                                                    {vistaActual === 'admin' ? (
                                                        <button
                                                            onClick={() => seleccionarProductoAdmin(p)}
                                                            disabled={p.yaPersonalizado}
                                                            className={`w-full py-2.5 rounded-lg font-semibold transition shadow-md text-sm flex items-center justify-center gap-2 ${p.yaPersonalizado
                                                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                                                : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white'
                                                                }`}>
                                                            {p.yaPersonalizado ? (
                                                                <>✅ Ya Personalizado</>
                                                            ) : (
                                                                <><Edit2 size={16} /> Personalizar Producto</>
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <button
                                                                onClick={() => verDetalle(p)}
                                                                className="py-2 bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white rounded-lg font-semibold transition shadow-md text-xs flex items-center justify-center"
                                                            >
                                                                👁️
                                                            </button>
                                                            <button
                                                                onClick={() => editarMiProducto(p)}
                                                                className="py-2 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white rounded-lg font-semibold transition shadow-md text-xs flex items-center justify-center"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => eliminarProducto(productoId)}
                                                                disabled={loading}
                                                                className="py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold transition shadow-md text-xs flex items-center justify-center disabled:opacity-50"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {showModal && productoDetalle && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10 rounded-t-3xl">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Detalle del Producto</h2>
                            <button onClick={() => setShowModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center text-3xl transition">×</button>
                        </div>

                        <div className="p-4 sm:p-6">
                            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    {productoDetalle.imagenUrl ? (
                                        <img src={productoDetalle.imagenUrl} alt={productoDetalle.nombre} className="w-full rounded-2xl shadow-xl border-2 border-gray-200" />
                                    ) : (
                                        <div className="w-full h-60 sm:h-80 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl shadow-xl border-2 border-gray-200 flex items-center justify-center">
                                            <Package size={80} className="text-emerald-300" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="bg-gray-800 text-white px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm">{productoDetalle.codigo}</span>
                                        <span className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm capitalize">{productoDetalle.categoria}</span>
                                        {productoDetalle.destacado && (
                                            <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1">
                                                <Star size={14} fill="currentColor" /> Destacado
                                            </span>
                                        )}
                                    </div>

                                    <div className="border-b-2 border-gray-200 pb-2 sm:pb-3">
                                        <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">Nombre</p>
                                        <p className="text-base sm:text-xl md:text-2xl font-bold text-gray-900">{productoDetalle.nombre}</p>
                                    </div>

                                    <div className="border-b-2 border-gray-200 pb-2 sm:pb-3">
                                        <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">Marca</p>
                                        <p className="text-sm sm:text-lg md:text-xl font-semibold text-emerald-700">{productoDetalle.marca}</p>
                                    </div>

                                    <div className="border-b-2 border-gray-200 pb-2 sm:pb-3">
                                        <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">Descripción</p>
                                        <p className="text-gray-900 leading-relaxed text-xs sm:text-sm">{productoDetalle.descripcion}</p>
                                    </div>

                                    <div className="border-b-2 border-gray-200 pb-2 sm:pb-3">
                                        <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">Stock Disponible</p>
                                        <p className={`text-lg sm:text-xl font-bold ${productoDetalle.stock > 5 ? 'text-emerald-700' : productoDetalle.stock > 0 ? 'text-amber-700' : 'text-red-700'}`}>
                                            {productoDetalle.stock} {productoDetalle.stock === 1 ? 'unidad' : 'unidades'}
                                        </p>
                                    </div>

                                    <div className="border-b-2 border-gray-200 pb-2 sm:pb-3">
                                        <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1 flex items-center gap-2">
                                            <Phone size={14} className="text-emerald-600" />
                                            WhatsApp
                                        </p>
                                        <p className="text-sm sm:text-base md:text-lg font-semibold text-emerald-700">{productoDetalle.whatsapp}</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-400 p-3 sm:p-4 md:p-5 rounded-2xl">
                                        {productoDetalle.precioAdminFijo && (
                                            <div className="flex justify-between items-center mb-2 sm:mb-3 bg-red-100 p-2 rounded-lg border border-red-300">
                                                <span className="text-red-800 font-semibold text-xs sm:text-sm">🔒 Precio Base Admin:</span>
                                                <span className="text-sm sm:text-base md:text-lg font-bold text-red-700">{fmt(productoDetalle.precioAdminFijo, productoDetalle.moneda)}</span>
                                            </div>
                                        )}
                                        {productoDetalle.descuento > 0 && (
                                            <div className="flex justify-between items-center mb-2 sm:mb-3">
                                                <span className="text-orange-700 font-semibold text-xs sm:text-sm">Descuento ({productoDetalle.descuento}%):</span>
                                                <span className="text-sm sm:text-base font-bold text-orange-600">-{fmt((productoDetalle.precioAdminFijo || productoDetalle.precio) * productoDetalle.descuento / 100, productoDetalle.moneda)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center mb-2 sm:mb-3">
                                            <span className="text-sm sm:text-lg md:text-xl font-bold text-gray-900">Precio Final:</span>
                                            <span className="text-lg sm:text-2xl md:text-3xl font-bold text-emerald-700">{fmt(productoDetalle.precioFinal, productoDetalle.moneda)}</span>
                                        </div>
                                    </div>

                                    <a
                                        href={`https://wa.me/${productoDetalle.whatsapp.replace(/\D/g, '')}?text=Hola! Me interesa el producto: ${productoDetalle.nombre}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-xl font-bold transition shadow-lg text-sm flex items-center justify-center gap-2"
                                    >
                                        <Phone size={18} /> Contactar por WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
