import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import api from './services/api';
import ContactForm from './components/ContactForm';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State Auth
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  // Contact States
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingContact, setEditingContact] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchContacts = async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      const res = await api.get(`/kontak?per_page=6&page=${page}&search=${search}`);
      if (res.data.data.data) {
        setContacts(res.data.data.data);
        setCurrentPage(res.data.data.current_page);
        setTotalPages(res.data.data.last_page);
      } else {
        setContacts(res.data.data);
      }
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      else toast.error('Gagal memuat daftar kontak.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchContacts(currentPage, searchQuery);
  }, [token, currentPage, searchQuery]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/login', { email, password });
      localStorage.setItem('token', res.data.access_token);
      setToken(res.data.access_token);
      toast.success('Login berhasil!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email atau password salah!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      toast.error('Konfirmasi password tidak cocok!');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      toast.success('Registrasi berhasil! Silakan masuk.');
      setName('');
      setPasswordConfirmation('');
      setIsRegister(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registrasi gagal!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    toast.success('Logout berhasil.');
  };

  const handleDeleteContact = async (id) => {
    if (window.confirm('Yakin ingin menghapus kontak ini?')) {
      try {
        await api.delete(`/kontak/${id}`);
        toast.success('Kontak terhapus.');
        fetchContacts(currentPage, searchQuery);
      } catch (err) {
        toast.error('Gagal menghapus kontak.');
      }
    }
  };

  if (!token) {
    return (
      <div className="auth-wrapper">
        <Toaster position="top-center" />
        <div className="card auth-card">
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 className="brand-title" style={{ justifyContent: 'center', fontSize: '1.8rem' }}>
              📇 ConnectHub
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
              {isRegister ? 'Buat akun untuk memulai' : 'Masuk ke akun kamu'}
            </p>
          </div>

          {isRegister ? (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Konfirmasi Password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                {isLoading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>
          )}

          <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
            <span
              onClick={() => setIsRegister(!isRegister)}
              style={{ color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}
            >
              {isRegister ? 'Login di sini' : 'Daftar di sini'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Toaster position="top-right" />

      <div className="navbar">
        <h2 className="brand-title">📇 ConnectHub</h2>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      <ContactForm
        onContactSaved={() => {
          fetchContacts(currentPage, searchQuery);
          setEditingContact(null);
        }}
        editingContact={editingContact}
        onCancelEdit={() => setEditingContact(null)}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Daftar Kontak</h3>
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Cari nama atau alamat..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <p style={{ textAlign: 'center', margin: '40px 0', color: 'var(--text-muted)' }}>Memuat kontak...</p>
      ) : contacts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Tidak ada kontak yang ditemukan.</p>
        </div>
      ) : (
        <>
          <div className="contact-grid">
            {contacts.map((c) => (
              <div key={c.id} className="contact-card">
                <div className="contact-header">
                  <div className="avatar">{c.nama.charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div className="contact-name">{c.nama}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                      onClick={() => setEditingContact(c)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                      onClick={() => handleDeleteContact(c.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="contact-info">
                  📍 {c.alamat} <br />
                  🎂 {c.tanggal_lahir}
                </div>

                <div className="phone-list">
                  {c.phones?.map((p) => (
                    <div key={p.id} className="phone-item">
                      <span style={{ fontWeight: 600 }}>{p.nomor_telepon}</span>
                      <span className="badge">{p.jenis}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '32px' }}>
              <button
                className="btn btn-secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                ◀ Sebelumnya
              </button>
              <span style={{ alignSelf: 'center', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {currentPage} / {totalPages}
              </span>
              <button
                className="btn btn-secondary"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Selanjutnya ▶
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}