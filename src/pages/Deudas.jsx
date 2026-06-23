import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Plus, Wallet, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { deudasService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { formatMoney, formatDate, formatDateInput, getErrorMessage, TIPOS_DEUDA, ESTADOS_DEUDA } from '../utils/helpers'
import PageHeader from '../components/layout/PageHeader'
import { Button, Modal, EmptyState, ConfirmDialog, Badge } from '../components/ui'
import DataTable from '../components/ui/DataTable'

const ESTADO_COLOR = { ACTIVA: 'accent', PAGADA: 'green', EN_MORA: 'red', REFINANCIADA: 'amber' }

function DeudaForm({ initial, onSave, onClose, currency }) {
  const [form, setForm] = useState(initial || {
    entidad: '', tipo: 'PERSONAL', montoOriginal: '', saldoActual: '',
    tasaInteres: '', cuotaMensual: '', fechaInicio: formatDateInput(new Date()),
    fechaFin: '', estado: 'ACTIVA', descripcion: ''
  })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try { await onSave(form) } finally { setLoading(false) }
  }

  const inp = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 14, color: 'var(--text-primary)', outline: 'none' }
  const label = (txt) => <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>{txt}</label>
  const focus = e => e.target.style.borderColor = 'var(--accent)'
  const blur = e => e.target.style.borderColor = 'var(--border)'

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          {label('Entidad *')}
          <input value={form.entidad} onChange={e => set('entidad', e.target.value)} required placeholder="Banco / Prestamista" style={inp} onFocus={focus} onBlur={blur} />
        </div>
        <div>
          {label('Tipo *')}
          <select value={form.tipo} onChange={e => set('tipo', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
            {TIPOS_DEUDA.map(t => <option key={t} value={t} style={{ background: 'var(--bg-elevated)' }}>{t}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          {label(`Monto original (${currency}) *`)}
          <input type="number" step="0.01" min="0.01" value={form.montoOriginal} onChange={e => set('montoOriginal', e.target.value)} required placeholder="0.00" style={inp} onFocus={focus} onBlur={blur} />
        </div>
        <div>
          {label(`Saldo actual (${currency}) *`)}
          <input type="number" step="0.01" min="0" value={form.saldoActual} onChange={e => set('saldoActual', e.target.value)} required placeholder="0.00" style={inp} onFocus={focus} onBlur={blur} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          {label('Tasa de interés (% anual)')}
          <input type="number" step="0.01" min="0" max="100" value={form.tasaInteres} onChange={e => set('tasaInteres', e.target.value)} placeholder="18.5" style={inp} onFocus={focus} onBlur={blur} />
        </div>
        <div>
          {label(`Cuota mensual (${currency})`)}
          <input type="number" step="0.01" min="0" value={form.cuotaMensual} onChange={e => set('cuotaMensual', e.target.value)} placeholder="0.00" style={inp} onFocus={focus} onBlur={blur} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          {label('Fecha inicio *')}
          <input type="date" value={form.fechaInicio} onChange={e => set('fechaInicio', e.target.value)} required style={inp} onFocus={focus} onBlur={blur} />
        </div>
        <div>
          {label('Fecha fin')}
          <input type="date" value={form.fechaFin} onChange={e => set('fechaFin', e.target.value)} style={inp} onFocus={focus} onBlur={blur} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          {label('Estado')}
          <select value={form.estado} onChange={e => set('estado', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
            {ESTADOS_DEUDA.map(e => <option key={e} value={e} style={{ background: 'var(--bg-elevated)' }}>{e}</option>)}
          </select>
        </div>
        <div>
          {label('Descripción')}
          <input value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Opcional" style={inp} onFocus={focus} onBlur={blur} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
        <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" type="submit" loading={loading}>{initial ? 'Guardar cambios' : 'Crear deuda'}</Button>
      </div>
    </form>
  )
}

export default function Deudas() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [page, setPage] = useState(1)
  const [filtroEstado, setFiltroEstado] = useState('')
  const currency = user?.moneda || 'USD'

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const params = { page: p, limit: 20, ...(filtroEstado && { estado: filtroEstado }) }
      const res = await deudasService.getAll(params)
      setData(res.data.data)
      setPagination(res.data.pagination)
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setLoading(false) }
  }, [filtroEstado])

  useEffect(() => { load(page) }, [page, load])

  const handleCreate = async (form) => {
    try { await deudasService.create(form); toast.success('Deuda creada'); setModal(null); load(page) }
    catch (e) { toast.error(getErrorMessage(e)) }
  }
  const handleEdit = async (form) => {
    try { await deudasService.update(modal.edit.id, form); toast.success('Deuda actualizada'); setModal(null); load(page) }
    catch (e) { toast.error(getErrorMessage(e)) }
  }
  const handleDelete = async () => {
    try { await deudasService.delete(deleting.id); toast.success('Deuda eliminada'); setDeleting(null); load(page) }
    catch (e) { toast.error(getErrorMessage(e)) }
  }

  const totalDeuda = data.reduce((s, d) => s + Number(d.saldoActual), 0)

  const columns = [
    { key: 'entidad', label: 'Entidad', render: r => <span style={{ fontWeight: 600 }}>{r.entidad}</span> },
    { key: 'tipo', label: 'Tipo', render: r => <Badge color="gray">{r.tipo}</Badge> },
    { key: 'saldoActual', label: 'Saldo pendiente', align: 'right', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--amber)' }}>{formatMoney(r.saldoActual, currency)}</span> },
    { key: 'montoOriginal', label: 'Original', align: 'right', render: r => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 13 }}>{formatMoney(r.montoOriginal, currency)}</span> },
    { key: 'tasaInteres', label: 'Tasa', render: r => r.tasaInteres ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{r.tasaInteres}%</span> : <span style={{ color: 'var(--text-muted)' }}>—</span> },
    { key: 'estado', label: 'Estado', render: r => <Badge color={ESTADO_COLOR[r.estado] || 'gray'}>{r.estado}</Badge> },
    {
      key: 'actions', label: '', align: 'right', render: r => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" onClick={() => setModal({ edit: r })}><Pencil size={14} /></Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(r)} style={{ color: 'var(--red)' }}><Trash2 size={14} /></Button>
        </div>
      )
    },
  ]

  const inp = { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 13, color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }

  return (
    <div>
      <PageHeader title="Deudas" subtitle={`Saldo total: ${formatMoney(totalDeuda, currency)}`}
        action={<Button onClick={() => setModal('create')}><Plus size={16} /> Nueva deuda</Button>} />

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <select value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPage(1) }} style={inp}>
          <option value="" style={{ background: 'var(--bg-elevated)' }}>Todos los estados</option>
          {ESTADOS_DEUDA.map(e => <option key={e} value={e} style={{ background: 'var(--bg-elevated)' }}>{e}</option>)}
        </select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {data.length === 0 && !loading
          ? <EmptyState icon={Wallet} title="Sin deudas registradas" description="Registra tus deudas para llevar un control de lo que debes." action={<Button onClick={() => setModal('create')}><Plus size={16} /> Registrar deuda</Button>} />
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

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.edit ? 'Editar deuda' : 'Nueva deuda'} size="lg">
        <DeudaForm initial={modal?.edit ? { ...modal.edit, fechaInicio: formatDateInput(modal.edit.fechaInicio), fechaFin: formatDateInput(modal.edit.fechaFin) } : null}
          onSave={modal?.edit ? handleEdit : handleCreate} onClose={() => setModal(null)} currency={currency} />
      </Modal>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete}
        title="Eliminar deuda" description="¿Eliminar esta deuda? Se eliminarán también todos sus pagos y cuotas de amortización." />
    </div>
  )
}
