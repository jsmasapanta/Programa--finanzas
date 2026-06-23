import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, Trash2 } from 'lucide-react'
import { cn } from '../../utils/helpers'

/* ── Button ─────────────────────────────────────────────────────────────────── */
export function Button({ children, variant = 'primary', size = 'md', loading, className, ...props }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s cubic-bezier(0.34,1.1,0.64,1)',
    border: 'none', fontFamily: 'var(--font-body)', position: 'relative', overflow: 'hidden',
    opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto',
  }

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #5B7AFF 0%, #7B68EE 100%)',
      color: '#fff', borderRadius: 'var(--radius-md)',
      boxShadow: '0 4px 20px rgba(91,122,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
    },
    secondary: {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: 'var(--text-primary)', borderRadius: 'var(--radius-md)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
    },
    danger: {
      background: 'linear-gradient(135deg, #FF4D72, #E03060)',
      color: '#fff', borderRadius: 'var(--radius-md)',
      boxShadow: '0 4px 16px rgba(255,77,114,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
    },
    ghost: {
      background: 'transparent', color: 'var(--text-secondary)',
      borderRadius: 'var(--radius-sm)',
    },
    success: {
      background: 'linear-gradient(135deg, #2EE086, #22C55E)',
      color: '#0A0F08', borderRadius: 'var(--radius-md)',
      boxShadow: '0 4px 16px rgba(46,224,134,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
    },
  }

  const sizes = {
    sm: { padding: '6px 14px', fontSize: 12, borderRadius: 'var(--radius-sm)' },
    md: { padding: '10px 20px', fontSize: 13 },
    lg: { padding: '14px 28px', fontSize: 14 },
  }

  return (
    <motion.button
      whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
      whileTap={!loading ? { scale: 0.97 } : {}}
      style={{ ...base, ...variants[variant], ...sizes[size] }}
      className={className}
      {...props}
    >
      {loading && (
        <span style={{
          width: 14, height: 14,
          border: '2px solid currentColor', borderTopColor: 'transparent',
          borderRadius: '50%', display: 'inline-block',
          animation: 'spin 0.6s linear infinite',
        }} />
      )}
      {children}
    </motion.button>
  )
}

/* ── Input ──────────────────────────────────────────────────────────────────── */
export function Input({ label, error, className, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${error ? 'rgba(255,77,114,0.5)' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: `inset 0 2px 6px rgba(0,0,0,0.3)${error ? ', 0 0 0 3px rgba(255,77,114,0.12)' : ''}`,
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          fontSize: 14, color: 'var(--text-primary)',
          outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onFocus={e => {
          e.target.style.borderColor = error ? 'rgba(255,77,114,0.6)' : 'rgba(91,122,255,0.5)'
          e.target.style.boxShadow = `inset 0 2px 6px rgba(0,0,0,0.3), 0 0 0 3px ${error ? 'rgba(255,77,114,0.12)' : 'rgba(91,122,255,0.15)'}`
        }}
        onBlur={e => {
          e.target.style.borderColor = error ? 'rgba(255,77,114,0.5)' : 'rgba(255,255,255,0.08)'
          e.target.style.boxShadow = `inset 0 2px 6px rgba(0,0,0,0.3)${error ? ', 0 0 0 3px rgba(255,77,114,0.12)' : ''}`
        }}
        className={className}
        {...props}
      />
      {error && <span style={{ fontSize: 12, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}>{error}</span>}
    </div>
  )
}

/* ── Select ─────────────────────────────────────────────────────────────────── */
export function Select({ label, error, children, className, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
          {label}
        </label>
      )}
      <select
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${error ? 'rgba(255,77,114,0.5)' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          fontSize: 14, color: 'var(--text-primary)',
          outline: 'none', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onFocus={e => {
          e.target.style.borderColor = 'rgba(91,122,255,0.5)'
          e.target.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.3), 0 0 0 3px rgba(91,122,255,0.15)'
        }}
        onBlur={e => {
          e.target.style.borderColor = error ? 'rgba(255,77,114,0.5)' : 'rgba(255,255,255,0.08)'
          e.target.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.3)'
        }}
        className={className}
        {...props}
      >
        {children}
      </select>
      {error && <span style={{ fontSize: 12, color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}

/* ── Modal ──────────────────────────────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, size = 'md' }) {
  const sizes = { sm: 420, md: 560, lg: 720, xl: 900 }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(4,6,14,0.82)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            style={{
              width: '100%', maxWidth: sizes[size],
              background: 'linear-gradient(160deg, rgba(18,22,40,0.98) 0%, rgba(10,13,24,0.99) 100%)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto',
              boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
              backdropFilter: 'blur(32px)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '18px 24px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>
                {title}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,77,114,0.15)'; e.currentTarget.style.color = 'var(--red)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                <X size={14} />
              </motion.button>
            </div>
            <div style={{ padding: '22px 24px 24px' }}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Badge ──────────────────────────────────────────────────────────────────── */
export function Badge({ children, color = 'accent' }) {
  const colors = {
    accent: { bg: 'rgba(91,122,255,0.14)',  border: 'rgba(91,122,255,0.25)',  text: 'var(--accent)' },
    green:  { bg: 'rgba(46,224,134,0.12)',  border: 'rgba(46,224,134,0.22)',  text: 'var(--green)'  },
    red:    { bg: 'rgba(255,77,114,0.12)',  border: 'rgba(255,77,114,0.22)',  text: 'var(--red)'    },
    amber:  { bg: 'rgba(245,166,35,0.13)',  border: 'rgba(245,166,35,0.24)',  text: 'var(--amber)'  },
    purple: { bg: 'rgba(157,127,255,0.13)', border: 'rgba(157,127,255,0.23)', text: 'var(--purple)' },
    gray:   { bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.1)',  text: 'var(--text-secondary)' },
  }
  const c = colors[color] || colors.gray
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 99,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
    }}>
      {children}
    </span>
  )
}

/* ── Spinner ────────────────────────────────────────────────────────────────── */
export function Spinner({ size = 24 }) {
  return (
    <div style={{
      width: size, height: size,
      border: '2px solid rgba(91,122,255,0.2)',
      borderTopColor: 'var(--accent)',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      boxShadow: '0 0 12px rgba(91,122,255,0.3)',
    }} />
  )
}

/* ── Empty State ────────────────────────────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      {Icon && (
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: 'rgba(91,122,255,0.1)',
          border: '1px solid rgba(91,122,255,0.2)',
          boxShadow: '0 4px 20px rgba(91,122,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4,
        }}>
          <Icon size={26} color="var(--accent)" />
        </div>
      )}
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</h3>
      {description && <p style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 280, lineHeight: 1.6 }}>{description}</p>}
      {action}
    </div>
  )
}

/* ── Confirm Dialog ─────────────────────────────────────────────────────────── */
export function ConfirmDialog({ open, onClose, onConfirm, title, description, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div style={{ display: 'flex', gap: 14, marginBottom: 22 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: 'rgba(255,77,114,0.1)', border: '1px solid rgba(255,77,114,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AlertTriangle size={18} color="var(--red)" />
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{description}</p>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          <Trash2 size={14} /> Eliminar
        </Button>
      </div>
    </Modal>
  )
}
