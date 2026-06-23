import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts'
import { reportesService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { formatMoney, formatDate } from '../utils/helpers'
import PageHeader from '../components/layout/PageHeader'
import { Spinner, Badge } from '../components/ui'

const COLORS = ['#6C63FF', '#00D4AA', '#FF4D6D', '#FFB547', '#A78BFA', '#34D399', '#F472B6']

const ChartCard = ({ title, children, style }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px 20px', ...style }}>
    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 20 }}>{title}</h3>
    {children}
  </motion.div>
)

const tipStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }

export default function Reportes() {
  const { user } = useAuth()
  const [resumen, setResumen] = useState(null)
  const [ingresosVsGastos, setIngresosVsGastos] = useState([])
  const [gastosCat, setGastosCat] = useState([])
  const [deudas, setDeudas] = useState(null)
  const [flujo, setFlujo] = useState([])
  const [proximos, setProximos] = useState(null)
  const [meses, setMeses] = useState(6)
  const [loading, setLoading] = useState(true)
  const currency = user?.moneda || 'USD'

  useEffect(() => {
    setLoading(true)
    Promise.all([
      reportesService.resumen(),
      reportesService.ingresosVsGastos({ meses }),
      reportesService.gastosPorCategoria(),
      reportesService.deudas(),
      reportesService.flujoCaja({ meses: 3 }),
      reportesService.proximosPagos({ dias: 30 }),
    ]).then(([r, ivg, gc, d, f, p]) => {
      setResumen(r.data)
      setIngresosVsGastos(ivg.data)
      setGastosCat(gc.data?.data || [])
      setDeudas(d.data)
      setFlujo(f.data?.proyeccionMensual || [])
      setProximos(p.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [meses])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={40} /></div>

  const fmt = v => formatMoney(v, currency)

  return (
    <div>
      <PageHeader title="Reportes" subtitle="Análisis visual de tu situación financiera" />

      {/* KPIs rápidos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Balance', value: resumen?.balance, color: resumen?.balance >= 0 ? 'var(--green)' : 'var(--red)' },
          { label: 'Total ingresos', value: resumen?.totalIngresos, color: 'var(--green)' },
          { label: 'Total gastos', value: resumen?.totalGastos, color: 'var(--red)' },
          { label: 'Deuda total', value: resumen?.deudaTotal, color: 'var(--amber)' },
          { label: 'Cupo disponible', value: resumen?.cupoDisponibleTotal, color: 'var(--accent)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color }}>{fmt(value || 0)}</div>
          </div>
        ))}
      </div>

      {/* Ingresos vs Gastos */}
      <ChartCard title="Ingresos vs Gastos" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[3, 6, 12].map(m => (
            <button key={m} onClick={() => setMeses(m)}
              style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid', borderColor: meses === m ? 'var(--accent)' : 'var(--border)', background: meses === m ? 'var(--accent-dim)' : 'transparent', color: meses === m ? 'var(--accent)' : 'var(--text-muted)', transition: '0.15s' }}>
              {m} meses
            </button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={ingresosVsGastos} barCategoryGap="30%">
            <XAxis dataKey="mes" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} width={80} />
            <Tooltip contentStyle={tipStyle} formatter={v => fmt(v)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="ingresos" name="Ingresos" fill="#00D4AA" radius={[4, 4, 0, 0]} />
            <Bar dataKey="gastos" name="Gastos" fill="#FF4D6D" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Fila: Gastos por categoría + Deudas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <ChartCard title="Gastos por categoría">
          {gastosCat.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={gastosCat} dataKey="total" nameKey="categoria" cx="50%" cy="50%" innerRadius={50} outerRadius={80} strokeWidth={0} paddingAngle={2}>
                    {gastosCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tipStyle} formatter={v => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {gastosCat.slice(0, 6).map((c, i) => (
                  <div key={c.categoria} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{c.categoria}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{fmt(c.total)}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{c.porcentaje}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40, fontSize: 13 }}>Sin datos</p>}
        </ChartCard>

        <ChartCard title="Estado de deudas">
          {deudas ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Total original', value: fmt(deudas.totalOriginal), color: 'var(--text-primary)' },
                  { label: 'Pendiente', value: fmt(deudas.totalPendiente), color: 'var(--amber)' },
                  { label: '% pagado', value: `${deudas.porcentajePagado}%`, color: 'var(--green)' },
                  { label: 'N° deudas', value: deudas.cantidadDeudas, color: 'var(--text-primary)' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color }}>{value}</div>
                  </div>
                ))}
              </div>
              {/* Progreso de pago */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                  <span>Progreso de pago global</span>
                  <span style={{ color: 'var(--green)', fontWeight: 600 }}>{deudas.porcentajePagado}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${deudas.porcentajePagado}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                    style={{ height: '100%', background: 'var(--green)', borderRadius: 99 }} />
                </div>
              </div>
              {/* Por estado */}
              {Object.entries(deudas.porEstado || {}).map(([estado, count]) => (
                <div key={estado} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <Badge color={{ ACTIVA: 'accent', PAGADA: 'green', EN_MORA: 'red', REFINANCIADA: 'amber' }[estado] || 'gray'}>{estado}</Badge>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{count} deuda{count !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </>
          ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40, fontSize: 13 }}>Sin datos</p>}
        </ChartCard>
      </div>

      {/* Flujo de caja proyectado */}
      {flujo.length > 0 && (
        <ChartCard title="Proyección de cuotas (próximos meses)" style={{ marginBottom: 20 }}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={flujo}>
              <XAxis dataKey="mes" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} width={80} />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <Tooltip contentStyle={tipStyle} formatter={v => fmt(v)} />
              <Line dataKey="totalCuotas" name="Total cuotas" stroke="var(--accent)" strokeWidth={2.5} dot={{ fill: 'var(--accent)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Próximas cuotas */}
      {proximos?.cuotasPendientes?.length > 0 && (
        <ChartCard title="Cuotas vencen en los próximos 30 días">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {proximos.cuotasPendientes.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{c.deuda?.entidad} — Cuota #{c.numeroCuota}</span>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{formatDate(c.fechaPago)}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: 'var(--amber)' }}>{fmt(c.cuota)}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  )
}
