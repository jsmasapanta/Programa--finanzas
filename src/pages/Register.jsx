import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Sparkles } from 'lucide-react'
import { authService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage, MONEDAS } from '../utils/helpers'

const inputBase = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)',
  borderRadius: 'var(--radius-md)',
  padding: '11px 14px',
  fontSize: 14, color: 'var(--text-primary)',
  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
}

const focusStyle = (e) => {
  e.target.style.borderColor = 'rgba(91,122,255,0.5)'
  e.target.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.3), 0 0 0 3px rgba(91,122,255,0.15)'
}
const blurStyle = (e) => {
  e.target.style.borderColor = 'rgba(255,255,255,0.08)'
  e.target.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.3)'
}

export default function Register() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', moneda: 'USD' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('La contraseña debe tener mínimo 6 caracteres')
    setLoading(true)
    try {
      const res = await authService.register(form)
      login(res.data.token, res.data.user)
      toast.success('¡Cuenta creada exitosamente!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: 16 }}>
      {/* Ambient orbs */}
      <div style={{ position: 'fixed', top: '15%', right: '10%', width: '38vw', height: '38vw', background: 'radial-gradient(ellipse, rgba(157,127,255,0.1) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none', animation: 'aurora1 20s ease-in-out infinite alternate' }} />
      <div style={{ position: 'fixed', bottom: '10%', left: '5%', width: '30vw', height: '30vw', background: 'radial-gradient(ellipse, rgba(91,122,255,0.09) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none', animation: 'aurora2 26s ease-in-out infinite alternate' }} />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.1, 0.64, 1] }}
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
            style={{ display: 'inline-flex', position: 'relative', marginBottom: 16 }}>
            <div style={{ position: 'absolute', inset: -8, background: 'radial-gradient(circle, rgba(157,127,255,0.45) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(10px)', animation: 'pulse-glow 3s ease-in-out infinite' }} />
            <div style={{ width: 58, height: 58, borderRadius: 18, background: 'linear-gradient(135deg, #9D7FFF 0%, #5B7AFF 100%)', boxShadow: '0 8px 32px rgba(157,127,255,0.45), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Sparkles size={26} color="#fff" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 6 }}>
              <span className="gradient-text">Crear cuenta</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Empieza a controlar tus finanzas hoy</p>
          </motion.div>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="shimmer-border"
          style={{ background: 'linear-gradient(160deg, rgba(18,22,40,0.92) 0%, rgba(10,13,24,0.96) 100%)', borderRadius: 'var(--radius-xl)', padding: '30px 28px', backdropFilter: 'blur(32px)', boxShadow: 'var(--shadow-xl)' }}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { key: 'nombre',   label: 'Nombre completo',     type: 'text',     placeholder: 'Ana García' },
              { key: 'email',    label: 'Correo electrónico',   type: 'email',    placeholder: 'ana@email.com' },
              { key: 'password', label: 'Contraseña',           type: 'password', placeholder: '••••••••' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
                  {label}
                </label>
                <input
                  type={type} value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  placeholder={placeholder} required
                  style={inputBase}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
            ))}

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
                Moneda principal
              </label>
              <select
                value={form.moneda}
                onChange={e => set('moneda', e.target.value)}
                style={{ ...inputBase, cursor: 'pointer' }}
                onFocus={focusStyle}
                onBlur={blurStyle}
              >
                {MONEDAS.map(m => <option key={m} value={m} style={{ background: '#0E1220' }}>{m}</option>)}
              </select>
            </div>

            <motion.button
              type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.015 } : {}}
              whileTap={!loading ? { scale: 0.985 } : {}}
              style={{
                width: '100%', padding: '14px', marginTop: 6,
                borderRadius: 'var(--radius-md)',
                background: loading
                  ? 'rgba(157,127,255,0.4)'
                  : 'linear-gradient(135deg, #9D7FFF 0%, #5B7AFF 100%)',
                border: 'none',
                boxShadow: loading ? 'none' : '0 4px 24px rgba(157,127,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                color: '#fff', fontSize: 14, fontWeight: 700,
                fontFamily: 'var(--font-display)', letterSpacing: '-0.01em',
                cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.25s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading && <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />}
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </motion.button>
          </form>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ textAlign: 'center', marginTop: 22, fontSize: 14, color: 'var(--text-muted)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Inicia sesión
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}
