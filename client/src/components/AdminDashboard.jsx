import React, { useState, useEffect } from 'react';
import { fetchCities, postCity, postTheatre, postMovie, fetchBookings, fetchMovies, fetchTheatres, postShow } from '../api';

export default function AdminDashboard({ token }) {
  const [cities, setCities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [movies, setMovies] = useState([]);
  const [newCity, setNewCity] = useState('');
  const [newTheatreName, setNewTheatreName] = useState('');
  const [newTheatreCityId, setNewTheatreCityId] = useState('');
  const [newMovieTitle, setNewMovieTitle] = useState('');
  const [newMovieDescription, setNewMovieDescription] = useState('');
  const [newMovieDuration, setNewMovieDuration] = useState('');
  const [newMoviePrice, setNewMoviePrice] = useState('');
  const [newMovieSeats, setNewMovieSeats] = useState('');
  const [newMoviePosterUrl, setNewMoviePosterUrl] = useState('');
  const [showCityId, setShowCityId] = useState('');
  const [showTheatreId, setShowTheatreId] = useState('');
  const [showMovieId, setShowMovieId] = useState('');
  const [showTime, setShowTime] = useState('');
  const [showSeats, setShowSeats] = useState('');
  const [showPrice, setShowPrice] = useState('');
  const [theatres, setTheatres] = useState([]);

  useEffect(() => {
    fetchCities()
      .then(setCities)
      .catch(console.error);
    
    fetchBookings(token)
      .then(setBookings)
      .catch(console.error);

    fetchMovies(token)
      .then(setMovies)
      .catch(console.error);

    fetchTheatres(token)
      .then(setTheatres)
      .catch(console.error);
  }, [token]);

  const handleAddCity = async () => {
    if (!newCity.trim()) return alert('City name cannot be empty');
    try {
      await postCity(token, newCity.trim());
      alert('City added successfully');
      setNewCity('');
      const newCities = await fetchCities();
      setCities(newCities);
    } catch (e) {
      alert('Failed to add city: ' + e.message);
    }
  };

  const handleAddTheatre = async () => {
    if (!newTheatreName.trim() || !newTheatreCityId) return alert('Name and city required');
    try {
      await postTheatre(token, newTheatreName.trim(), newTheatreCityId);
      alert('Theatre added successfully');
      setNewTheatreName('');
      setNewTheatreCityId('');
    } catch (e) {
      alert('Failed to add theatre: ' + e.message);
    }
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      await postMovie(
        token,
        newMovieTitle,
        newMovieDescription,
        parseInt(newMovieDuration),
        parseFloat(newMoviePrice),
        parseInt(newMovieSeats),
        newMoviePosterUrl
      );
      setNewMovieTitle('');
      setNewMovieDescription('');
      setNewMovieDuration('');
      setNewMoviePrice('');
      setNewMovieSeats('');
      setNewMoviePosterUrl('');
      alert('Movie added successfully');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddShow = async () => {
    if (!showCityId || !showTheatreId || !showMovieId || !showTime || !showSeats || !showPrice) {
      alert('Please fill all show details');
      return;
    }
    try {
      await postShow(
        token,
        showCityId,
        showTheatreId,
        showMovieId,
        showTime,
        parseInt(showSeats),
        parseFloat(showPrice)
      );
      alert('Show added successfully');
      setShowCityId('');
      setShowTheatreId('');
      setShowMovieId('');
      setShowTime('');
      setShowSeats('');
      setShowPrice('');
    } catch (e) {
      alert('Failed to add show: ' + e.message);
    }
  };

  return (
    <div className="container">
      <h1 className="section-title">Admin Dashboard</h1>

      <div className="admin-section">
        <h2>Add City</h2>
        <div className="form-group">
          <input
            type="text"
            value={newCity}
            onChange={e => setNewCity(e.target.value)}
            placeholder="Enter city name"
          />
        </div>
        <button onClick={handleAddCity}>Add City</button>
      </div>

      <div className="admin-section">
        <h2>Add Theatre</h2>
        <div className="form-group">
          <input
            type="text"
            value={newTheatreName}
            onChange={e => setNewTheatreName(e.target.value)}
            placeholder="Enter theatre name"
          />
        </div>
        <div className="form-group">
          <select value={newTheatreCityId} onChange={e => setNewTheatreCityId(e.target.value)}>
            <option value="">Select City</option>
            {cities.map(city => (
              <option key={city._id} value={city._id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleAddTheatre}>Add Theatre</button>
      </div>

      <div className="admin-section">
        <h2>Add Show</h2>
        <div className="form-group">
          <select value={showCityId} onChange={e => setShowCityId(e.target.value)}>
            <option value="">Select City</option>
            {cities.map(city => (
              <option key={city._id} value={city._id}>{city.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <select value={showTheatreId} onChange={e => setShowTheatreId(e.target.value)} disabled={!showCityId}>
            <option value="">Select Theatre</option>
            {theatres
              .filter(theatre => theatre.city && theatre.city._id === showCityId)
              .map(theatre => (
                <option key={theatre._id} value={theatre._id}>{theatre.name}</option>
              ))}
          </select>
        </div>
        <div className="form-group">
          <select value={showMovieId} onChange={e => setShowMovieId(e.target.value)}>
            <option value="">Select Movie</option>
            {movies.map(movie => (
              <option key={movie._id} value={movie._id}>{movie.title}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <input type="datetime-local" value={showTime} onChange={e => setShowTime(e.target.value)} />
        </div>
        <div className="form-group">
          <input type="number" min="1" placeholder="Seat Availability" value={showSeats} onChange={e => setShowSeats(e.target.value)} />
        </div>
        <div className="form-group">
          <input type="number" min="0" placeholder="Price per Seat" value={showPrice} onChange={e => setShowPrice(e.target.value)} />
        </div>
        <button onClick={handleAddShow}>Add Show</button>
      </div>

      <div className="admin-section">
        <h2>Add Movie</h2>
        <div className="form-group">
          <input
            type="text"
            value={newMovieTitle}
            onChange={e => setNewMovieTitle(e.target.value)}
            placeholder="Enter movie title"
          />
        </div>
        <div className="form-group">
          <textarea
            value={newMovieDescription}
            onChange={e => setNewMovieDescription(e.target.value)}
            placeholder="Enter movie description"
            rows="3"
          />
        </div>
        <div className="form-group">
          <input
            type="number"
            min="0"
            value={newMovieDuration}
            onChange={e => setNewMovieDuration(e.target.value)}
            placeholder="Enter duration in minutes"
          />
        </div>
        <div className="form-group">
          <label>Poster URL:</label>
          <input
            type="url"
            value={newMoviePosterUrl}
            onChange={(e) => setNewMoviePosterUrl(e.target.value)}
            placeholder="https://example.com/poster.jpg"
          />
        </div>
        <button type="submit" onClick={handleAddMovie}>Add Movie</button>
      </div>

      <div className="admin-section">
        <h2>Booking History</h2>
        <div className="booking-history" style={{overflowX: 'auto', maxWidth: '100%'}}>
          <table style={{minWidth: 900, borderCollapse: 'collapse', width: '100%'}}>
            <thead style={{background: '#f3f6fa'}}>
              <tr>
                <th style={{padding: '10px 16px', textAlign: 'left'}}>Movie</th>
                <th style={{padding: '10px 16px', textAlign: 'left'}}>Theatre</th>
                <th style={{padding: '10px 16px', textAlign: 'left'}}>City</th>
                <th style={{padding: '10px 16px', textAlign: 'left'}}>Date</th>
                <th style={{padding: '10px 16px', textAlign: 'left'}}>User</th>
                <th style={{padding: '10px 16px', textAlign: 'right'}}>Seats</th>
                <th style={{padding: '10px 16px', textAlign: 'right'}}>Price per Ticket</th>
                <th style={{padding: '10px 16px', textAlign: 'right'}}>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, idx) => (
                <tr key={booking._id} style={{background: idx % 2 === 0 ? '#fff' : '#f7fafd'}}>
                  <td style={{padding: '8px 16px'}}>{booking.movie?.title || 'N/A'}</td>
                  <td style={{padding: '8px 16px'}}>{booking.theatre?.name || 'N/A'}</td>
                  <td style={{padding: '8px 16px'}}>{booking.city?.name || 'N/A'}</td>
                  <td style={{padding: '8px 16px'}}>{new Date(booking.createdAt || booking.date).toLocaleString()}</td>
                  <td style={{padding: '8px 16px'}}>{booking.user?.email || 'N/A'}</td>
                  <td style={{padding: '8px 16px', textAlign: 'right'}}>{booking.seats}</td>
                  <td style={{padding: '8px 16px', textAlign: 'right'}}>${(booking.movie?.price || 0).toFixed(2)}</td>
                  <td style={{padding: '8px 16px', textAlign: 'right'}}>${(booking.seats * (booking.movie?.price || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-section">
        <h2>All Movies</h2>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginTop: '1.5rem'}}>
          {movies.map(movie => (
            <div key={movie._id} style={{background: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px #e5e9f2', padding: '1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{width: '180px', height: '260px', overflow: 'hidden', borderRadius: '12px', marginBottom: '1rem', background: '#f3f6fa'}}>
                <img src={movie.posterUrl || 'https://via.placeholder.com/180x260?text=No+Poster'} alt={movie.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/180x260?text=No+Poster'; }} />
              </div>
              <h3 style={{fontSize: '1.1rem', fontWeight: 700, margin: '0.5rem 0', color: '#2563eb'}}>{movie.title}</h3>
              <div style={{color: '#64748b', fontSize: '0.95rem', marginBottom: '0.3rem'}}>{movie.genre || (movie.genres ? movie.genres.join('/') : 'Drama/Thriller')}</div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem'}}>
                <span style={{color: '#fbbf24', fontWeight: 600}}>★</span>
                <span style={{color: '#334155'}}>{movie.rating || '8.0/10'}</span>
                <span style={{color: '#94a3b8', fontSize: '0.9em'}}>({movie.votes || '1K'} votes)</span>
              </div>
              <div style={{fontWeight: 600, color: '#ef4444', marginBottom: '0.3rem'}}>${movie.price}</div>
              <div style={{color: '#64748b', fontSize: '0.9em'}}>Duration: {movie.durationMinutes || movie.duration || 'N/A'} min</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
