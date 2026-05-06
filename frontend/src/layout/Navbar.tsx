import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'

const navItems = [
  { label: 'HOME',       to: '/' },
  { label: 'PROBLEMSET', to: '/problems' },
  { label: 'CONTESTS',   to: '/contests' },
]

const styles = {
  wrapper:       'font-sans border-b border-gray-200 rounded-xl',
  topBar:        'flex items-center justify-between px-5 py-2 bg-white',
  logo:          'text-2xl font-black tracking-wider no-underline',
  logoBlack:      'text-black text-4xl',
  logoBlue:       'text-4xl text-[#3664AD]',
  userArea:      'flex items-center gap-2 text-sm',
  userLink:      'text-blue-700 font-semibold no-underline',
  divider:       'text-gray-400',
  logoutBtn:     'bg-transparent border-none text-blue-700 font-semibold cursor-pointer text-sm p-0',
  navBar:        'bg-white border border-gray-500 rounded-lg flex items-center justify-between px-5',
  navLinks:      'flex',
  navLink:       'px-3 py-2.5 font-bold text-sm no-underline inline-block text-gray-600 border-b-2 border-transparent',
  navLinkActive: 'px-3 py-2.5 font-bold text-sm no-underline inline-block text-blue-700 border-b-2 border-blue-700',
}

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
    <div className={styles.wrapper}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <NavLink to="/" className={styles.logo}>
          <span className={styles.logoBlack}>CODE</span>
          <span className={styles.logoBlue}>FORCES</span>
        </NavLink>

        <div className={styles.userArea}>
          {token ? (
            <>
              <NavLink to={`/users/${username}`} className={styles.userLink}>{username}</NavLink>
              <span className={styles.divider}>|</span>
              <button onClick={logout} className={styles.logoutBtn}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login"    className={styles.userLink}>Login</NavLink>
              <span className={styles.divider}>|</span>
              <NavLink to="/register" className={styles.userLink}>Register</NavLink>
            </>
          )}
        </div>
      </div>

      {/* Nav links bar */}
      <div className={styles.navBar}>
        <div className={styles.navLinks}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}
            >
              {item.label}
            </NavLink>
          ))}
          {token && (
            <NavLink
              to="/problems/new"
              className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}
            >
              + PROBLEM
            </NavLink>
          )}
        </div>
      </div>
    </div>
  )
}
