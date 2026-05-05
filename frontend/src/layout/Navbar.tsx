import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'

const navItems = [
  { label: 'HOME',       to: '/' },
  { label: 'PROBLEMSET', to: '/problems' },
  { label: 'CONTESTS',   to: '/contests' },
]

export default function Navbar() {
  const [token, setToken]       = useState(localStorage.getItem('token'))
  const [username, setUsername] = useState(localStorage.getItem('username'))

  useEffect(() => {
    const sync = () => {
      setToken(localStorage.getItem('token'))
      setUsername(localStorage.getItem('username'))
    }
    window.addEventListener('storage', sync)
    window.addEventListener('localStorageChange', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('localStorageChange', sync)
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    window.location.href = '/login' 
  }

  return (
    <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', borderBottom: '1px solid #ccc' }}>

      {/* Top bar — logo + user */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 20px',
        background: '#fff',
      }}>
        <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-1px' }}>
            <span style={{ color: '#1a1aff' }}>CODE</span><span style={{ color: '#e03030' }}>FORCES</span>
          </span>
        </NavLink>

        <div style={{ fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          {token ? (
            <>
              <NavLink to={`/users/${username}`} style={{ color: '#1a1aff', textDecoration: 'none', fontWeight: 600 }}>
                {username}
              </NavLink>
              <span style={{ color: '#999' }}>|</span>
              <button
                onClick={logout}
                style={{ background: 'none', border: 'none', color: '#1a1aff', cursor: 'pointer', padding: 0, fontSize: '13px', fontWeight: 600 }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login"    style={{ color: '#1a1aff', textDecoration: 'none', fontWeight: 600 }}>Login</NavLink>
              <span style={{ color: '#999' }}>|</span>
              <NavLink to="/register" style={{ color: '#1a1aff', textDecoration: 'none', fontWeight: 600 }}>Register</NavLink>
            </>
          )}
        </div>
      </div>

      {/* Nav links bar */}
      <div style={{
        background: '#fff',
        borderTop: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
      }}>
        <div style={{ display: 'flex' }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                padding: '10px 12px',
                color: isActive ? '#1a1aff' : '#444',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '13px',
                borderBottom: isActive ? '2px solid #1a1aff' : '2px solid transparent',
                display: 'inline-block',
              })}
            >
              {item.label}
            </NavLink>
          ))}
          {token && (
            <NavLink
              to="/problems/new"
              style={({ isActive }) => ({
                padding: '10px 12px',
                color: isActive ? '#1a1aff' : '#444',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '13px',
                borderBottom: isActive ? '2px solid #1a1aff' : '2px solid transparent',
                display: 'inline-block',
              })}
            >
              + PROBLEM
            </NavLink>
          )}
        </div>

        {/* Search box */}
        <input
          type="text"
          placeholder="🔍"
          style={{
            border: '1px solid #ccc',
            borderRadius: '2px',
            padding: '4px 8px',
            fontSize: '13px',
            width: '160px',
            outline: 'none',
          }}
        />
      </div>
    </div>
  )
}
