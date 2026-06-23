import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Plus, CreditCard, Pencil, Trash2 } from 'lucide-react'
import { tarjetasService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { formatMoney, formatDateInput, getErrorMessage, FRANQUICIAS, ESTADOS_TARJETA } from '../utils/helpers'
import PageHeader from '../components/layout/PageHeader'
import { Button, Modal, EmptyState, ConfirmDialog, Badge } from '../components/ui'

const ESTADO_COLOR = { ACTIVA: 'green', BLOQUEADA: 'red', CANCELADA: 'gray' }
const FRANQ_COLOR = { VISA: '#1A1F71', MASTERCARD: '#EB001B', AMEX: '#007BC1', DINERS: '#004B87', DISCOVER: '#FF6600', OTRA: '#6C63FF' }

function UsageBar({ porcentaje }) {
  const color = porcentaje >= 90 ? 'var(--red)' : porcentaje >= 70 ? 'var(--amber)' : 'var(--green)'
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
        <span>Uso del cupo</span>
        <span style={{ color, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{porcentaje}%</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${porcentaje}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 99 }} />
      </div>
    </div>
  )
}

function TarjetaCard({ tarjeta, currency, onEdit, onDelete }) {
  const franqColor = FRANQ_COLOR[tarjeta.franquicia] || '#6C63FF'
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22, position: 'relative', overflow: 'hidden' }}>
      {/* Franquicia color bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: franqColor, opacity: 0.7 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700 }}>{tarjeta.nombreTarjeta}</span>
            <Badge color={ESTADO_COLOR[tarjeta.estado] || 'gray'}>{tarjeta.estado}</Badge>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tarjeta.banco} · {tarjeta.franquicia}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Button variant="ghost" size="sm" onClick={() => onEdit(tarjeta)}><Pencil size={13} /></Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(tarjeta)} style={{ color: 'var(--red)' }}><Trash2 size={13} /></Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Cupo total</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{formatMoney(tarjeta.cupoTotal, currency)}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Disponible</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: 'var(--green)' }}>{formatMoney(tarjeta.disponible, currency)}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Saldo usado</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--red)' }}>{formatMoney(tarjeta.saldoUsado, currency)}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Pago mínimo</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--amber)' }}>{tarjeta.pagoMinimo ? formatMoney(tarjeta.pagoMinimo, currency) : '—'}</div>
        </div>
      </div>

      <UsageBar porcentaje={tarjeta.porcentajeUso || 0} />

      <div style={{ marginTop: 12, display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)' }}>
        <span>Corte: día {tarjeta.fechaCorte}</span>
        <span>Pago: día {tarjeta.fechaPago}</span>
        {tarjeta.tasaInteres && <span>TEA: {tarjeta.tasaInteres}%</span>}
      </div>
    </motion.div>
  )
}

function TarjetaForm({ initial, onSave, onClose, currency }) {
  const [form, setForm] = useState(initial || {
    banco: '', nombreTarjeta: '', franquicia: 'VISA', cupoTotal: '', saldoUsado: '0',
    pagoMinimo: '', fechaCorte: '15', fechaPago: '5', tasaInteres: '', estado: 'ACTIVA', descripcion: ''
  })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try { await onSave(form) } finally { setLoading(false) }
  }

  const inp = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 14, color: 'var(--text-primary)', outline: 'none' }
  const lbl = (t) => <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>{t}</label>
  const fo = e => e.target.style.borderColor = 'var(--accent)'
  const bl = e => e.target.style.borderColor = 'var(--border)'

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>{lbl('Banco *')}<input value={form.banco} onChange={e => set('banco', e.target.value)} required placeholder="Banco del País" style={inp} onFocus={fo} onBlur={bl} /></div>
        <div>{lbl('Nombre de la tarjeta *')}<input value={form.nombreTarjeta} onChange={e => set('nombreTarjeta', e.target.value)} required placeholder="Platinum / Gold..." style={inp} onFocus={fo} onBlur={bl} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>{lbl('Franquicia *')}<select value={form.franquicia} onChange={e => set('franquicia', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>{FRANQUICIAS.map(f => <option key={f} value={f} style={{ background: 'var(--bg-elevated)' }}>{f}</option>)}</select></div>
        <div>{lbl('Estado')}<select value={form.estado} onChange={e => set('estado', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>{ESTADOS_TARJETA.map(e => <option key={e} value={e} style={{ background: 'var(--bg-elevated)' }}>{e}</option>)}</select></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>{lbl(`Cupo total (${currency}) *`)}<input type="number" step="0.01" min="0.01" value={form.cupoTotal} onChange={e => set('cupoTotal', e.target.value)} required placeholder="5000" style={inp} onFocus={fo} onBlur={bl} /></div>
        <div>{lbl(`Saldo usado (${currency}) *`)}<input type="number" step="0.01" min="0" value={form.saldoUsado} onChange={e => set('saldoUsado', e.target.value)} required placeholder="0" style={inp} onFocus={fo} onBlur={bl} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        <div>{lbl(`Pago mínimo`)}<input type="number" step="0.01" min="0" value={form.pagoMinimo} onChange={e => set('pagoMinimo', e.target.value)} placeholder="0" style={inp} onFocus={fo} onBlur={bl} /></div>
        <div>{lbl('Día de corte (1-31)')}<input type="number" min="1" max="31" value={form.fechaCorte} onChange={e => set('fechaCorte', e.target.value)} required style={inp} onFocus={fo} onBlur={bl} /></div>
        <div>{lbl('Día de pago (1-31)')}<input type="number" min="1" max="31" value={form.fechaPago} onChange={e => set('fechaPago', e.target.value)} required style={inp} onFocus={fo} onBlur={bl} /></div>
      </div>
      <div>
        {lbl('Tasa de interés anual (%)')}
        <input type="number" step="0.01" min="0" max="100" value={form.tasaInteres} onChange={e => set('tasaInteres', e.target.value)} placeholder="24.5" style={inp} onFocus={fo} onBlur={bl} />
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
        <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" type="submit" loading={loading}>{initial ? 'Guardar cambios' : 'Crear tarjeta'}</Button>
      </div>
    </form>
  )
}

export default function Tarjetas() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const currency = user?.moneda || 'USD'

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await tarjetasService.getAll({ limit: 50 })
      setData(res.data.data)
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async (form) => {
    try { await tarjetasService.create(form); toast.success('Tarjeta creada'); setModal(null); load() }
    catch (e) { toast.error(getErrorMessage(e)) }
  }
  const handleEdit = async (form) => {
    try { await tarjetasService.update(modal.edit.id, form); toast.success('Tarjeta actualizada'); setModal(null); load() }
    catch (e) { toast.error(getErrorMessage(e)) }
  }
  const handleDelete = async () => {
    try { await tarjetasService.delete(deleting.id); toast.success('Tarjeta eliminada'); setDeleting(null); load() }
    catch (e) { toast.error(getErrorMessage(e)) }
  }

  const cupoTotal = data.reduce((s, t) => s + Number(t.cupoTotal), 0)
  const disponibleTotal = data.reduce((s, t) => s + Number(t.disponible || 0), 0)

  return (
    <div>
      <PageHeader title="Tarjetas de crédito"
        subtitle={`${data.length} tarjetas · Disponible total: ${formatMoney(disponibleTotal, currency)}`}
        action={<Button onClick={() => setModal('create')}><Plus size={16} /> Nueva tarjeta</Button>} />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div style={{ width: 36, height: 36, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /></div>
      ) : data.length === 0 ? (
        <EmptyState icon={CreditCard} title="Sin tarjetas registradas" description="Agrega tus tarjetas de crédito para controlar tu cupo y pagos." action={<Button onClick={() => setModal('create')}><Plus size={16} /> Agregar tarjeta</Button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
          {data.map(t => <TarjetaCard key={t.id} tarjeta={t} currency={currency} onEdit={t => setModal({ edit: t })} onDelete={setDeleting} />)}
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.edit ? 'Editar tarjeta' : 'Nueva tarjeta'} size="lg">
        <TarjetaForm initial={modal?.edit || null} onSave={modal?.edit ? handleEdit : handleCreate} onClose={() => setModal(null)} currency={currency} />
      </Modal>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete}
        title="Eliminar tarjeta" description="¿Eliminar esta tarjeta? También se eliminarán sus pagos asociados." />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
