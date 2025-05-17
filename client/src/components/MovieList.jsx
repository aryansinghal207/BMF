import React, { useState, useEffect } from 'react';
import { fetchMovies, fetchCities, fetchTheatres } from '../api';

export default function MovieList({ token, onBookMovie }) {
  const [movies, setMovies] = useState([]);
  const [cities, setCities] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedTheatre, setSelectedTheatre] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCities = async () => {
      try {
        const citiesData = await fetchCities(token);
        setCities(citiesData);
      } catch (err) {
        setError('Failed to load cities');
        console.error(err);
      }
    };
    loadCities();
  }, [token]);

  useEffect(() => {
    const loadTheatres = async () => {
      if (selectedCity) {
        try {
          const theatresData = await fetchTheatres(token);
          const filteredTheatres = theatresData.filter(
            theatre => theatre.city._id === selectedCity
          );
          setTheatres(filteredTheatres);
        } catch (err) {
          setError('Failed to load theatres');
          console.error(err);
        }
      } else {
        setTheatres([]);
      }
    };
    loadTheatres();
  }, [selectedCity, token]);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const moviesData = await fetchMovies(token, selectedCity, selectedTheatre);
        setMovies(moviesData);
      } catch (err) {
        setError('Failed to load movies');
        console.error(err);
      }
    };
    loadMovies();
  }, [token, selectedCity, selectedTheatre]);

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
    setSelectedTheatre('');
  };

  const handleTheatreChange = (e) => {
    setSelectedTheatre(e.target.value);
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="container">
      <div className="filters">
        <div className="form-group">
          <label>Select City:</label>
          <select value={selectedCity} onChange={handleCityChange}>
            <option value="">All Cities</option>
            {cities.map(city => (
              <option key={city._id} value={city._id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Select Theatre:</label>
          <select 
            value={selectedTheatre} 
            onChange={handleTheatreChange}
            disabled={!selectedCity}
          >
            <option value="">All Theatres</option>
            {theatres.map(theatre => (
              <option key={theatre._id} value={theatre._id}>
                {theatre.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="movie-grid">
        {movies.map((movie) => (
          <div key={movie._id} className="movie-card modern-movie-card">
            <div className="movie-poster-wrapper">
              <img 
                src={movie.posterUrl} 
                alt={movie.title} 
                className="movie-poster"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster';
                }}
              />
              <div className="movie-overlay">
                <span className="movie-rating">
                  <span role="img" aria-label="star">★</span> {movie.rating || '8.0/10'}
                </span>
                <span className="movie-votes">
                  {movie.votes ? `${movie.votes} Votes` : '1K Votes'}
                </span>
              </div>
            </div>
            <h3 className="movie-title">{movie.title}</h3>
            <div className="movie-genres">{movie.genres ? movie.genres.join('/') : 'Drama/Thriller'}</div>
            <div className="movie-price">Price: <strong>${movie.price}</strong></div>
            <button onClick={() => onBookMovie(movie)}>Book Now</button>
          </div>
        ))}
      </div>
    </div>
  );
} 