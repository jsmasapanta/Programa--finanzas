import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import {
  TrendingUp, TrendingDown, Wallet, CreditCard,
  ArrowUpRight, ArrowDownRight, Bell, Layers,
} from 'lucide-react'
import { reportesService, ingresosService, gastosService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { formatMoney, formatDate } from '../utils/helpers'
import { Spinner } from '../components/ui'

/* ── Tooltip de gráfico ─────────────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(14,18,32,0.96)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12, padding: '10px 14px', fontSize: 12,
      backdropFilter: 'blur(16px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 8, fontSize: 11, letterSpacing: '0.04em' }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.fill, fontFamily: 'var(--font-mono)', marginBottom: 3 }}>
          {p.name}: {formatMoney(p.value, currency)}
        </p>
      ))}
    </div>
  )
}

/* ── Barra redondeada para el chart ─────────────────────────────────────────── */
const RoundBar = ({ x, y, width, height, fill }) => (
  <rect x={x} y={y} width={width} height={height} fill={fill} rx={5} ry={5} />
)

/* ── Tarjeta 3D con tilt por mouse ──────────────────────────────────────────── */
function TiltCard({ label, value, currency, color, icon: Icon, change, delay }) {
  const ref = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0, glow: false })

  const palette = {
    blue:   { bg: 'rgba(91,122,255,0.12)',  accent: '#5B7AFF', glow: 'rgba(91,122,255,0.35)',  icon: 'rgba(91,122,255,0.2)' },
    green:  { bg: 'rgba(46,224,134,0.1)',   accent: '#2EE086', glow: 'rgba(46,224,134,0.3)',   icon: 'rgba(46,224,134,0.18)' },
    red:    { bg: 'rgba(255,77,114,0.1)',    accent: '#FF4D72', glow: 'rgba(255,77,114,0.3)',   icon: 'rgba(255,77,114,0.18)' },
    purple: { bg: 'rgba(157,127,255,0.12)', accent: '#9D7FFF', glow: 'rgba(157,127,255,0.35)', icon: 'rgba(157,127,255,0.2)' },
    orange: { bg: 'rgba(255,122,74,0.12)',  accent: '#FF7A4A', glow: 'rgba(255,122,74,0.3)',   icon: 'rgba(255,122,74,0.18)' },
  }
  const c = palette[color] || palette.blue

  const onMove = useCallback((e) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 14
    const y = ((e.clientY - r.top)  / r.height - 0.5) * -14
    setTilt({ x, y, glow: true })
  }, [])

  const onLeave = useCallback(() => setTilt({ x: 0, y: 0, glow: false }), [])

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.34, 1.1, 0.64, 1] }}
      style={{
        background: 'linear-gradient(160deg, rgba(20,25,44,0.9) 0%, rgba(12,15,28,0.95) 100%)',
        border: `1px solid ${tilt.glow ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        position: 'relative', overflow: 'hidden',
        cursor: 'default',
        transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateZ(${tilt.glow ? '6px' : '0'})`,
        transition: tilt.glow
          ? 'transform 0.08s ease, box-shadow 0.3s ease, border-color 0.3s ease'
          : 'transform 0.5s cubic-bezier(0.34,1.1,0.64,1), box-shadow 0.3s ease, border-color 0.3s ease',
        boxShadow: tilt.glow
          ? `0 20px 50px rgba(0,0,0,0.65), 0 4px 12px rgba(0,0,0,0.4), 0 0 30px ${c.glow}`
          : 'inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 20px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(20px)',
        willChange: 'transform',
      }}
    >
      {/* Ambient light from accent color */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 100, height: 100, borderRadius: '50%',
        background: c.bg, filter: 'blur(30px)',
        opacity: tilt.glow ? 1 : 0.6,
        transition: 'opacity 0.3s',
        pointerEvents: 'none',
      }} />
      {/* Top edge light reflection */}
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, position: 'relative' }}>
        {/* Icon */}
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: c.icon,
          border: `1px solid ${c.glow.replace('0.35', '0.2').replace('0.3', '0.2')}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 12px ${c.glow.replace('0.35', '0.25').replace('0.3', '0.2')}`,
        }}>
          <Icon size={16} color={c.accent} />
        </div>

        {/* Change badge */}
        {change !== undefined && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.2 }}
            style={{
              fontSize: 11, fontWeight: 700,
              color: change >= 0 ? 'var(--green)' : 'var(--red)',
              background: change >= 0 ? 'var(--green-dim)' : 'var(--red-dim)',
              border: `1px solid ${change >= 0 ? 'rgba(46,224,134,0.2)' : 'rgba(255,77,114,0.2)'}`,
              padding: '3px 8px', borderRadius: 99,
              display: 'flex', alignItems: 'center', gap: 2,
            }}
          >
            {change >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {Math.abs(change)}%
          </motion.span>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700,
          color: 'var(--text-primary)', letterSpacing: '-0.03em',
          lineHeight: 1, marginBottom: 6,
        }}>
          {formatMoney(value || 0, currency)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.01em' }}>
          {label}
        </div>
      </div>
    </motion.div>
  )
}

/* ── Página principal ───────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth()
  const [resumen, setResumen] = useState(null)
  const [chart, setChart] = useState([])
  const [transacciones, setTransacciones] = useState([])
  const [proximos, setProximos] = useState(null)
  const [loading, setLoading] = useState(true)
  const currency = user?.moneda || 'USD'

  useEffect(() => {
    Promise.all([
      reportesService.resumen(),
      reportesService.ingresosVsGastos({ meses: 12 }),
      ingresosService.getAll({ limit: 4 }),
      gastosService.getAll({ limit: 4 }),
      reportesService.proximosPagos({ dias: 30 }),
    ]).then(([r, c, ing, gas, p]) => {
      setResumen(r.data)
      setChart(c.data.map(d => ({ ...d, mes: d.mes.slice(5) })))
      const all = [
        ...ing.data.data.map(i => ({ ...i, _tipo: 'ingreso' })),
        ...gas.data.data.map(g => ({ ...g, _tipo: 'gasto' })),
      ].sort((a, b) => new Date(b.fecha || b.createdAt) - new Date(a.fecha || a.createdAt)).slice(0, 6)
      setTransacciones(all)
      setProximos(p.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Spinner size={36} />
    </div>
  )

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  const lastTwo = chart.slice(-2)
  const prevMes = lastTwo.length === 2 ? lastTwo[0] : null
  const currMes = lastTwo.length >= 1 ? lastTwo[lastTwo.length - 1] : null
  const calcChange = (a, b) => (b && b !== 0) ? Math.round(((a - b) / Math.abs(b)) * 100) : undefined
  const changeBalance  = (currMes && prevMes) ? calcChange(currMes.balance,  prevMes.balance)  : undefined
  const changeIngresos = (currMes && prevMes) ? calcChange(currMes.ingresos, prevMes.ingresos) : undefined
  const changeGastos   = (currMes && prevMes) ? calcChange(currMes.gastos,   prevMes.gastos)   : undefined

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}
      >
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.04em' }}>
            {saludo} 👋
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
            letterSpacing: '-0.04em', lineHeight: 1,
          }}>
            <span className="gradient-text">{user?.nombre?.split(' ')[0]}</span>
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            style={{
              width: 38, height: 38, borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(160deg, rgba(20,25,44,0.9), rgba(12,15,28,0.95))',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 2px 10px rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative',
            }}
          >
            <Bell size={15} color="var(--text-muted)" />
            {proximos?.cuotasPendientes?.length > 0 && (
              <span style={{
                position: 'absolute', top: 7, right: 7,
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--red)',
                boxShadow: '0 0 6px var(--red)',
              }} />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* ── KPI Cards con tilt 3D ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: 14, marginBottom: 24 }}>
        <TiltCard label="Balance total"    value={resumen?.balance}       currency={currency} color={resumen?.balance >= 0 ? 'green' : 'red'} icon={Wallet}      change={changeBalance}  delay={0}    />
        <TiltCard label="Ingresos totales" value={resumen?.totalIngresos} currency={currency} color="blue"   icon={TrendingUp}   change={changeIngresos} delay={0.06} />
        <TiltCard label="Gastos totales"   value={resumen?.totalGastos}   currency={currency} color="orange" icon={TrendingDown}  change={changeGastos}   delay={0.12} />
        <TiltCard label="Deuda activa"     value={resumen?.deudaTotal}    currency={currency} color="purple" icon={Layers}        delay={0.18} />
        <TiltCard label="Saldo tarjetas"   value={resumen?.saldoTarjetas} currency={currency} color="red"   icon={CreditCard}    delay={0.24} />
      </div>

      {/* ── Fila principal ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 18, marginBottom: 18 }}>

        {/* Money Flow chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{
            background: 'linear-gradient(160deg, rgba(18,22,40,0.9) 0%, rgba(11,14,26,0.95) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 'var(--radius-lg)', padding: '22px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 24px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 2 }}>
                Money Flow
              </h2>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Últimos 12 meses</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: 'var(--text-muted)' }}>
              {[['Ingresos', '#5B7AFF'], ['Gastos', '#FF7A4A']].map(([label, color]) => (
                <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 3, background: color, display: 'inline-block', boxShadow: `0 0 6px ${color}` }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {chart.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={chart} barGap={3} barCategoryGap="22%">
                <XAxis dataKey="mes" tick={{ fill: 'rgba(228,232,244,0.25)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(228,232,244,0.22)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} width={38} />
                <Tooltip content={<ChartTooltip currency={currency} />} cursor={{ fill: 'rgba(255,255,255,0.025)', radius: 6 }} />
                <Bar dataKey="ingresos" name="Ingresos" fill="#5B7AFF" shape={<RoundBar />} />
                <Bar dataKey="gastos"   name="Gastos"   fill="#FF7A4A" shape={<RoundBar />} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Sin datos aún
            </div>
          )}
        </motion.div>

        {/* Panel de tarjeta visual */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          style={{
            background: 'linear-gradient(160deg, rgba(18,22,40,0.9) 0%, rgba(11,14,26,0.95) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 'var(--radius-lg)', padding: '22px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 24px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>Mis tarjetas</h2>
            <span style={{ fontSize: 11, color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>Ver todas →</span>
          </div>

          {/* Card visual 3D */}
          <div style={{
            background: 'linear-gradient(135deg, #1a2a5e 0%, #0f1a3e 45%, #1a1048 100%)',
            borderRadius: 16, padding: '22px 20px', marginBottom: 18,
            position: 'relative', overflow: 'hidden', minHeight: 138,
            boxShadow: '0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            {/* Shine */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)', pointerEvents: 'none' }} />
            {/* Glow orbs */}
            <div style={{ position: 'absolute', top: -30, right: -20, width: 110, height: 110, borderRadius: '50%', background: 'rgba(91,122,255,0.25)', filter: 'blur(30px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -25, left: 10, width: 90, height: 90, borderRadius: '50%', background: 'rgba(157,127,255,0.2)', filter: 'blur(25px)', pointerEvents: 'none' }} />

            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 4, letterSpacing: '0.08em', position: 'relative' }}>FUNDLY</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 14, letterSpacing: '0.15em', position: 'relative', fontFamily: 'var(--font-mono)' }}>•••• •••• •••• 4291</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4, position: 'relative' }}>Cupo disponible</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: '#fff', position: 'relative', letterSpacing: '-0.02em' }}>
              {formatMoney(resumen?.cupoDisponibleTotal || 0, currency)}
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[{ label: 'Enviar', icon: '↑' }, { label: 'Recibir', icon: '↓' }].map(a => (
              <button key={a.label} style={{
                padding: '9px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.2s', fontFamily: 'var(--font-body)',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,122,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(91,122,255,0.25)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                <span>{a.icon}</span>{a.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Fila inferior ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18 }}>

        {/* Historial de transacciones */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{
            background: 'linear-gradient(160deg, rgba(18,22,40,0.9) 0%, rgba(11,14,26,0.95) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 'var(--radius-lg)', padding: '22px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 24px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 2 }}>
                Transacciones recientes
              </h2>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Últimas actividades</p>
            </div>
          </div>

          {transacciones.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>Sin transacciones aún</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {transacciones.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i + 0.4 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                    transition: 'background 0.2s', cursor: 'default',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: t._tipo === 'ingreso' ? 'rgba(91,122,255,0.15)' : 'rgba(255,122,74,0.15)',
                    border: `1px solid ${t._tipo === 'ingreso' ? 'rgba(91,122,255,0.25)' : 'rgba(255,122,74,0.25)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, color: t._tipo === 'ingreso' ? 'var(--blue)' : 'var(--orange)',
                    boxShadow: `0 2px 8px ${t._tipo === 'ingreso' ? 'rgba(91,122,255,0.2)' : 'rgba(255,122,74,0.2)'}`,
                  }}>
                    {t._tipo === 'ingreso' ? '↑' : '↓'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.tipo || t.categoria}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {formatDate(t.fecha, 'dd MMM, p')}
                    </div>
                  </div>

                  {/* Category badge */}
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 99, flexShrink: 0,
                    fontWeight: 600, letterSpacing: '0.03em',
                    background: t._tipo === 'ingreso' ? 'rgba(91,122,255,0.12)' : 'rgba(255,122,74,0.12)',
                    color: t._tipo === 'ingreso' ? 'var(--blue)' : 'var(--orange)',
                    border: `1px solid ${t._tipo === 'ingreso' ? 'rgba(91,122,255,0.2)' : 'rgba(255,122,74,0.2)'}`,
                  }}>
                    {t._tipo === 'ingreso' ? 'Ingreso' : t.categoria}
                  </span>

                  {/* Amount */}
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, flexShrink: 0,
                    color: t._tipo === 'ingreso' ? 'var(--blue)' : 'var(--orange)',
                  }}>
                    {t._tipo === 'ingreso' ? '+' : '-'}{formatMoney(t.monto, currency)}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Desglose financiero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          style={{
            background: 'linear-gradient(160deg, rgba(18,22,40,0.9) 0%, rgba(11,14,26,0.95) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 'var(--radius-lg)', padding: '22px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 24px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Desglose
          </h2>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 18 }}>Resumen financiero</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Balance',   value: resumen?.balance       || 0, color: resumen?.balance >= 0 ? '#2EE086' : '#FF4D72', bg: resumen?.balance >= 0 ? 'rgba(46,224,134,0.08)' : 'rgba(255,77,114,0.08)', border: resumen?.balance >= 0 ? 'rgba(46,224,134,0.15)' : 'rgba(255,77,114,0.15)' },
              { label: 'Ingresos',  value: resumen?.totalIngresos || 0, color: '#5B7AFF', bg: 'rgba(91,122,255,0.08)',  border: 'rgba(91,122,255,0.15)'  },
              { label: 'Gastos',    value: resumen?.totalGastos   || 0, color: '#FF7A4A', bg: 'rgba(255,122,74,0.08)', border: 'rgba(255,122,74,0.15)'  },
              { label: 'Deudas',    value: resumen?.deudaTotal    || 0, color: '#9D7FFF', bg: 'rgba(157,127,255,0.08)', border: 'rgba(157,127,255,0.15)' },
            ].map(({ label, value, color, bg, border }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                background: bg, border: `1px solid ${border}`,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05)`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: color, display: 'inline-block', boxShadow: `0 0 6px ${color}` }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color }}>{formatMoney(value, currency)}</span>
              </div>
            ))}
          </div>

          {/* Próximas cuotas */}
          {proximos?.cuotasPendientes?.length > 0 && (
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Próximas cuotas
              </p>
              {proximos.cuotasPendientes.slice(0, 3).map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.deuda?.entidad}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--orange)' }}>
                    {formatMoney(c.cuota, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
