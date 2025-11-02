"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Download, Package, Search, ChevronLeft, ChevronRight, Filter, RefreshCw, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://padel-back-kohl.vercel.app/api';

interface ProductoBackend {
  _id: string;
  codigo: string;
  nombre: string;
  marca: string;
  descripcion: string;
  precio: number;
  precioFinal?: number;
  stock?: number;
  categoria: string;
  recargos?: {
    transporte?: number;
    margen?: number;
    otros?: number;
  };
  moneda?: 'ARS' | 'USD';
}

interface ProductoTransformado {
  id: string;
  nombre: string;
  categoria: string;
  cantidad: number;
  precio: string;
  estado: 'Disponible' | 'Bajo Stock' | 'Agotado';
  proveedor: string;
  porcentajeRecargo: string;
  precioConRecargo: string;
  _id: string;
  moneda?: 'ARS' | 'USD';
}


const transformarProducto = (producto: ProductoBackend): ProductoTransformado => {
  const recargoTotal = (producto.recargos?.transporte || 0) +
    (producto.recargos?.margen || 0) +
    (producto.recargos?.otros || 0);

  const cantidad = producto.stock ?? 0;

  const determinarEstado = (cantidad: number): 'Disponible' | 'Bajo Stock' | 'Agotado' => {
    if (cantidad === 0) return 'Agotado';
    if (cantidad < 10) return 'Bajo Stock';
    return 'Disponible';
  };

  return {
    id: producto.codigo,
    nombre: producto.nombre,
    categoria: producto.categoria,
    cantidad,
    precio: producto.precio.toFixed(2),
    estado: determinarEstado(cantidad),
    proveedor: producto.marca,
    porcentajeRecargo: recargoTotal.toFixed(2),
    precioConRecargo: (producto.precioFinal ?? producto.precio).toFixed(2),
    _id: producto._id,
    moneda: 'ARS'
  };
};


const InventoryDashboard: React.FC = () => {
  const [productos, setProductos] = useState<ProductoTransformado[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('Todas');
  const itemsPerPage = 50;
  const [moneda, setMoneda] = useState<"ARS" | "USD">("ARS");


  const cargarProductos = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/productos`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: { success: boolean; data: ProductoBackend[] } = await response.json();

      if (data.success && Array.isArray(data.data)) {
        const productosTransformados = data.data.map(transformarProducto);
        setProductos(productosTransformados);
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const filteredProducts = useMemo<ProductoTransformado[]>(() => {
    return productos.filter(p => {
      const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = filterCategory === 'Todas' || p.categoria === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [productos, searchTerm, filterCategory]);

  const currentProducts = useMemo<ProductoTransformado[]>(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const downloadExcel = (): void => {
    const headers = ['ID', 'Nombre', 'Categoría', 'Cantidad', 'Precio Base', '% Recargo', 'Precio Final', 'Estado', 'Proveedor'];

    let htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #4f46e5; color: white; font-weight: bold; padding: 12px; border: 2px solid #3730a3; text-align: center; }
          td { padding: 10px; border: 1px solid #cbd5e1; text-align: center; }
          tr:nth-child(even) { background-color: #f1f5f9; }
          .disponible { background-color: #dcfce7; color: #166534; font-weight: bold; }
          .bajo-stock { background-color: #fef3c7; color: #92400e; font-weight: bold; }
          .agotado { background-color: #fee2e2; color: #991b1b; font-weight: bold; }
          .precio { color: #059669; font-weight: bold; }
          .precio-final { color: #7c3aed; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1 style="color: #4f46e5; text-align: center;">LISTA DE PRECIOS EUROPADEL</h1>
        <p style="text-align: center; color: #64748b;">Página ${currentPage}</p>
        <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;

    currentProducts.forEach(p => {
      const estadoClass: string = p.estado === 'Disponible' ? 'disponible' : p.estado === 'Bajo Stock' ? 'bajo-stock' : 'agotado';
      htmlContent += `<tr>
        <td><strong>${p.id}</strong></td>
        // <td style="text-align: left;">${p.nombre}</td>
        <td>${p.categoria}</td>
        <td><strong>${p.cantidad}</strong></td>
        <td class="precio">$${p.precio}</td>
        <td style="color: #2563eb; font-weight: bold;">${p.porcentajeRecargo}%</td>
        <td class="precio-final">$${p.precioConRecargo}</td>
        <td class="${estadoClass}">${p.estado}</td>
        <td>${p.proveedor}</td>
      </tr>`;
    });

    htmlContent += `</tbody></table><p style="margin-top: 20px; text-align: center; color: #64748b;">Generado: ${new Date().toLocaleDateString('es-AR')} - Total: ${currentProducts.length}</p></body></html>`;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lista_precios_europadel_pagina_${currentPage}.xls`;
    link.click();
  };

  const downloadWord = (): void => {
    let content = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
      <head><meta charset='utf-8'><title>Lista de Precios EUROPADEL</title>
        <style>
          @page { size: landscape; margin: 1.5cm 1cm; }
          body { font-family: Calibri, Arial, sans-serif; }
          h1 { color: #4f46e5; text-align: center; font-size: 20px; }
          table { border-collapse: collapse; width: 100%; font-size: 9px; }
          th { background-color: #4f46e5; color: white; padding: 8px 4px; border: 2px solid #3730a3; }
          td { padding: 6px 4px; border: 1px solid #cbd5e1; text-align: center; }
          tr:nth-child(even) { background-color: #f1f5f9; }
          .disponible { background-color: #dcfce7; color: #166534; font-weight: bold; }
          .bajo-stock { background-color: #fef3c7; color: #92400e; font-weight: bold; }
          .agotado { background-color: #fee2e2; color: #991b1b; font-weight: bold; }
        </style>
      </head>
      <body><h1>LISTA DE PRECIOS EUROPADEL</h1><p style="text-align: center; color: #64748b;">Página ${currentPage}</p>
        <table><tr><th>ID</th><th>Nombre</th><th>Categoría</th><th>Cant.</th><th>Precio Base</th><th>% Rec.</th><th>Precio Final</th><th>Estado</th><th>Proveedor</th></tr>`;

    currentProducts.forEach(p => {
      const estadoClass: string = p.estado === 'Disponible' ? 'disponible' : p.estado === 'Bajo Stock' ? 'bajo-stock' : 'agotado';
      content += `<tr><td><strong>${p.id}</strong></td><td>${p.nombre}</td><td>${p.categoria}</td><td><strong>${p.cantidad}</strong></td><td style="color: #059669; font-weight: bold;">${p.precio}</td><td style="color: #2563eb; font-weight: bold;">${p.porcentajeRecargo}%</td><td style="color: #7c3aed; font-weight: bold;">${p.precioConRecargo}</td><td class="${estadoClass}">${p.estado}</td><td>${p.proveedor}</td></tr>`;
    });

    content += `</table><p style="margin-top: 15px; text-align: center; color: #64748b; font-size: 9px;">Generado: ${new Date().toLocaleDateString('es-AR')} - Total: ${currentProducts.length}</p></body></html>`;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lista_precios_europadel_pagina_${currentPage}.doc`;
    link.click();
  };

  const downloadPDF = (): void => {
    const content = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      @page { size: landscape; margin: 1cm; }
      body { font-family: Arial, sans-serif; padding: 20px; }
      h1 { color: #4f46e5; text-align: center; font-size: 24px; }
      table { border-collapse: collapse; width: 100%; font-size: 11px; margin-top: 10px; }
      th { background-color: #4f46e5; color: white; padding: 10px 8px; border: 2px solid #3730a3; }
      td { padding: 8px; border: 1px solid #cbd5e1; text-align: center; }
      tr:nth-child(even) { background-color: #f1f5f9; }
      .disponible { background-color: #dcfce7; color: #166534; font-weight: bold; }
      .bajo-stock { background-color: #fef3c7; color: #92400e; font-weight: bold; }
      .agotado { background-color: #fee2e2; color: #991b1b; font-weight: bold; }
    </style></head><body>
      <h1>📦 LISTA DE PRECIOS EUROPADEL</h1><p style="text-align: center; color: #64748b;">Página ${currentPage}</p>
      <table><thead><tr><th>ID</th><th>Nombre</th><th>Categoría</th><th>Cantidad</th><th>Precio Base</th><th>% Recargo</th><th>Precio Final</th><th>Estado</th><th>Proveedor</th></tr></thead><tbody>
        ${currentProducts.map(p => {
      const estadoClass: string = p.estado === 'Disponible' ? 'disponible' : p.estado === 'Bajo Stock' ? 'bajo-stock' : 'agotado';
      return `<tr><td><strong>${p.id}</strong></td><td style="text-align: left;">${p.nombre}</td><td>${p.categoria}</td><td><strong>${p.cantidad}</strong></td><td style="color: #059669; font-weight: bold;">$${p.precio}</td><td style="color: #2563eb; font-weight: bold;">${p.porcentajeRecargo}%</td><td style="color: #7c3aed; font-weight: bold;">$${p.precioConRecargo}</td><td class="${estadoClass}">${p.estado}</td><td>${p.proveedor}</td></tr>`;
    }).join('')}
      </tbody></table>
      <div style="margin-top: 15px; text-align: center; color: #64748b; font-size: 10px;"><p>Generado: ${new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} | Total: ${currentProducts.length}</p></div>
    </body></html>`;

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => printWindow.print();
    }
  };

  const categories = useMemo(() => ['Todas', ...new Set(productos.map(p => p.categoria))], [productos]);




  // Estado para controlar la moneda

  const stats = useMemo(() => {
    let disponible = 0;
    let bajoStock = 0;
    let agotado = 0;

    productos.forEach((p) => {
      const cant = p.cantidad ?? 0;

      if (cant === 0) {
        agotado += 1; // cada producto agotado cuenta como 1
      } else if (cant < 10) {
        bajoStock += 1; // cada producto bajo stock cuenta como 1
        disponible += cant; // solo las unidades disponibles se suman
      } else {
        disponible += cant; // suma las unidades
      }
    });

    const totalValueNumber = productos.reduce(
      (acc, p) => acc + (Number(p.precioConRecargo ?? p.precio ?? 0) * (p.cantidad ?? 0)),
      0
    );

    const totalValue =
      moneda?.toUpperCase() === "USD"
        ? `${totalValueNumber.toLocaleString("en-US", { minimumFractionDigits: 2 })} Dólares`
        : `${totalValueNumber.toLocaleString("es-AR", { minimumFractionDigits: 2 })} Pesos`;

    return { disponible, bajoStock, agotado, totalValue };
  }, [productos, moneda]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">Dashboard de Inventario</h1>
              <p className="text-slate-600">Gestión completa de productos y stock</p>
            </div>
            <button onClick={cargarProductos} disabled={loading} className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              Recargar
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-600">Cargando productos desde el servidor...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle size={24} />
              <div>
                <h3 className="font-semibold">Error al cargar productos</h3>
                <p className="text-sm">{error}</p>
                <p className="text-xs mt-1 text-red-600">Verifica que el servidor esté corriendo en {API_URL}</p>
                <button onClick={cargarProductos} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && productos.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Disponibles</p>
                    <p className="text-3xl font-bold text-slate-800">{stats.disponible}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Package className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Bajo Stock</p>
                    <p className="text-3xl font-bold text-slate-800">{stats.bajoStock}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Package className="text-yellow-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Agotados</p>
                    <p className="text-3xl font-bold text-slate-800">{stats.agotado}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-lg">
                    <Package className="text-red-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
                <h3 className="text-3xl font-bold text-red-600 ">
                  Valor Total
                </h3>
                <p className="text-3xl font-bold text-slate-800">
                  {stats.totalValue}
                </p>


                <div className="flex items-center justify-between">

                  {/* Opcional: botones para cambiar moneda */}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setMoneda("ARS")}
                      className={`px-3 py-1 rounded ${moneda === "ARS" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}
                    >
                      Pesos
                    </button>
                    <button
                      onClick={() => setMoneda("USD")}
                      className={`px-3 py-1 rounded ${moneda === "USD" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}
                    >
                      Dólares
                    </button>
                  </div>

                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <Package className="text-indigo-600" size={24} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input type="text" placeholder="Buscar por nombre o código..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
                  </div>

                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }} className="pl-10 pr-8 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none bg-white">
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={downloadExcel} className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md">
                    <Download size={20} />Excel
                  </button>
                  <button onClick={downloadWord} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                    <Download size={20} />Word
                  </button>
                  <button onClick={downloadPDF} className="flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md">
                    <Download size={20} />PDF
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Código</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Nombre</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Categoría</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Stock</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Precio Base</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">% Recargo</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Precio Final</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Estado</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Marca</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {currentProducts.map((producto, idx) => (
                      <tr key={producto._id} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                        <td className="px-6 py-4 text-sm font-medium text-slate-800">{producto.id}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{producto.nombre}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{producto.categoria}</td>
                        <td className="px-6 py-4 text-sm text-slate-700 font-semibold">{producto.cantidad}</td>
                        <td className="px-6 py-4 text-sm text-green-600 font-semibold">${Number(producto.precio).toLocaleString('es-AR')}</td>
                        <td className="px-6 py-4 text-sm text-blue-600 font-bold">{producto.porcentajeRecargo}%</td>
                        <td className="px-6 py-4 text-sm text-purple-600 font-bold text-base">
                          ${((Number(producto.precioConRecargo) || 0) * (producto.cantidad || 0)).toLocaleString(moneda === "USD" ? "en-US" : "es-AR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${producto.estado === 'Disponible' ? 'bg-green-100 text-green-800' : producto.estado === 'Bajo Stock' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {producto.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{producto.proveedor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} de {filteredProducts.length} productos
                  </p>

                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft size={20} />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;

                      return (
                        <button key={i} onClick={() => setCurrentPage(pageNum)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === pageNum ? 'bg-indigo-600 text-white shadow-md' : 'border border-slate-300 hover:bg-white text-slate-700'}`}>
                          {pageNum}
                        </button>
                      );
                    })}

                    <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {!loading && !error && productos.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Package size={64} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No hay productos</h3>
            <p className="text-slate-600">Agrega productos desde el panel de administración</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryDashboard;