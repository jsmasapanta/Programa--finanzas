import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Plus, TrendingDown, Pencil, Trash2 } from 'lucide-react'
import { gastosService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { formatMoney, formatDate, formatDateInput, getErrorMessage, CATEGORIAS_GASTO } from '../utils/helpers'
import PageHeader from '../components/layout/PageHeader'
import { Button, Modal, EmptyState, ConfirmDialog, Badge } from '../components/ui'
import DataTable from '../components/ui/DataTable'

function GastoForm({ initial, onSave, onClose, currency }) {
  const [form, setForm] = useState(initial || { categoria: '', subcategoria: '', monto: '', descripcion: '', fecha: formatDateInput(new Date()), esRecurrente: false })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try { await onSave(form) } finally { setLoading(false) }
  }

  const inp = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 14, color: 'var(--text-primary)', outline: 'none' }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Categoría *</label>
          <select value={form.categoria} onChange={e => set('categoria', e.target.value)} required style={{ ...inp, cursor: 'pointer' }}>
            <option value="" style={{ background: 'var(--bg-elevated)' }}>Seleccionar...</option>
            {CATEGORIAS_GASTO.map(c => <option key={c} value={c} style={{ background: 'var(--bg-elevated)' }}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Subcategoría</label>
          <input type="text" value={form.subcategoria} onChange={e => set('subcategoria', e.target.value)} placeholder="Ej: Restaurante" style={inp}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Monto ({currency}) *</label>
          <input type="number" step="0.01" min="0.01" value={form.monto} onChange={e => set('monto', e.target.value)} required placeholder="0.00" style={inp}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Fecha *</label>
          <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} required style={inp}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Descripción</label>
        <input type="text" value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Opcional" style={inp}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
        <input type="checkbox" checked={form.esRecurrente} onChange={e => set('esRecurrente', e.target.checked)}
          style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }} />
        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Gasto recurrente</span>
      </label>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
        <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" type="submit" loading={loading}>{initial ? 'Guardar cambios' : 'Crear gasto'}</Button>
      </div>
    </form>
  )
}

export default function Gastos() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [page, setPage] = useState(1)
  const [filtros, setFiltros] = useState({ categoria: '', esRecurrente: '' })
  const currency = user?.moneda || 'USD'

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const params = { page: p, limit: 20, ...Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== '')) }
      const res = await gastosService.getAll(params)
      setData(res.data.data)
      setPagination(res.data.pagination)
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setLoading(false) }
  }, [filtros])

  useEffect(() => { load(page) }, [page, load])

  const handleCreate = async (form) => {
    try { await gastosService.create(form); toast.success('Gasto creado'); setModal(null); load(page) }
    catch (e) { toast.error(getErrorMessage(e)) }
  }
  const handleEdit = async (form) => {
    try { await gastosService.update(modal.edit.id, form); toast.success('Gasto actualizado'); setModal(null); load(page) }
    catch (e) { toast.error(getErrorMessage(e)) }
  }
  const handleDelete = async () => {
    try { await gastosService.delete(deleting.id); toast.success('Gasto eliminado'); setDeleting(null); load(page) }
    catch (e) { toast.error(getErrorMessage(e)) }
  }

  const total = data.reduce((s, i) => s + Number(i.monto), 0)

  const columns = [
    { key: 'categoria', label: 'Categoría', render: r => <Badge color="red">{r.categoria}</Badge> },
    { key: 'subcategoria', label: 'Subcategoría', render: r => <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{r.subcategoria || '—'}</span> },
    { key: 'monto', label: 'Monto', align: 'right', render: r => <span style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatMoney(r.monto, currency)}</span> },
    { key: 'fecha', label: 'Fecha', render: r => formatDate(r.fecha) },
    { key: 'esRecurrente', label: 'Recurrente', render: r => r.esRecurrente ? <Badge color="amber">Sí</Badge> : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>No</span> },
    {
      key: 'actions', label: '', align: 'right', render: r => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" onClick={() => setModal({ edit: r })}><Pencil size={14} /></Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(r)} style={{ color: 'var(--red)' }}><Trash2 size={14} /></Button>
        </div>
      )
    },
  ]

  const inp = { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 13, color: 'var(--text-primary)', outline: 'none' }

  return (
    <div>
      <PageHeader title="Gastos" subtitle={`Total: ${formatMoney(total, currency)}`}
        action={<Button onClick={() => setModal('create')}><Plus size={16} /> Nuevo gasto</Button>} />

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select value={filtros.categoria} onChange={e => { setFiltros(p => ({ ...p, categoria: e.target.value })); setPage(1) }} style={{ ...inp, cursor: 'pointer' }}>
          <option value="" style={{ background: 'var(--bg-elevated)' }}>Todas las categorías</option>
          {CATEGORIAS_GASTO.map(c => <option key={c} value={c} style={{ background: 'var(--bg-elevated)' }}>{c}</option>)}
        </select>
        <select value={filtros.esRecurrente} onChange={e => { setFiltros(p => ({ ...p, esRecurrente: e.target.value })); setPage(1) }} style={{ ...inp, cursor: 'pointer' }}>
          <option value="" style={{ background: 'var(--bg-elevated)' }}>Todos</option>
          <option value="true" style={{ background: 'var(--bg-elevated)' }}>Recurrentes</option>
          <option value="false" style={{ background: 'var(--bg-elevated)' }}>No recurrentes</option>
        </select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {data.length === 0 && !loading
          ? <EmptyState icon={TrendingDown} title="Sin gastos registrados" description="Registra tus gastos para llevar un mejor control de tu dinero." action={<Button onClick={() => setModal('create')}><Plus size={16} /> Registrar gasto</Button>} />
          : <DataTable columns={columns} data={data} loading={loading} />
        }
      </motion.div>

      {pagination?.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <Button variant="secondary" size="sm" disabled={!pagination.hasPrev} onClick={() => setPage(p => p - 1)}>← Anterior</Button>
          <span style={{ padding: '6px 12px', fontSize: 13, color: 'var(--text-muted)' }}>Página {pagination.page} de {pagination.totalPages}</span>
          <Button variant="secondary" size="sm" disabled={!pagination.hasNext} onClick={() => setPage(p => p + 1)}>Siguiente →</Button>
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.edit ? 'Editar gasto' : 'Nuevo gasto'}>
        <GastoForm initial={modal?.edit ? { ...modal.edit, fecha: formatDateInput(modal.edit.fecha) } : null}
          onSave={modal?.edit ? handleEdit : handleCreate} onClose={() => setModal(null)} currency={currency} />
      </Modal>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete}
        title="Eliminar gasto" description={`¿Eliminar este gasto de ${deleting ? formatMoney(deleting.monto, currency) : ''}?`} />
    </div>
  )
}
