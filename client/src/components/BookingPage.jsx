import React, { useState, useEffect } from 'react';
import { fetchCities, fetchTheatres, fetchShows, postBooking } from '../api';
import BookingHistory from './BookingHistory';

export default function BookingPage({ token }) {
  const [cities, setCities] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);

  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedTheatreId, setSelectedTheatreId] = useState('');
  const [bookingSeats, setBookingSeats] = useState({}); // { showId: seatCount }

  useEffect(() => {
    fetchCities()
      .then(setCities)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedCityId) {
      fetchTheatres()
        .then(data => {
          if (Array.isArray(data)) {
            const filtered = data.filter(t => t.city && t.city._id === selectedCityId);
            setTheatres(filtered);
          } else {
            setTheatres([]);
          }
          setSelectedTheatreId('');
        })
        .catch(console.error);
    } else {
      setTheatres([]);
      setSelectedTheatreId('');
    }
  }, [selectedCityId]);

  useEffect(() => {
    // If city or theatre is selected, filter shows, else show all
    fetchShows(token, selectedCityId, selectedTheatreId)
      .then(data => setShows(data.filter(show => show.availableSeats > 0)))
      .catch(console.error);
  }, [token, selectedCityId, selectedTheatreId]);

  const handleBook = async (showId) => {
    const seats = Number(bookingSeats[showId] || 1);
    const show = shows.find(s => s._id === showId);
    if (!show) {
      alert('Show not found');
      return;
    }
    if (seats < 1 || seats > show.availableSeats) {
      alert('Please enter a valid number of seats (1 to ' + show.availableSeats + ')');
      return;
    }
    try {
      await postBooking(token, showId, seats);
      alert('Booking successful');
      setBookingSeats(bs => ({ ...bs, [showId]: 1 }));
      // Refresh shows
      fetchShows(token, selectedCityId, selectedTheatreId)
        .then(data => setShows(data.filter(show => show.availableSeats > 0)))
        .catch(console.error);
    } catch (e) {
      alert('Booking failed: ' + e.message);
    }
  };

  return (
    <div className="container">
      <h1>Book a Movie</h1>
      <label>City</label>
      <select value={selectedCityId} onChange={e => setSelectedCityId(e.target.value)}>
        <option value="">All Cities</option>
        {cities.map(city => (
          <option key={city._id} value={city._id}>
            {city.name}
          </option>
        ))}
      </select>

      <label>Theatre</label>
      <select value={selectedTheatreId} onChange={e => setSelectedTheatreId(e.target.value)} disabled={!selectedCityId && theatres.length === 0}>
        <option value="">All Theatres</option>
        {theatres.map(theatre => (
          <option key={theatre._id} value={theatre._id}>
            {theatre.name}
          </option>
        ))}
      </select>

      {shows.length > 0 ? (
        <div style={{ marginTop: '2rem' }}>
          <h2>Available Shows</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            {shows.map(show => (
              <div key={show._id} style={{ background: '#f4f8ff', borderRadius: '16px', boxShadow: '0 2px 12px #e5e9f2', padding: '1.2rem', minWidth: 320 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={show.movie.posterUrl || 'https://via.placeholder.com/100x150?text=No+Poster'} alt={show.movie.title} style={{ width: 100, height: 150, objectFit: 'cover', borderRadius: 8, background: '#e6edfa' }} />
                  <div>
                    <h3 style={{ margin: 0, color: '#2563eb' }}>{show.movie.title}</h3>
                    <div style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: 4 }}>{show.movie.genre || (show.movie.genres ? show.movie.genres.join('/') : 'Drama/Thriller')}</div>
                    <div style={{ fontWeight: 600, color: '#ef4444', marginBottom: 4 }}>Rs.{show.price}</div>
                    <div style={{ color: '#64748b', fontSize: '0.9em' }}>Duration: {show.movie.durationMinutes || show.movie.duration || 'N/A'} min</div>
                    <div style={{ color: '#2563eb', fontWeight: 500, marginTop: 4 }}>Time: {new Date(show.dateTime).toLocaleString()}</div>
                    <div style={{ color: '#16a34a', fontWeight: 500, marginTop: 4 }}>{show.availableSeats} seats left</div>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <label>Number of Seats: </label>
                  <input
                    type="number"
                    min="1"
                    max={show.availableSeats}
                    value={bookingSeats[show._id] || 1}
                    onChange={e => setBookingSeats(bs => ({ ...bs, [show._id]: e.target.value }))}
                    style={{ width: 60, marginRight: 8 }}
                  />
                  <button onClick={() => handleBook(show._id)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer' }}>Book Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '2rem', color: '#64748b' }}>No shows available.</div>
      )}

      {/* Booking history table below shows */}
      <div style={{ marginTop: '3rem' }}>
        <BookingHistory token={token} />
      </div>
    </div>
  );
}
