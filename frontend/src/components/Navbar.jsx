import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShoppingCart, Menu, X } from 'lucide-react';

const NAV_STYLE = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: 'var(--muted)',
  transition: 'color 0.2s',
};

const BTN_STYLE = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: 'var(--ink)',
  background: 'transparent',
  border: '1px solid var(--hairline-strong)',
  borderRadius: 9999,
  padding: '7px 20px',
  cursor: 'pointer',
  transition: 'border-color 0.2s',
};

function NavLink({ to, children }) {
  const [hov, setHov] = useState(false);
  return (
    <Link to={to} style={{ ...NAV_STYLE, color: hov ? 'var(--ink)' : 'var(--muted)' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {children}
    </Link>
  );
}

function OutlineBtn({ onClick, children, as: Tag = 'button', to }) {
  const [hov, setHov] = useState(false);
  const style = { ...BTN_STYLE, borderColor: hov ? 'var(--ink)' : 'var(--hairline-strong)' };
  if (Tag === Link) return <Link to={to} style={style} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>{children}</Link>;
  return <button onClick={onClick} style={style} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>{children}</button>;
}

export default function Navbar({ cartCount }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = user?.role === 'admin'
    ? [{ to: '/admin/rooms', label: 'Kelola Kamar' }, { to: '/admin/reservations', label: 'Kelola Reservasi' }]
    : [{ to: '/', label: 'Beranda' }, { to: '/rooms', label: 'Kamar' }, ...(user ? [{ to: '/history', label: 'Riwayat' }] : [])];

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--hairline)' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>

        {/* Wordmark */}
        <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '6px', textTransform: 'uppercase', color: 'var(--ink)', fontWeight: 400 }}>
          KosHub
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex" style={{ gap: 32, alignItems: 'center' }}>
          {links.map(l => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex" style={{ gap: 20, alignItems: 'center' }}>
          {user?.role !== 'admin' && (
            <Link to="/cart" style={{ position: 'relative', color: 'var(--muted)', display: 'flex' }}>
              <ShoppingCart size={17} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: -5, right: -6, background: 'var(--ink)', color: 'var(--canvas)', borderRadius: '50%', width: 15, height: 15, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)' }}>
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          {user ? (
            <>
              <span style={{ ...NAV_STYLE, color: 'var(--muted-soft)' }}>{user.nama}</span>
              <OutlineBtn onClick={handleLogout}>Keluar</OutlineBtn>
            </>
          ) : (
            <OutlineBtn as={Link} to="/login">Masuk</OutlineBtn>
          )}
        </div>

        {/* Mobile burger */}
        <button className="md:hidden" onClick={() => setIsOpen(o => !o)}
          style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          {isOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div style={{ borderTop: '1px solid var(--hairline)', backgroundColor: 'var(--canvas)', padding: '24px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setIsOpen(false)}
              style={{ ...NAV_STYLE, color: 'var(--body-color)' }}>
              {l.label}
            </Link>
          ))}
          {user?.role !== 'admin' && (
            <Link to="/cart" onClick={() => setIsOpen(false)} style={{ ...NAV_STYLE, color: 'var(--body-color)' }}>
              Keranjang {cartCount > 0 && `(${cartCount})`}
            </Link>
          )}
          <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: 20 }}>
            {user
              ? <OutlineBtn onClick={() => { handleLogout(); setIsOpen(false); }}>Keluar</OutlineBtn>
              : <OutlineBtn as={Link} to="/login">Masuk</OutlineBtn>
            }
          </div>
        </div>
      )}
    </nav>
  );
}


