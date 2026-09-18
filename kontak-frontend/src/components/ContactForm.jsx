import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function ContactForm({ onContactSaved, editingContact, onCancelEdit }) {
  const [nama, setNama] = useState('');
  const [alamat, setAlamat] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [phones, setPhones] = useState([{ jenis: 'Seluler', nomor_telepon: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingContact) {
      setNama(editingContact.nama || '');
      setAlamat(editingContact.alamat || '');
      setTanggalLahir(editingContact.tanggal_lahir || '');
      setPhones(
        editingContact.phones?.length > 0
          ? editingContact.phones.map((p) => ({ jenis: p.jenis, nomor_telepon: p.nomor_telepon }))
          : [{ jenis: 'Seluler', nomor_telepon: '' }]
      );
    } else {
      resetForm();
    }
  }, [editingContact]);

  const resetForm = () => {
    setNama('');
    setAlamat('');
    setTanggalLahir('');
    setPhones([{ jenis: 'Seluler', nomor_telepon: '' }]);
  };

  const handlePhoneChange = (index, field, value) => {
    const updated = [...phones];
    updated[index][field] = value;
    setPhones(updated);
  };

  const addPhoneField = () => {
    setPhones([...phones, { jenis: 'Seluler', nomor_telepon: '' }]);
  };

  const removePhoneField = (index) => {
    if (phones.length > 1) {
      setPhones(phones.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = { nama, alamat, tanggal_lahir: tanggalLahir, phones };

    try {
      if (editingContact) {
        await api.put(`/kontak/${editingContact.id}`, payload);
        toast.success('Kontak berhasil diperbarui!');
      } else {
        await api.post('/kontak', payload);
        toast.success('Kontak baru ditambahkan!');
      }

      resetForm();
      onContactSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
          {editingContact ? '✏️ Edit Kontak' : '✨ Tambah Kontak Baru'}
        </h3>
        {editingContact && (
          <button type="button" className="btn btn-secondary" onClick={onCancelEdit}>
            Batal
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Nama Lengkap"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />
        </div>
        <div className="form-row">
          <input
            type="text"
            placeholder="Alamat Lengkap"
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            required
          />
          <input
            type="date"
            value={tanggalLahir}
            onChange={(e) => setTanggalLahir(e.target.value)}
            required
          />
        </div>

        <h4 style={{ margin: '18px 0 10px 0', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          NOMOR TELEPON
        </h4>

        {phones.map((phone, idx) => (
          <div key={idx} className="form-row">
            <select
              style={{ width: '140px' }}
              value={phone.jenis}
              onChange={(e) => handlePhoneChange(idx, 'jenis', e.target.value)}
            >
              <option value="Seluler">Seluler</option>
              <option value="Rumah">Rumah</option>
              <option value="Kantor">Kantor</option>
              <option value="Pribadi">Pribadi</option>
              <option value="Whatsapp">Whatsapp</option>
            </select>
            <input
              type="text"
              placeholder="Nomor Telepon"
              value={phone.nomor_telepon}
              onChange={(e) => handlePhoneChange(idx, 'nomor_telepon', e.target.value)}
              required
            />
            {phones.length > 1 && (
              <button type="button" className="btn btn-danger" onClick={() => removePhoneField(idx)}>
                ✕
              </button>
            )}
          </div>
        ))}

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button type="button" className="btn btn-secondary" onClick={addPhoneField}>
            + Tambah Nomor
          </button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : editingContact ? 'Perbarui Kontak' : 'Simpan Kontak'}
          </button>
        </div>
      </form>
    </div>
  );
}