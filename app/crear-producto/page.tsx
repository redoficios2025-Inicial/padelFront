"use client";
import { useState, useEffect, useRef } from 'react';
import { Edit2, Trash2, Plus, X, Save, Search, Filter, Star, Package, DollarSign, Tag } from 'lucide-react';

const API_URL = 'https://padel-back-kohl.vercel.app/api/productos';

interface ProductoForm {
    _id?: string;
    stock: string;
    codigo: string;
    nombre: string;
    marca: string;
    descripcion: string;
    precio: string;
    precioFinal: number;
    moneda: 'ARS' | 'USD';
    descuento: string;
    imagen: string;
    imagenUrl: string;
    categoria: 'pelota' | 'ropa' | 'accesorio';
    destacado: boolean;
    whatsapp: string;
    recargoTransporte: string;
    recargoMargen: string;
    recargoOtros: string;
}

interface Producto {
    _id: string;
    stock: number;
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
    codigo: '', nombre: '', marca: '', descripcion: '', precio: '', precioFinal: 0, stock: '0',
    moneda: 'ARS', descuento: '0', imagen: '', imagenUrl: '', categoria: 'pelota',
    destacado: false, whatsapp: '', recargoTransporte: '0', recargoMargen: '0', recargoOtros: '0',
};

export default function AdminProductos() {
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [login, setLogin] = useState<Login>({ id: '', email: '', password: '' });
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [form, setForm] = useState<ProductoForm>(initialForm);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [preview, setPreview] = useState<string>('');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);
    const [filtros, setFiltros] = useState<Filtros>({ buscar: '', categoria: 'todos' });
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (sessionStorage.getItem('isAuthenticated') === 'true') setIsAuth(true);
    }, []);

    useEffect(() => {
        if (isAuth) cargar();
    }, [isAuth]);

    useEffect(() => {
        if (isAuth) calcular();
    }, [form.precio, form.descuento, form.recargoTransporte, form.recargoMargen, form.recargoOtros, isAuth]);

    const handleLogin = () => {
        setLoading(true);
        setError('');
        if (login.id === '123456' && login.email === 'test@gmail.com' && login.password === '123456') {
            sessionStorage.setItem('isAuthenticated', 'true');
            sessionStorage.setItem('authToken', 'TEST_TOKEN_2024');
            setTimeout(() => { setLoading(false); setIsAuth(true); }, 500);
        } else {
            setLoading(false);
            setError('Credenciales incorrectas');
        }
    };

    const logout = () => {
        sessionStorage.clear();
        setIsAuth(false);
        setProductos([]);
        reset();
    };

    const cargar = async () => {
        try {
            const res = await fetch(API_URL, {
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('authToken')}` }
            });
            const data = await res.json();
            if (data.success) setProductos(data.data);
        } catch (e) {
            console.error(e);
        }
    };

    const calcular = () => {
        const precioBase = parseFloat(form.precio) || 0;
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(API_URL, {
                method: editMode ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('authToken')}` },
                body: JSON.stringify({
                    ...form,
                    id: editMode ? form._id : undefined,
                    precio: parseFloat(form.precio),
                    descuento: parseFloat(form.descuento),
                    recargoTransporte: parseFloat(form.recargoTransporte),
                    stock: parseInt(form.stock),
                    recargoMargen: parseFloat(form.recargoMargen),
                    recargoOtros: parseFloat(form.recargoOtros),
                }),
            });
            const data = await res.json();
            if (data.success) {
                alert(editMode ? '✅ Producto actualizado!' : '✅ Producto creado!');
                reset();
                await cargar();
            } else alert('❌ Error: ' + data.message);
        } catch (err) {
            alert('❌ Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const editar = (p: Producto) => {
        setForm({
            _id: p._id, codigo: p.codigo, nombre: p.nombre, marca: p.marca, descripcion: p.descripcion, stock: p.stock.toString(),
            precio: p.precio.toString(), precioFinal: p.precioFinal, moneda: p.moneda,
            descuento: p.descuento.toString(), imagen: '', imagenUrl: p.imagenUrl, categoria: p.categoria,
            destacado: p.destacado, whatsapp: p.whatsapp, recargoTransporte: p.recargos.transporte.toString(),
            recargoMargen: p.recargos.margen.toString(), recargoOtros: p.recargos.otros.toString(),
        });
        setPreview(p.imagenUrl);
        setEditMode(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const eliminar = async (id: string) => {
        if (!confirm('⚠️ ¿Estás seguro de eliminar este producto?')) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('authToken')}` }
            });
            const data = await res.json();
            if (data.success) {
                alert('✅ Producto eliminado!');
                await cargar();
            } else {
                alert('❌ Error: ' + data.message);
            }
        } catch (err) {
            alert('❌ Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const verDetalle = (p: Producto) => {
        setProductoDetalle(p);
        setShowModal(true);
    };

    const reset = () => {
        setForm(initialForm);
        setPreview('');
        setEditMode(false);
        if (fileRef.current) fileRef.current.value = '';
    };

    const fmt = (p: number, m: 'ARS' | 'USD') =>
        m === 'ARS' ? `$${p.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `USD $${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const productosFiltrados = productos.filter(p => {
        const matchBuscar = p.nombre.toLowerCase().includes(filtros.buscar.toLowerCase()) ||
            p.marca.toLowerCase().includes(filtros.buscar.toLowerCase()) ||
            p.codigo.toLowerCase().includes(filtros.buscar.toLowerCase());
        const matchCategoria = filtros.categoria === 'todos' || p.categoria === filtros.categoria;
        return matchBuscar && matchCategoria;
    });

    if (!isAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
                            <Package size={40} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Admin Productos</h1>
                        <p className="text-gray-600">Ingresa tus credenciales</p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">ID</label>
                            <input 
                                type="text" 
                                value={login.id} 
                                onChange={e => setLogin(p => ({ ...p, id: e.target.value }))} 
                                required 
                                placeholder="123456" 
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none transition text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">Email</label>
                            <input 
                                type="email" 
                                value={login.email} 
                                onChange={e => setLogin(p => ({ ...p, email: e.target.value }))} 
                                required 
                                placeholder="test@gmail.com" 
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none transition text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">Contraseña</label>
                            <input 
                                type="password" 
                                value={login.password} 
                                onChange={e => setLogin(p => ({ ...p, password: e.target.value }))} 
                                required 
                                placeholder="••••••" 
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none transition text-gray-900"
                            />
                        </div>
                        {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
                        <button onClick={handleLogin} disabled={loading} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50 hover:shadow-lg transition transform hover:scale-105">
                            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                        </button>
                    </div>
                    <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl text-xs border border-indigo-100">
                        <p className="font-semibold mb-2 text-indigo-900">Credenciales de prueba:</p>
                        <p className="text-gray-700">ID: <strong>123456</strong> | Email: <strong>test@gmail.com</strong> | Pass: <strong>123456</strong></p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl p-4 mb-4 sm:mb-6 shadow-lg border border-gray-100">
                    <div className="flex flex-col gap-3">
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {editMode ? '✏️ Editar' : '➕ Crear'} Producto
                            </h1>
                            <p className="text-gray-600 mt-1 text-xs sm:text-sm">Total de productos: <strong className="text-indigo-600">{productos.length}</strong></p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button 
                                onClick={logout} 
                                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm rounded-xl font-semibold transition shadow-md"
                            >
                                Cerrar Sesión
                            </button>
                            <a href="/dashboard" className="w-full sm:w-auto">
                                <button className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-sm rounded-xl font-semibold transition shadow-md">
                                    Dashboard
                                </button>
                            </a>
                        </div>
                    </div>
                </div>

                <form className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-8 shadow-lg border border-gray-100" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                            <label className="block mb-2 font-semibold text-xs sm:text-sm flex items-center gap-2 text-gray-700">
                                <Tag size={16} className="text-indigo-600" />
                                Código *
                            </label>
                            <input 
                                type="text" 
                                name="codigo" 
                                value={form.codigo} 
                                onChange={handleChange} 
                                required 
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-indigo-500 transition text-sm text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-xs sm:text-sm flex items-center gap-2 text-gray-700">
                                <Package size={16} className="text-indigo-600" />
                                Nombre *
                            </label>
                            <input 
                                type="text" 
                                name="nombre" 
                                value={form.nombre} 
                                onChange={handleChange} 
                                required 
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-indigo-500 transition text-sm text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-xs sm:text-sm text-gray-700">Marca *</label>
                            <input 
                                type="text" 
                                name="marca" 
                                value={form.marca} 
                                onChange={handleChange} 
                                required 
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-indigo-500 transition text-sm text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-xs sm:text-sm flex items-center gap-2 text-gray-700">
                                <Package size={16} className="text-indigo-600" />
                                Stock/Cantidad *
                            </label>
                            <input 
                                type="number" 
                                name="stock" 
                                value={form.stock} 
                                onChange={handleChange} 
                                required 
                                min="0" 
                                step="1" 
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-indigo-500 transition text-sm text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-xs sm:text-sm text-gray-700">Categoría *</label>
                            <select 
                                name="categoria" 
                                value={form.categoria} 
                                onChange={handleChange} 
                                required 
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-indigo-500 transition text-sm text-gray-900"
                            >
                                <option value="pelota">⚽ Pelota</option>
                                <option value="ropa">👕 Ropa</option>
                                <option value="accesorio">🎒 Accesorio</option>
                            </select>
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-xs sm:text-sm flex items-center gap-2 text-gray-700">
                                <DollarSign size={16} className="text-emerald-600" />
                                Precio Base *
                            </label>
                            <input 
                                type="number" 
                                name="precio" 
                                value={form.precio} 
                                onChange={handleChange} 
                                required 
                                step="0.01" 
                                min="0" 
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-indigo-500 transition text-sm text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-xs sm:text-sm text-gray-700">Moneda *</label>
                            <select 
                                name="moneda" 
                                value={form.moneda} 
                                onChange={handleChange} 
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-indigo-500 transition text-sm text-gray-900"
                            >
                                <option value="ARS">🇦🇷 ARS (Pesos)</option>
                                <option value="USD">🇺🇸 USD (Dólares)</option>
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
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-indigo-500 transition text-sm text-gray-900"
                            />
                            <p className="text-xs text-gray-500 mt-1">Se aplica primero</p>
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-xs sm:text-sm text-gray-700">WhatsApp *</label>
                            <input 
                                type="text" 
                                name="whatsapp" 
                                value={form.whatsapp} 
                                onChange={handleChange} 
                                required 
                                placeholder="+54 XXX XX XXXX" 
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-indigo-500 transition text-sm text-gray-900"
                            />
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
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-indigo-500 transition text-sm text-gray-900"
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
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-indigo-500 transition text-sm text-gray-900"
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
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-indigo-500 transition text-sm text-gray-900"
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
                            <label className="block mb-2 font-semibold text-xs sm:text-sm text-gray-700">Descripción *</label>
                            <textarea 
                                name="descripcion" 
                                value={form.descripcion} 
                                onChange={handleChange} 
                                required 
                                rows={4} 
                                placeholder="Describe el producto detalladamente..." 
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-indigo-500 resize-y transition text-sm text-gray-900"
                            />
                        </div>

                        <div className="md:col-span-2 lg:col-span-3">
                            <label className="block mb-2 font-semibold text-xs sm:text-sm text-gray-700">Imagen (Opcional)</label>
                            <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} className="hidden" />
                            <button type="button" onClick={() => fileRef.current?.click()} className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition shadow-md text-sm">
                                📷 Seleccionar Imagen
                            </button>
                            <p className="text-xs text-gray-500 mt-2">Máximo 5MB. Puedes guardar sin imagen.</p>
                            {preview && (
                                <div className="mt-4 border-2 border-indigo-200 rounded-xl p-3 inline-block bg-gradient-to-br from-indigo-50 to-purple-50">
                                    <img src={preview} alt="Preview" className="max-w-full md:max-w-xs max-h-60 rounded-lg shadow-lg" />
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4 sm:p-6 rounded-2xl border-2 border-emerald-200">
                            <h3 className="text-sm font-bold text-gray-800 mb-4 text-center">📊 Cálculo de Precio</h3>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-white/70 p-3 rounded-lg">
                                    <span className="text-sm font-semibold text-gray-700">1️⃣ Precio Base:</span>
                                    <span className="text-lg font-bold text-gray-800">{fmt(parseFloat(form.precio) || 0, form.moneda)}</span>
                                </div>

                                {parseFloat(form.descuento) > 0 && (
                                    <>
                                        <div className="flex justify-between items-center bg-red-50 p-3 rounded-lg border border-red-200">
                                            <span className="text-sm font-semibold text-red-700">2️⃣ Descuento ({form.descuento}%):</span>
                                            <span className="text-lg font-bold text-red-600">-{fmt((parseFloat(form.precio) || 0) * (parseFloat(form.descuento) || 0) / 100, form.moneda)}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-orange-50 p-3 rounded-lg border border-orange-200">
                                            <span className="text-sm font-semibold text-orange-700">Precio con Descuento:</span>
                                            <span className="text-lg font-bold text-orange-600">{fmt((parseFloat(form.precio) || 0) * (1 - (parseFloat(form.descuento) || 0) / 100), form.moneda)}</span>
                                        </div>
                                    </>
                                )}

                                {(parseFloat(form.recargoTransporte) > 0 || parseFloat(form.recargoMargen) > 0 || parseFloat(form.recargoOtros) > 0) && (
                                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                                        <p className="text-sm font-bold text-amber-800 mb-2">3️⃣ Recargos (sobre precio {parseFloat(form.descuento) > 0 ? 'con descuento' : 'base'}):</p>
                                        <div className="space-y-1.5">
                                            {parseFloat(form.recargoTransporte) > 0 && (
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-amber-700">Transporte: {form.recargoTransporte}%</span>
                                                    <span className="font-bold text-amber-800">+{fmt(((parseFloat(form.precio) || 0) * (1 - (parseFloat(form.descuento) || 0) / 100)) * (parseFloat(form.recargoTransporte) || 0) / 100, form.moneda)}</span>
                                                </div>
                                            )}
                                            {parseFloat(form.recargoMargen) > 0 && (
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-amber-700">Margen: {form.recargoMargen}%</span>
                                                    <span className="font-bold text-amber-800">+{fmt(((parseFloat(form.precio) || 0) * (1 - (parseFloat(form.descuento) || 0) / 100)) * (parseFloat(form.recargoMargen) || 0) / 100, form.moneda)}</span>
                                                </div>
                                            )}
                                            {parseFloat(form.recargoOtros) > 0 && (
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-amber-700">Otros: {form.recargoOtros}%</span>
                                                    <span className="font-bold text-amber-800">+{fmt(((parseFloat(form.precio) || 0) * (1 - (parseFloat(form.descuento) || 0) / 100)) * (parseFloat(form.recargoOtros) || 0) / 100, form.moneda)}</span>
                                                </div>
                                            )}
                                            <div className="border-t border-amber-300 pt-2 mt-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-bold text-amber-900">Total Recargos:</span>
                                                    <span className="font-bold text-amber-900">{(parseFloat(form.recargoTransporte) || 0) + (parseFloat(form.recargoMargen) || 0) + (parseFloat(form.recargoOtros) || 0)}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-center bg-gradient-to-r from-emerald-100 to-green-100 p-4 rounded-lg border-2 border-emerald-400 shadow-md">
                                    <span className="text-base font-bold text-emerald-900">💰 PRECIO FINAL:</span>
                                    <span className="text-2xl font-bold text-emerald-700">{fmt(form.precioFinal, form.moneda)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-bold text-sm sm:text-base disabled:opacity-50 transition shadow-lg flex items-center justify-center gap-2">
                            {loading ? '⏳ Guardando...' : editMode ? <><Save size={20} /> Actualizar</> : <><Plus size={20} /> Crear Producto</>}
                        </button>
                        {editMode && (
                            <button type="button" onClick={reset} className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800 text-white rounded-xl font-bold text-sm sm:text-base transition shadow-lg flex items-center justify-center gap-2">
                                <X size={20} /> Cancelar
                            </button>
                        )}
                    </div>
                </form>

                <div className="bg-white rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg border border-gray-100">
                    <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2 text-gray-700">
                                <Search size={16} className="text-indigo-600" />
                                Buscar
                            </label>
                            <input
                                type="text"
                                placeholder="Nombre, marca o código..."
                                value={filtros.buscar}
                                onChange={(e) => setFiltros({ ...filtros, buscar: e.target.value })}
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-indigo-500 transition text-sm text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2 text-gray-700">
                                <Filter size={16} className="text-indigo-600" />
                                Categoría
                            </label>
                            <select
                                value={filtros.categoria}
                                onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-indigo-500 transition text-sm text-gray-900"
                            >
                                <option value="todos">Todas las categorías</option>
                                <option value="pelota">⚽ Pelotas</option>
                                <option value="ropa">👕 Ropa</option>
                                <option value="accesorio">🎒 Accesorios</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-100">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        <Package className="text-indigo-600" />
                        Productos ({productosFiltrados.length})
                    </h2>

                    {loading && productos.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                            <p className="mt-4 text-gray-600">Cargando productos...</p>
                        </div>
                    ) : productosFiltrados.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">No hay productos para mostrar</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                            {productosFiltrados.map(p => (
                                <div key={p._id} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-indigo-300 transition-all duration-300">
                                    {p.imagenUrl ? (
                                        <div className="relative h-40 sm:h-48 bg-gray-100">
                                            <img src={p.imagenUrl} alt={p.nombre} className="w-full h-full object-cover" />
                                            {p.destacado && (
                                                <span className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                                    <Star size={10} fill="currentColor" /> Destacado
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="relative h-40 sm:h-48 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                                            <Package size={40} className="text-indigo-300" />
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
                                            <span className="bg-indigo-600 text-white px-2 py-1 rounded-lg text-xs font-bold capitalize">{p.categoria}</span>
                                        </div>

                                        <h3 className="text-sm sm:text-base font-bold mb-1 truncate text-gray-900">{p.nombre}</h3>
                                        <p className="text-xs sm:text-sm font-semibold text-indigo-700 mb-2">{p.marca}</p>
                                        <p className="text-xs text-gray-700 mb-3 line-clamp-2">{p.descripcion}</p>

                                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300 p-2.5 sm:p-3 rounded-xl mb-3">
                                            <div className="flex justify-between mb-1.5 text-xs">
                                                <span className="text-gray-700 font-semibold">Base:</span>
                                                <span className="font-bold text-gray-900">{fmt(Number(p.precio), p.moneda)}</span>
                                            </div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-xs text-gray-700 font-semibold">Final:</span>
                                                <span className="text-sm sm:text-base font-bold text-emerald-700">{fmt(p.precioFinal, p.moneda)}</span>
                                            </div>
                                            <hr className="border-emerald-300 mb-2" />
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-gray-900">Stock:</span>
                                                <span className={`text-sm font-bold ${p.stock > 5 ? 'text-emerald-700' : p.stock > 0 ? 'text-amber-700' : 'text-red-700'}`}>
                                                    {p.stock}
                                                </span>
                                            </div>
                                            <small>ℹ️ Los descuentos solo se ven reflejados al usuario final</small>
                                            <span className={`inline-block w-full text-center px-2 py-1 rounded-lg text-xs font-bold ${p.descuento && Number(p.descuento) > 0 ? 'bg-red-600 text-white' : 'bg-gray-700 text-white'}`}>
                                                {p.descuento && Number(p.descuento) > 0 ? `-${p.descuento}% OFF` : 'Sin descuento'}
                                            </span>
                                        </div>

                                        <div className="bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-400 p-2 rounded-xl mb-3">
                                            <p className="font-bold mb-1.5 text-xs text-gray-900">Recargos:</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                <span className="bg-amber-600 text-white px-2 py-1 rounded-lg font-bold text-xs">
                                                    T: {p.recargos?.transporte ?? 0}%
                                                </span>
                                                <span className="bg-amber-600 text-white px-2 py-1 rounded-lg font-bold text-xs">
                                                    M: {p.recargos?.margen ?? 0}%
                                                </span>
                                                <span className="bg-amber-600 text-white px-2 py-1 rounded-lg font-bold text-xs">
                                                    O: {p.recargos?.otros ?? 0}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                                            <button 
                                                onClick={() => verDetalle(p)} 
                                                className="py-2 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-lg font-semibold transition shadow-md text-xs flex items-center justify-center"
                                            >
                                                👁️
                                            </button>
                                            <button 
                                                onClick={() => editar(p)} 
                                                className="py-2 bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white rounded-lg font-semibold transition shadow-md text-xs flex items-center justify-center"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                            <button 
                                                onClick={() => eliminar(p._id)} 
                                                disabled={loading} 
                                                className="py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-lg font-semibold transition shadow-md text-xs flex items-center justify-center disabled:opacity-50"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showModal && productoDetalle && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10 rounded-t-3xl">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Detalle del Producto</h2>
                            <button onClick={() => setShowModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center text-3xl transition">×</button>
                        </div>

                        <div className="p-4 sm:p-6">
                            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    {productoDetalle.imagenUrl ? (
                                        <img src={productoDetalle.imagenUrl} alt={productoDetalle.nombre} className="w-full rounded-2xl shadow-xl border-2 border-gray-200" />
                                    ) : (
                                        <div className="w-full h-60 sm:h-80 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl shadow-xl border-2 border-gray-200 flex items-center justify-center">
                                            <Package size={80} className="text-indigo-300" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="bg-gray-800 text-white px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm">{productoDetalle.codigo}</span>
                                        <span className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm capitalize">{productoDetalle.categoria}</span>
                                        {productoDetalle.destacado && (
                                            <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1">
                                                <Star size={14} fill="currentColor" />
                                                Destacado
                                            </span>
                                        )}
                                    </div>

                                    <div className="border-b-2 border-gray-200 pb-2 sm:pb-3">
                                        <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">Nombre</p>
                                        <p className="text-base sm:text-xl md:text-2xl font-bold text-gray-900">{productoDetalle.nombre}</p>
                                    </div>

                                    <div className="border-b-2 border-gray-200 pb-2 sm:pb-3">
                                        <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">Marca</p>
                                        <p className="text-sm sm:text-lg md:text-xl font-semibold text-indigo-700">{productoDetalle.marca}</p>
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
                                        <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">WhatsApp</p>
                                        <p className="text-sm sm:text-base md:text-lg font-semibold text-emerald-700">{productoDetalle.whatsapp}</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-400 p-3 sm:p-4 md:p-5 rounded-2xl">
                                        <div className="flex justify-between items-center mb-2 sm:mb-3">
                                            <span className="text-gray-800 font-semibold text-xs sm:text-sm">Precio Base:</span>
                                            <span className="text-sm sm:text-base md:text-lg font-bold text-gray-600">{fmt(Number(productoDetalle.precio), productoDetalle.moneda)}</span>
                                        </div>
                                        {Number(productoDetalle.descuento) > 0 && (
                                            <div className="flex justify-between items-center mb-2 sm:mb-3">
                                                <span className="text-red-700 font-semibold text-xs sm:text-sm">Descuento ({productoDetalle.descuento}%):</span>
                                                <span className="text-sm sm:text-base font-bold text-red-600">-{fmt(Number(productoDetalle.precio) * Number(productoDetalle.descuento) / 100, productoDetalle.moneda)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center mb-2 sm:mb-3">
                                            <span className="text-sm sm:text-lg md:text-xl font-bold text-gray-900">Precio Final:</span>
                                            <span className="text-lg sm:text-2xl md:text-3xl font-bold text-emerald-700">{fmt(productoDetalle.precioFinal, productoDetalle.moneda)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs sm:text-sm">
                                            <span className="text-gray-700">Moneda:</span>
                                            <span className="font-bold text-gray-900">{productoDetalle.moneda}</span>
                                        </div>
                                    </div>

                                    {(productoDetalle.recargos.transporte > 0 || productoDetalle.recargos.margen > 0 || productoDetalle.recargos.otros > 0) && (
                                        <div className="bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-400 p-3 sm:p-4 rounded-2xl">
                                            <p className="font-bold mb-2 sm:mb-3 text-xs sm:text-sm text-gray-900">Recargos Aplicados:</p>
                                            <div className="space-y-2">
                                                {productoDetalle.recargos.transporte > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-xs sm:text-sm text-gray-800">Transporte:</span>
                                                        <span className="bg-amber-600 text-white px-2 sm:px-3 py-1 rounded-lg font-bold text-xs sm:text-sm">{productoDetalle.recargos.transporte}%</span>
                                                    </div>
                                                )}
                                                {productoDetalle.recargos.margen > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-xs sm:text-sm text-gray-800">Margen:</span>
                                                        <span className="bg-amber-600 text-white px-2 sm:px-3 py-1 rounded-lg font-bold text-xs sm:text-sm">{productoDetalle.recargos.margen}%</span>
                                                    </div>
                                                )}
                                                {productoDetalle.recargos.otros > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-xs sm:text-sm text-gray-800">Otros:</span>
                                                        <span className="bg-amber-600 text-white px-2 sm:px-3 py-1 rounded-lg font-bold text-xs sm:text-sm">{productoDetalle.recargos.otros}%</span>
                                                    </div>
                                                )}
                                                <div className="border-t-2 border-amber-300 pt-2 mt-2">
                                                    <div className="flex justify-between">
                                                        <span className="font-bold text-xs sm:text-sm text-gray-900">Total Recargos:</span>
                                                        <span className="bg-amber-700 text-white px-2 sm:px-3 py-1 rounded-lg font-bold text-xs sm:text-sm shadow">
                                                            {productoDetalle.recargos.transporte + productoDetalle.recargos.margen + productoDetalle.recargos.otros}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-gray-100 border border-gray-300 p-2.5 sm:p-3 md:p-4 rounded-xl text-xs text-gray-700">
                                        <p className="mb-1"><strong className="text-gray-900">Creado:</strong> {new Date(productoDetalle.createdAt).toLocaleString('es-AR')}</p>
                                        <p><strong className="text-gray-900">Última actualización:</strong> {new Date(productoDetalle.updatedAt).toLocaleString('es-AR')}</p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                                        <button 
                                            onClick={() => { editar(productoDetalle); setShowModal(false); }} 
                                            className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white rounded-xl font-bold transition shadow-lg text-sm flex items-center justify-center gap-2"
                                        >
                                            <Edit2 size={16} /> Editar
                                        </button>
                                        <button 
                                            onClick={() => { eliminar(productoDetalle._id); setShowModal(false); }} 
                                            className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-xl font-bold transition shadow-lg text-sm flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={16} /> Eliminar
                                        </button>
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
