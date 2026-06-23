import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { TableProperties, Zap, Pencil } from 'lucide-react'
import { amortizacionService, deudasService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { formatMoney, formatDate, getErrorMessage } from '../utils/helpers'
import PageHeader from '../components/layout/PageHeader'
import { Button, Modal, EmptyState, Badge, Spinner } from '../components/ui'
import DataTable from '../components/ui/DataTable'

const ESTADO_COLOR = { PENDIENTE: 'amber', PAGADA: 'green', VENCIDA: 'red' }

function EstadoForm({ cuota, onSave, onClose }) {
  const [estado, setEstado] = useState(cuota.estado)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try { await onSave(cuota.id, { estado }); onClose() }
    catch (e) { toast.error(getErrorMessage(e)) }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Estado de cuota #{cuota.numeroCuota}</label>
        <select value={estado} onChange={e => setEstado(e.target.value)}
          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 14, color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}>
          {['PENDIENTE', 'PAGADA', 'VENCIDA'].map(e => <option key={e} value={e} style={{ background: 'var(--bg-elevated)' }}>{e}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" type="submit" loading={loading}>Guardar</Button>
      </div>
    </form>
  )
}

export default function Amortizacion() {
  const { user } = useAuth()
  const [deudas, setDeudas] = useState([])
  const [selectedDeuda, setSelectedDeuda] = useState('')
  const [cuotas, setCuotas] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const currency = user?.moneda || 'USD'

  useEffect(() => {
    deudasService.getAll({ limit: 100 }).then(res => setDeudas(res.data.data)).catch(console.error)
  }, [])

  const loadCuotas = useCallback(async (deudaId, p = 1) => {
    if (!deudaId) return
    setLoading(true)
    try {
      const res = await amortizacionService.getPorDeuda(deudaId, { page: p, limit: 24 })
      setCuotas(res.data.data)
      setPagination(res.data.pagination)
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (selectedDeuda) loadCuotas(selectedDeuda, page)
    else setCuotas([])
  }, [selectedDeuda, page, loadCuotas])

  const handleGenerar = async () => {
    if (!selectedDeuda) return toast.error('Selecciona una deuda primero')
    setGenerating(true)
    try {
      const res = await amortizacionService.generar(selectedDeuda)
      toast.success(res.data.message)
      loadCuotas(selectedDeuda, 1)
      setPage(1)
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setGenerating(false) }
  }

  const handleUpdateEstado = async (id, data) => {
    await amortizacionService.update(id, data)
    toast.success('Cuota actualizada')
    loadCuotas(selectedDeuda, page)
  }

  const deudaSeleccionada = deudas.find(d => String(d.id) === String(selectedDeuda))
  const totalPendiente = cuotas.filter(c => c.estado === 'PENDIENTE').reduce((s, c) => s + Number(c.cuota), 0)

  const columns = [
    { key: 'numeroCuota', label: 'N°', render: r => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 13 }}>#{r.numeroCuota}</span> },
    { key: 'fechaPago', label: 'Fecha de pago', render: r => formatDate(r.fechaPago) },
    { key: 'cuota', label: 'Cuota total', align: 'right', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatMoney(r.cuota, currency)}</span> },
    { key: 'capital', label: 'Capital', align: 'right', render: r => r.capital ? <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)', fontSize: 13 }}>{formatMoney(r.capital, currency)}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span> },
    { key: 'interes', label: 'Interés', align: 'right', render: r => r.interes ? <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)', fontSize: 13 }}>{formatMoney(r.interes, currency)}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span> },
    { key: 'saldoRestante', label: 'Saldo restante', align: 'right', render: r => r.saldoRestante !== null ? <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber)', fontSize: 13 }}>{formatMoney(r.saldoRestante, currency)}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span> },
    { key: 'estado', label: 'Estado', render: r => <Badge color={ESTADO_COLOR[r.estado] || 'gray'}>{r.estado}</Badge> },
    {
      key: 'actions', label: '', align: 'right', render: r => (
        <Button variant="ghost" size="sm" onClick={() => setEditModal(r)}><Pencil size={13} /></Button>
      )
    },
  ]

  return (
    <div>
      <PageHeader title="Tabla de amortización" subtitle="Visualiza y gestiona las cuotas de tus deudas" />

      {/* Selector + acciones */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
        <select value={selectedDeuda} onChange={e => { setSelectedDeuda(e.target.value); setPage(1) }}
          style={{ flex: 1, minWidth: 240, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 14, color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}>
          <option value="" style={{ background: 'var(--bg-elevated)' }}>Seleccionar deuda...</option>
          {deudas.map(d => <option key={d.id} value={d.id} style={{ background: 'var(--bg-elevated)' }}>{d.entidad} — Saldo: {formatMoney(d.saldoActual, currency)}</option>)}
        </select>
        <Button variant="secondary" onClick={handleGenerar} loading={generating} disabled={!selectedDeuda}>
          <Zap size={15} /> Generar tabla automática
        </Button>
      </div>

      {/* Info de la deuda seleccionada */}
      {deudaSeleccionada && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Entidad', value: deudaSeleccionada.entidad, mono: false },
            { label: 'Saldo actual', value: formatMoney(deudaSeleccionada.saldoActual, currency), mono: true, color: 'var(--amber)' },
            { label: 'Tasa interés', value: deudaSeleccionada.tasaInteres ? `${deudaSeleccionada.tasaInteres}% EA` : '—', mono: true },
            { label: 'Cuota mensual', value: deudaSeleccionada.cuotaMensual ? formatMoney(deudaSeleccionada.cuotaMensual, currency) : '—', mono: true },
            { label: 'Cuotas pendientes', value: cuotas.filter(c => c.estado === 'PENDIENTE').length, mono: true },
            { label: 'Total pendiente', value: formatMoney(totalPendiente, currency), mono: true, color: 'var(--red)' },
          ].map(({ label, value, mono, color }) => (
            <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              <div style={{ fontFamily: mono ? 'var(--font-mono)' : 'inherit', fontSize: 15, fontWeight: 700, color: color || 'var(--text-primary)' }}>{value}</div>
            </div>
          ))}
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {!selectedDeuda
          ? <EmptyState icon={TableProperties} title="Selecciona una deuda" description="Elige una deuda para ver o generar su tabla de amortización." />
          : cuotas.length === 0 && !loading
            ? <EmptyState icon={TableProperties} title="Sin cuotas generadas"
              description='Haz clic en "Generar tabla automática" si la deuda tiene tasa, cuota y fecha de inicio configuradas.'
              action={<Button variant="secondary" onClick={handleGenerar} loading={generating}><Zap size={15} /> Generar ahora</Button>} />
            : <DataTable columns={columns} data={cuotas} loading={loading} />
        }
      </motion.div>

      {pagination?.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <Button variant="secondary" size="sm" disabled={!pagination.hasPrev} onClick={() => setPage(p => p - 1)}>← Anterior</Button>
          <span style={{ padding: '6px 12px', fontSize: 13, color: 'var(--text-muted)' }}>Página {pagination.page} de {pagination.totalPages}</span>
          <Button variant="secondary" size="sm" disabled={!pagination.hasNext} onClick={() => setPage(p => p + 1)}>Siguiente →</Button>
        </div>
      )}

      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Actualizar estado de cuota" size="sm">
        {editModal && <EstadoForm cuota={editModal} onSave={handleUpdateEstado} onClose={() => setEditModal(null)} />}
      </Modal>
    </div>
  )
}
