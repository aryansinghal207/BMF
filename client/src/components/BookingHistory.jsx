import React, { useState, useEffect } from 'react';
import { fetchUserBookings } from '../api';

export default function BookingHistory({ token }) {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await fetchUserBookings(token);
        setBookings(data);
      } catch (err) {
        setError('Failed to load bookings');
        console.error(err);
      }
    };

    loadBookings();
  }, [token]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div style={{
      maxWidth: 900,
      margin: '2rem auto',
      background: 'rgba(255,255,255,0.95)',
      borderRadius: '18px',
      boxShadow: '0 4px 24px #2563eb18',
      padding: '2rem',
      overflowX: 'auto',
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontWeight: 700, fontSize: '2rem', color: '#222' }}>My Bookings</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1.08rem' }}>
        <thead style={{ background: '#f3f6fa' }}>
          <tr>
            <th style={{ padding: '12px 18px', textAlign: 'left', fontWeight: 700, color: '#222' }}>Movie</th>
            <th style={{ padding: '12px 18px', textAlign: 'left', fontWeight: 700, color: '#222' }}>Theatre</th>
            <th style={{ padding: '12px 18px', textAlign: 'left', fontWeight: 700, color: '#222' }}>City</th>
            <th style={{ padding: '12px 18px', textAlign: 'left', fontWeight: 700, color: '#222' }}>Date</th>
            <th style={{ padding: '12px 18px', textAlign: 'center', fontWeight: 700, color: '#222' }}>Seats</th>
            <th style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 700, color: '#222' }}>Price per Ticket</th>
            <th style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 700, color: '#222' }}>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, idx) => (
            <tr key={booking._id} style={{ background: idx % 2 === 0 ? '#fff' : '#f7fafd' }}>
              <td style={{ padding: '10px 18px', fontWeight: 600, color: '#2563eb' }}>{booking.movie?.title || 'N/A'}</td>
              <td style={{ padding: '10px 18px' }}>{booking.theatre?.name || 'N/A'}</td>
              <td style={{ padding: '10px 18px' }}>{booking.city?.name || 'N/A'}</td>
              <td style={{ padding: '10px 18px' }}>{new Date(booking.date).toLocaleDateString()}</td>
              <td style={{ padding: '10px 18px', textAlign: 'center' }}>{booking.seats}</td>
              <td style={{ padding: '10px 18px', textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>Rs.{(booking.movie?.price || 0).toFixed(2)}</td>
              <td style={{ padding: '10px 18px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>Rs.{(booking.seats * (booking.movie?.price || 0)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {bookings.length === 0 && (
        <div style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>No bookings found.</div>
      )}
    </div>
  );
} 