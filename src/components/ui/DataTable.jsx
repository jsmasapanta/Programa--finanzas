import { motion } from 'framer-motion'
import { Spinner } from './index'

export default function DataTable({ columns, data, loading, keyField = 'id' }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Spinner size={32} />
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{
                textAlign: col.align || 'left',
                padding: '10px 16px',
                fontSize: 11, fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                borderBottom: '1px solid var(--border)',
                whiteSpace: 'nowrap',
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <motion.tr
              key={row[keyField] || i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              style={{ borderBottom: '1px solid var(--border)', transition: '0.15s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              {columns.map((col) => (
                <td key={col.key} style={{
                  padding: '13px 16px',
                  fontSize: 14,
                  textAlign: col.align || 'left',
                  color: col.color ? col.color(row) : 'var(--text-primary)',
                  fontFamily: col.mono ? 'var(--font-mono)' : 'inherit',
                }}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
