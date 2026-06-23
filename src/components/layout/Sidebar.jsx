import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, TrendingDown, TrendingUp,
  CreditCard, Wallet, DollarSign, BarChart3,
  TableProperties, LogOut,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/ingresos',     icon: TrendingUp,      label: 'Ingresos' },
  { to: '/gastos',       icon: TrendingDown,    label: 'Gastos' },
  { to: '/deudas',       icon: Wallet,          label: 'Deudas' },
  { to: '/tarjetas',     icon: CreditCard,      label: 'Tarjetas' },
  { to: '/pagos',        icon: DollarSign,      label: 'Pagos' },
  { to: '/amortizacion', icon: TableProperties, label: 'Amortización' },
  { to: '/reportes',     icon: BarChart3,       label: 'Reportes' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initial = user?.nombre?.charAt(0)?.toUpperCase() || '?'

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      height: '100vh',
      position: 'fixed',
      left: 0, top: 0,
      background: 'rgba(10,13,24,0.92)',
      backdropFilter: 'blur(32px) saturate(160%)',
      WebkitBackdropFilter: 'blur(32px) saturate(160%)',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      boxShadow: '4px 0 40px rgba(0,0,0,0.5), inset -1px 0 0 rgba(255,255,255,0.04)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      overflowY: 'auto',
    }}>

      {/* ── Logo ── */}
      <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {/* Glow behind logo */}
            <div style={{
              position: 'absolute', inset: -4,
              background: 'radial-gradient(circle, rgba(91,122,255,0.5) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(6px)',
              animation: 'pulse-glow 3s ease-in-out infinite',
            }} />
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #5B7AFF 0%, #9D7FFF 100%)',
              boxShadow: '0 4px 16px rgba(91,122,255,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 800, color: '#fff',
              fontFamily: 'var(--font-display)',
              position: 'relative',
            }}>F</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              Fundly
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>Finance OS</div>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 10px 10px' }}>
          Navegación
        </div>

        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={{ display: 'block', marginBottom: 2 }}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 11px',
                  borderRadius: 'var(--radius-md)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(91,122,255,0.18) 0%, rgba(157,127,255,0.1) 100%)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid rgba(91,122,255,0.25)'
                    : '1px solid transparent',
                  boxShadow: isActive
                    ? 'inset 0 1px 0 rgba(255,255,255,0.07), 0 2px 12px rgba(91,122,255,0.15)'
                    : 'none',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                {/* Active left accent */}
                {isActive && (
                  <div style={{
                    position: 'absolute', left: -10, top: '50%', transform: 'translateY(-50%)',
                    width: 3, height: 18, borderRadius: 99,
                    background: 'linear-gradient(180deg, #5B7AFF, #9D7FFF)',
                    boxShadow: '0 0 8px rgba(91,122,255,0.7)',
                  }} />
                )}

                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? 'rgba(91,122,255,0.2)' : 'transparent',
                  transition: 'background 0.2s',
                }}>
                  <Icon size={14} color={isActive ? 'var(--accent)' : 'var(--text-muted)'} />
                </div>

                <span style={{
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  letterSpacing: '-0.01em',
                }}>
                  {label}
                </span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User ── */}
      <div style={{ padding: '10px 10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <NavLink to="/perfil" style={{ display: 'block', marginBottom: 6 }}>
          {({ isActive }) => (
            <motion.div
              whileHover={{ x: 2 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 10px', borderRadius: 'var(--radius-md)',
                cursor: 'pointer', transition: 'background 0.2s',
                background: isActive ? 'rgba(91,122,255,0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(91,122,255,0.15)' : '1px solid transparent',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              {/* Avatar with gradient ring */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  position: 'absolute', inset: -2,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #5B7AFF, #9D7FFF)',
                  opacity: 0.7,
                }} />
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1a2040, #0d1020)',
                  border: '2px solid var(--bg-surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff',
                  position: 'relative',
                }}>
                  {initial}
                </div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.nombre}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {user?.email?.split('@')[0]}
                </div>
              </div>
            </motion.div>
          )}
        </NavLink>

        <button
          onClick={() => { logout(); navigate('/login') }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 9,
            padding: '7px 10px', borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
            background: 'none', border: '1px solid transparent', transition: '0.2s',
            fontFamily: 'var(--font-body)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--red)'
            e.currentTarget.style.background = 'var(--red-dim)'
            e.currentTarget.style.borderColor = 'rgba(255,77,114,0.2)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-muted)'
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'transparent'
          }}
        >
          <LogOut size={13} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
