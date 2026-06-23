import { motion } from 'framer-motion'
import { formatMoney } from '../../utils/helpers'

export default function StatCard({ label, value, isMoney = true, currency = 'USD', color = 'accent', icon: Icon, trend, delay = 0 }) {
  const colors = {
    accent: { glow: 'var(--accent)', dim: 'var(--accent-dim)' },
    green: { glow: 'var(--green)', dim: 'var(--green-dim)' },
    red: { glow: 'var(--red)', dim: 'var(--red-dim)' },
    amber: { glow: 'var(--amber)', dim: 'var(--amber-dim)' },
  }
  const c = colors[color] || colors.accent

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 22px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle glow bg */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 80, height: 80,
        background: `radial-gradient(circle, ${c.dim} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        {Icon && (
          <div style={{ width: 32, height: 32, borderRadius: 8, background: c.dim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={15} color={c.glow} />
          </div>
        )}
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {isMoney ? formatMoney(value, currency) : value}
      </div>

      {trend !== undefined && (
        <div style={{ marginTop: 8, fontSize: 12, color: trend >= 0 ? 'var(--green)' : 'var(--red)' }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs mes anterior
        </div>
      )}
    </motion.div>
  )
}
