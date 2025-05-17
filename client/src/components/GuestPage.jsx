import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMovies } from '../api';
import '../styles/GuestPage.css';

export default function GuestPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const navigate = useNavigate();

  const genres = [
    { value: 'all', label: 'All Genres' },
    { value: 'action', label: 'Action' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'drama', label: 'Drama' },
    { value: 'horror', label: 'Horror' },
    { value: 'sci-fi', label: 'Sci-Fi' }
  ];

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      let data = await getMovies();
      // TEMP: Add posterUrl for demo
      data = data.map(movie => {
        return movie;
      });
      setMovies(data);
    } catch (err) {
      setError('Failed to fetch movies. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || movie.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const handleBookClick = (movieId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      navigate(`/book/${movieId}`);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading movies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={fetchMovies} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="guest-page">
      <div className="hero-section" style={{
        background: 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)',
        borderRadius: '2rem',
        boxShadow: '0 4px 32px #2563eb22',
        padding: '3.5rem 1.5rem 3rem 1.5rem',
        margin: '2rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '340px',
        textAlign: 'center',
      }}>
        <div className="hero-content">
          <h1 style={{
            fontSize: '2.7rem',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #ff914d 0%, #ffd36e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1.2rem',
          }}>Welcome to Movie Booking</h1>
          <p style={{
            color: '#e0e7ef',
            fontSize: '1.25rem',
            marginBottom: '2.2rem',
            fontWeight: 500,
            letterSpacing: '0.01em',
          }}>
            Discover and book your favorite movies in just a few clicks
          </p>
          <div className="auth-buttons" style={{display: 'flex', gap: '2rem', justifyContent: 'center'}}>
            <Link to="/login" className="btn btn-primary" style={{
              background: '#fff',
              color: '#2563eb',
              fontWeight: 700,
              fontSize: '1.2rem',
              borderRadius: '1.2rem',
              padding: '0.9rem 2.5rem',
              boxShadow: '0 2px 12px #1e40af22',
              display: 'flex',
              alignItems: 'center',
              gap: '0.7rem',
              border: 'none',
              transition: 'background 0.2s, color 0.2s',
            }}>
              <span className="btn-icon" style={{fontSize: '1.3em'}}>🎬</span>
              Login
            </Link>
            <Link to="/register" className="btn btn-secondary" style={{
              background: 'transparent',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1.2rem',
              borderRadius: '1.2rem',
              padding: '0.9rem 2.5rem',
              border: '2px solid #fff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.7rem',
              boxShadow: '0 2px 12px #1e40af22',
              transition: 'background 0.2s, color 0.2s',
            }}>
              <span className="btn-icon" style={{fontSize: '1.3em'}}>✨</span>
              Register
            </Link>
          </div>
        </div>
      </div>

      <div className="search-filter-container" style={{
        background: 'transparent',
        boxShadow: 'none',
        borderRadius: 0,
        padding: 0,
        margin: '2rem 0 1.5rem 0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <div className="search-filter-content" style={{display: 'flex', gap: '1.5rem', width: '100%', maxWidth: 900, alignItems: 'center'}}>
          <form style={{flex: 1, display: 'flex', alignItems: 'center'}} onSubmit={e => e.preventDefault()}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#fff',
              border: '3px solid #222',
              borderRadius: '2.5rem',
              padding: '0.2rem 1.2rem',
              width: '100%',
              position: 'relative',
            }}>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '1.25rem',
                  color: '#222',
                  width: '100%',
                  fontWeight: 500,
                  padding: '0.7rem 0',
                }}
              />
              <button type="button" style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                padding: 0,
                marginLeft: '0.5rem',
                display: 'flex',
                alignItems: 'center',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
            </div>
          </form>
          <div className="filter-box" style={{background: '#fff', borderRadius: '1.5rem', boxShadow: '0 1px 6px #2563eb08', border: '1.5px solid #e0e7ef', padding: '0.5rem 1.2rem', display: 'flex', alignItems: 'center'}}>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="genre-select"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '1.1rem',
                color: '#222e4a',
                fontWeight: 600,
                cursor: 'pointer',
                paddingRight: '1.2rem',
              }}
            >
              {genres.map(genre => (
                <option key={genre.value} value={genre.value}>
                  {genre.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="movies-section">
        <h2 className="section-title">Now Showing</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2rem',
          marginTop: '1.5rem',
        }}>
          {filteredMovies.map(movie => (
            <div
              key={movie.id || movie._id}
              style={{
                background: '#f4f8ff',
                borderRadius: '18px',
                boxShadow: '0 2px 16px #2563eb18',
                padding: '1.2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'transform 0.18s, box-shadow 0.18s',
                border: '1.5px solid #e0e7ef',
                cursor: 'pointer',
                minHeight: '410px',
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.025)';
                e.currentTarget.style.boxShadow = '0 6px 32px #2563eb33';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '0 2px 16px #2563eb18';
              }}
            >
              <div style={{width: '180px', height: '260px', overflow: 'hidden', borderRadius: '12px', marginBottom: '1rem', background: '#e6edfa'}}>
                <img src={movie.posterUrl || 'https://via.placeholder.com/180x260?text=No+Poster'} alt={movie.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/180x260?text=No+Poster'; }} />
              </div>
              <h3 style={{fontSize: '1.1rem', fontWeight: 700, margin: '0.5rem 0', color: '#2563eb', letterSpacing: '0.01em'}}>{movie.title}</h3>
              <div style={{color: '#5b6b8c', fontSize: '0.97rem', marginBottom: '0.3rem'}}>{movie.genre || (movie.genres ? movie.genres.join('/') : 'Drama/Thriller')}</div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem'}}>
                <span style={{color: '#fbbf24', fontWeight: 600}}>★</span>
                <span style={{color: '#334155'}}>{movie.rating || '8.0/10'}</span>
                <span style={{color: '#7b8bb7', fontSize: '0.9em'}}>({movie.votes || '1K'} votes)</span>
              </div>
              <div style={{fontWeight: 600, color: '#2563eb', marginBottom: '0.3rem'}}>${movie.price}</div>
              <div style={{color: '#7b8bb7', fontSize: '0.9em'}}>Duration: {movie.durationMinutes || movie.duration || 'N/A'} min</div>
              <button
                style={{
                  marginTop: '0.7rem',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.7rem',
                  padding: '0.5rem 1.5rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                onClick={() => handleBookClick(movie.id || movie._id)}
              >
                Book
              </button>
            </div>
          ))}
        </div>
        {filteredMovies.length === 0 && (
          <div className="no-movies">
            <p>No movies found matching your criteria</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedGenre('all');
              }}
              className="clear-filters-btn"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 