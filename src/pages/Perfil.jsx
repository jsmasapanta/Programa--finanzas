import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { User, Lock, Globe } from 'lucide-react'
import { authService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage, MONEDAS } from '../utils/helpers'
import PageHeader from '../components/layout/PageHeader'
import { Button } from '../components/ui'

export default function Perfil() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ nombre: user?.nombre || '', moneda: user?.moneda || 'USD', salarioMensual: user?.salarioMensual || '', alertasActivas: user?.alertasActivas ?? true })
  const [passForm, setPassForm] = useState({ passwordActual: '', passwordNueva: '', confirm: '' })
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingPass, setLoadingPass] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const setPass = (k, v) => setPassForm(p => ({ ...p, [k]: v }))

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoadingProfile(true)
    try {
      const res = await authService.updateProfile({ nombre: form.nombre, moneda: form.moneda, salarioMensual: form.salarioMensual || null, alertasActivas: form.alertasActivas })
      updateUser(res.data.user)
      toast.success('Perfil actualizado correctamente')
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setLoadingProfile(false) }
  }

  const handleUpdatePass = async (e) => {
    e.preventDefault()
    if (passForm.passwordNueva !== passForm.confirm) return toast.error('Las contraseñas nuevas no coinciden')
    if (passForm.passwordNueva.length < 6) return toast.error('La nueva contraseña debe tener mínimo 6 caracteres')
    setLoadingPass(true)
    try {
      await authService.updateProfile({ passwordActual: passForm.passwordActual, passwordNueva: passForm.passwordNueva })
      toast.success('Contraseña cambiada correctamente')
      setPassForm({ passwordActual: '', passwordNueva: '', confirm: '' })
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setLoadingPass(false) }
  }

  const inp = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 14, color: 'var(--text-primary)', outline: 'none' }
  const lbl = (t) => <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>{t}</label>
  const fo = e => e.target.style.borderColor = 'var(--accent)'
  const bl = e => e.target.style.borderColor = 'var(--border)'

  const Section = ({ icon: Icon, title, children }) => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color="var(--accent)" />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700 }}>{title}</h2>
      </div>
      {children}
    </motion.div>
  )

  return (
    <div style={{ maxWidth: 640 }}>
      <PageHeader title="Mi perfil" subtitle="Gestiona tu información y preferencias" />

      {/* Avatar info */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '22px 28px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #9B8FFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', flexShrink: 0 }}>
          {user?.nombre?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>{user?.nombre}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{user?.email}</div>
        </div>
      </motion.div>

      {/* Datos personales */}
      <Section icon={User} title="Información personal">
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            {lbl('Nombre completo')}
            <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required style={inp} onFocus={fo} onBlur={bl} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              {lbl('Moneda preferida')}
              <select value={form.moneda} onChange={e => set('moneda', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                {MONEDAS.map(m => <option key={m} value={m} style={{ background: 'var(--bg-elevated)' }}>{m}</option>)}
              </select>
            </div>
            <div>
              {lbl('Salario mensual (opcional)')}
              <input type="number" step="0.01" min="0" value={form.salarioMensual} onChange={e => set('salarioMensual', e.target.value)} placeholder="0.00" style={inp} onFocus={fo} onBlur={bl} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={form.alertasActivas} onChange={e => set('alertasActivas', e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }} />
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Recibir alertas de vencimientos</span>
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" type="submit" loading={loadingProfile}>Guardar cambios</Button>
          </div>
        </form>
      </Section>

      {/* Cambiar contraseña */}
      <Section icon={Lock} title="Cambiar contraseña">
        <form onSubmit={handleUpdatePass} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            {lbl('Contraseña actual')}
            <input type="password" value={passForm.passwordActual} onChange={e => setPass('passwordActual', e.target.value)} required placeholder="••••••••" style={inp} onFocus={fo} onBlur={bl} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              {lbl('Nueva contraseña')}
              <input type="password" value={passForm.passwordNueva} onChange={e => setPass('passwordNueva', e.target.value)} required placeholder="Mínimo 6 caracteres" style={inp} onFocus={fo} onBlur={bl} />
            </div>
            <div>
              {lbl('Confirmar nueva contraseña')}
              <input type="password" value={passForm.confirm} onChange={e => setPass('confirm', e.target.value)} required placeholder="••••••••" style={inp} onFocus={fo} onBlur={bl} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="secondary" type="submit" loading={loadingPass}>Cambiar contraseña</Button>
          </div>
        </form>
      </Section>
    </div>
  )
}
