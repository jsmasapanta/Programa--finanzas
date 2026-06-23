import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Plus, DollarSign } from 'lucide-react'
import { pagosService, deudasService, tarjetasService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { formatMoney, formatDate, formatDateInput, getErrorMessage } from '../utils/helpers'
import PageHeader from '../components/layout/PageHeader'
import { Button, Modal, EmptyState, Badge } from '../components/ui'
import DataTable from '../components/ui/DataTable'

function PagoForm({ onSave, onClose, currency }) {
  const [tipo, setTipo] = useState('DEUDA')
  const [form, setForm] = useState({ monto: '', fechaPago: formatDateInput(new Date()), descripcion: '', deudaId: '', tarjetaId: '' })
  const [deudas, setDeudas] = useState([])
  const [tarjetas, setTarjetas] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingOptions, setLoadingOptions] = useState(true)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    Promise.all([
      deudasService.getAll({ limit: 100, estado: 'ACTIVA' }),
      tarjetasService.getAll({ limit: 100, estado: 'ACTIVA' }),
    ]).then(([d, t]) => {
      setDeudas(d.data.data)
      setTarjetas(t.data.data)
    }).finally(() => setLoadingOptions(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave({ tipo, ...form, deudaId: tipo === 'DEUDA' ? form.deudaId : undefined, tarjetaId: tipo === 'TARJETA' ? form.tarjetaId : undefined })
    } finally { setLoading(false) }
  }

  const inp = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 14, color: 'var(--text-primary)', outline: 'none' }
  const fo = e => e.target.style.borderColor = 'var(--accent)'
  const bl = e => e.target.style.borderColor = 'var(--border)'

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Tipo selector */}
      <div style={{ display: 'flex', gap: 8 }}>
        {['DEUDA', 'TARJETA'].map(t => (
          <button key={t} type="button" onClick={() => setTipo(t)}
            style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', border: `1px solid ${tipo === t ? 'var(--accent)' : 'var(--border)'}`, background: tipo === t ? 'var(--accent-dim)' : 'transparent', color: tipo === t ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: tipo === t ? 600 : 400, cursor: 'pointer', fontSize: 14, transition: '0.15s' }}>
            {t === 'DEUDA' ? '🏦 Pago de deuda' : '💳 Pago de tarjeta'}
          </button>
        ))}
      </div>

      {tipo === 'DEUDA' ? (
        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Deuda *</label>
          <select value={form.deudaId} onChange={e => set('deudaId', e.target.value)} required disabled={loadingOptions} style={{ ...inp, cursor: 'pointer' }}>
            <option value="" style={{ background: 'var(--bg-elevated)' }}>{loadingOptions ? 'Cargando...' : 'Seleccionar deuda...'}</option>
            {deudas.map(d => <option key={d.id} value={d.id} style={{ background: 'var(--bg-elevated)' }}>{d.entidad} — {formatMoney(d.saldoActual, currency)}</option>)}
          </select>
        </div>
      ) : (
        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Tarjeta *</label>
          <select value={form.tarjetaId} onChange={e => set('tarjetaId', e.target.value)} required disabled={loadingOptions} style={{ ...inp, cursor: 'pointer' }}>
            <option value="" style={{ background: 'var(--bg-elevated)' }}>{loadingOptions ? 'Cargando...' : 'Seleccionar tarjeta...'}</option>
            {tarjetas.map(t => <option key={t.id} value={t.id} style={{ background: 'var(--bg-elevated)' }}>{t.nombreTarjeta} ({t.banco}) — Saldo: {formatMoney(t.saldoUsado, currency)}</option>)}
          </select>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Monto ({currency}) *</label>
          <input type="number" step="0.01" min="0.01" value={form.monto} onChange={e => set('monto', e.target.value)} required placeholder="0.00" style={inp} onFocus={fo} onBlur={bl} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Fecha de pago *</label>
          <input type="date" value={form.fechaPago} onChange={e => set('fechaPago', e.target.value)} required style={inp} onFocus={fo} onBlur={bl} />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Descripción</label>
        <input value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Opcional" style={inp} onFocus={fo} onBlur={bl} />
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
        <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
        <Button variant="success" type="submit" loading={loading}>Registrar pago</Button>
      </div>
    </form>
  )
}

export default function Pagos() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [page, setPage] = useState(1)
  const [filtroTipo, setFiltroTipo] = useState('')
  const currency = user?.moneda || 'USD'

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const params = { page: p, limit: 20, ...(filtroTipo && { tipo: filtroTipo }) }
      const res = await pagosService.getAll(params)
      setData(res.data.data)
      setPagination(res.data.pagination)
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setLoading(false) }
  }, [filtroTipo])

  useEffect(() => { load(page) }, [page, load])

  const handleCreate = async (form) => {
    try { await pagosService.create(form); toast.success('Pago registrado'); setModal(false); load(page) }
    catch (e) { toast.error(getErrorMessage(e)) }
  }

  const totalPagado = data.reduce((s, p) => s + Number(p.monto), 0)

  const columns = [
    { key: 'tipo', label: 'Tipo', render: r => <Badge color={r.tipo === 'DEUDA' ? 'amber' : 'accent'}>{r.tipo}</Badge> },
    {
      key: 'destino', label: 'Destino', render: r => (
        <span style={{ fontSize: 13 }}>
          {r.deuda ? `${r.deuda.entidad} (Deuda)` : r.tarjeta ? `${r.tarjeta.nombreTarjeta} (${r.tarjeta.banco})` : '—'}
        </span>
      )
    },
    { key: 'monto', label: 'Monto', align: 'right', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--green)' }}>{formatMoney(r.monto, currency)}</span> },
    { key: 'fechaPago', label: 'Fecha', render: r => formatDate(r.fechaPago) },
    { key: 'descripcion', label: 'Descripción', render: r => <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{r.descripcion || '—'}</span> },
  ]

  const inp = { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 13, color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }

  return (
    <div>
      <PageHeader title="Pagos" subtitle={`Total pagado en esta vista: ${formatMoney(totalPagado, currency)}`}
        action={<Button onClick={() => setModal(true)}><Plus size={16} /> Registrar pago</Button>} />

      <div style={{ marginBottom: 20 }}>
        <select value={filtroTipo} onChange={e => { setFiltroTipo(e.target.value); setPage(1) }} style={inp}>
          <option value="" style={{ background: 'var(--bg-elevated)' }}>Todos los tipos</option>
          <option value="DEUDA" style={{ background: 'var(--bg-elevated)' }}>Deudas</option>
          <option value="TARJETA" style={{ background: 'var(--bg-elevated)' }}>Tarjetas</option>
        </select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {data.length === 0 && !loading
          ? <EmptyState icon={DollarSign} title="Sin pagos registrados" description="Registra un pago para reducir tu deuda o saldo de tarjeta." action={<Button onClick={() => setModal(true)}><Plus size={16} /> Registrar pago</Button>} />
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

      <Modal open={modal} onClose={() => setModal(false)} title="Registrar pago" size="md">
        <PagoForm onSave={handleCreate} onClose={() => setModal(false)} currency={currency} />
      </Modal>
    </div>
  )
}
