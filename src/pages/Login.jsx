import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Zap } from 'lucide-react'
import { authService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/helpers'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authService.login(form)
      login(res.data.token, res.data.user)
      toast.success(`Bienvenido, ${res.data.user.nombre}`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', padding: 16,
      overflow: 'hidden',
    }}>
      {/* Extra ambient orbs */}
      <div style={{
        position: 'fixed', top: '20%', left: '15%',
        width: '35vw', height: '35vw',
        background: 'radial-gradient(ellipse, rgba(91,122,255,0.12) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
        animation: 'aurora1 18s ease-in-out infinite alternate',
      }} />
      <div style={{
        position: 'fixed', bottom: '15%', right: '10%',
        width: '30vw', height: '30vw',
        background: 'radial-gradient(ellipse, rgba(157,127,255,0.1) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
        animation: 'aurora2 24s ease-in-out infinite alternate',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.1, 0.64, 1] }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
            style={{ display: 'inline-flex', position: 'relative', marginBottom: 18 }}
          >
            <div style={{
              position: 'absolute', inset: -8,
              background: 'radial-gradient(circle, rgba(91,122,255,0.5) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(10px)',
              animation: 'pulse-glow 3s ease-in-out infinite',
            }} />
            <div style={{
              width: 60, height: 60, borderRadius: 18,
              background: 'linear-gradient(135deg, #5B7AFF 0%, #9D7FFF 100%)',
              boxShadow: '0 8px 32px rgba(91,122,255,0.5), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 800, color: '#fff',
              fontFamily: 'var(--font-display)',
              position: 'relative',
            }}>
              <Zap size={28} fill="#fff" strokeWidth={0} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 6 }}>
              <span className="gradient-text">Bienvenido</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Inicia sesión para acceder a tu cuenta</p>
          </motion.div>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="shimmer-border"
          style={{
            background: 'linear-gradient(160deg, rgba(18,22,40,0.92) 0%, rgba(10,13,24,0.96) 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px 30px',
            backdropFilter: 'blur(32px)',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="tu@email.com"
                required
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 15px',
                  fontSize: 14, color: 'var(--text-primary)',
                  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(91,122,255,0.5)'
                  e.target.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.3), 0 0 0 3px rgba(91,122,255,0.15)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.target.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.3)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 44px 12px 15px',
                    fontSize: 14, color: 'var(--text-primary)',
                    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(91,122,255,0.5)'
                    e.target.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.3), 0 0 0 3px rgba(91,122,255,0.15)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                    e.target.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.3)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', background: 'none', border: 'none',
                    cursor: 'pointer', padding: 2, display: 'flex', transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.015 } : {}}
              whileTap={!loading ? { scale: 0.985 } : {}}
              style={{
                width: '100%', padding: '14px',
                marginTop: 4,
                borderRadius: 'var(--radius-md)',
                background: loading
                  ? 'rgba(91,122,255,0.4)'
                  : 'linear-gradient(135deg, #5B7AFF 0%, #7B68EE 100%)',
                border: 'none',
                boxShadow: loading ? 'none' : '0 4px 24px rgba(91,122,255,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
                color: '#fff', fontSize: 14, fontWeight: 700,
                fontFamily: 'var(--font-display)',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '-0.01em',
                transition: 'all 0.25s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading && (
                <span style={{
                  width: 16, height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.6s linear infinite',
                }} />
              )}
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </motion.button>
          </form>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ textAlign: 'center', marginTop: 22, fontSize: 14, color: 'var(--text-muted)' }}
        >
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Crear cuenta
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}
