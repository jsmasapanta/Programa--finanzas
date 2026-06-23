import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Plus, TrendingUp, Pencil, Trash2 } from 'lucide-react'
import { ingresosService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { formatMoney, formatDate, formatDateInput, getErrorMessage } from '../utils/helpers'
import PageHeader from '../components/layout/PageHeader'
import { Button, Modal, EmptyState, ConfirmDialog, Badge } from '../components/ui'
import DataTable from '../components/ui/DataTable'

const TIPOS = ['Salario', 'Freelance', 'Negocio', 'Inversión', 'Renta', 'Bono', 'Otro']

function IngresoForm({ initial, onSave, onClose, currency }) {
  const [form, setForm] = useState(initial || { tipo: '', monto: '', descripcion: '', fecha: formatDateInput(new Date()) })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(form)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 14, color: 'var(--text-primary)', outline: 'none' }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Tipo *</label>
          <select value={form.tipo} onChange={e => set('tipo', e.target.value)} required style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="" style={{ background: 'var(--bg-elevated)' }}>Seleccionar...</option>
            {TIPOS.map(t => <option key={t} value={t} style={{ background: 'var(--bg-elevated)' }}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Monto ({currency}) *</label>
          <input type="number" step="0.01" min="0.01" value={form.monto} onChange={e => set('monto', e.target.value)} required placeholder="0.00" style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Fecha *</label>
        <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} required style={inputStyle}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Descripción</label>
        <input type="text" value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Opcional" style={inputStyle}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
        <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" type="submit" loading={loading}>{initial ? 'Guardar cambios' : 'Crear ingreso'}</Button>
      </div>
    </form>
  )
}

export default function Ingresos() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | {edit: item}
  const [deleting, setDeleting] = useState(null)
  const [page, setPage] = useState(1)
  const currency = user?.moneda || 'USD'

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const res = await ingresosService.getAll({ page: p, limit: 20 })
      setData(res.data.data)
      setPagination(res.data.pagination)
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load(page) }, [page, load])

  const handleCreate = async (form) => {
    try {
      await ingresosService.create(form)
      toast.success('Ingreso creado')
      setModal(null)
      load(page)
    } catch (e) { toast.error(getErrorMessage(e)) }
  }

  const handleEdit = async (form) => {
    try {
      await ingresosService.update(modal.edit.id, form)
      toast.success('Ingreso actualizado')
      setModal(null)
      load(page)
    } catch (e) { toast.error(getErrorMessage(e)) }
  }

  const handleDelete = async () => {
    try {
      await ingresosService.delete(deleting.id)
      toast.success('Ingreso eliminado')
      setDeleting(null)
      load(page)
    } catch (e) { toast.error(getErrorMessage(e)) }
  }

  const total = data.reduce((s, i) => s + Number(i.monto), 0)

  const columns = [
    { key: 'tipo', label: 'Tipo', render: r => <Badge color="green">{r.tipo}</Badge> },
    { key: 'monto', label: 'Monto', align: 'right', mono: true, render: r => <span style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatMoney(r.monto, currency)}</span> },
    { key: 'fecha', label: 'Fecha', render: r => formatDate(r.fecha) },
    { key: 'descripcion', label: 'Descripción', render: r => <span style={{ color: 'var(--text-secondary)' }}>{r.descripcion || '—'}</span> },
    {
      key: 'actions', label: '', align: 'right', render: r => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" onClick={() => setModal({ edit: r })}><Pencil size={14} /></Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(r)} style={{ color: 'var(--red)' }}><Trash2 size={14} /></Button>
        </div>
      )
    },
  ]

  return (
    <div>
      <PageHeader
        title="Ingresos"
        subtitle={`Total: ${formatMoney(total, currency)}`}
        action={<Button onClick={() => setModal('create')}><Plus size={16} /> Nuevo ingreso</Button>}
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {data.length === 0 && !loading
          ? <EmptyState icon={TrendingUp} title="Sin ingresos aún" description="Registra tu primer ingreso para empezar a ver tu flujo de dinero." action={<Button onClick={() => setModal('create')}><Plus size={16} /> Registrar ingreso</Button>} />
          : <DataTable columns={columns} data={data} loading={loading} />
        }
      </motion.div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <Button variant="secondary" size="sm" disabled={!pagination.hasPrev} onClick={() => setPage(p => p - 1)}>← Anterior</Button>
          <span style={{ padding: '6px 12px', fontSize: 13, color: 'var(--text-muted)' }}>Página {pagination.page} de {pagination.totalPages}</span>
          <Button variant="secondary" size="sm" disabled={!pagination.hasNext} onClick={() => setPage(p => p + 1)}>Siguiente →</Button>
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.edit ? 'Editar ingreso' : 'Nuevo ingreso'}>
        <IngresoForm initial={modal?.edit ? { ...modal.edit, fecha: formatDateInput(modal.edit.fecha) } : null}
          onSave={modal?.edit ? handleEdit : handleCreate} onClose={() => setModal(null)} currency={currency} />
      </Modal>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete}
        title="Eliminar ingreso" description={`¿Eliminar el ingreso de ${deleting ? formatMoney(deleting.monto, currency) : ''}? Esta acción no se puede deshacer.`} />
    </div>
  )
}
