const API_URL = 'http://localhost:5000/api';

export async function request(endpoint, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || 'Error');
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

// Guest page movie fetching
export const getMovies = () => request('movies', 'GET');

export const fetchCities = (token) => request('cities', 'GET', null, token);
export const fetchTheatres = (token) => request('theatres', 'GET', null, token);
export const fetchMovies = (token, cityId = '', theatreId = '') => {
  const queryParams = new URLSearchParams();
  if (cityId) queryParams.append('cityId', cityId);
  if (theatreId) queryParams.append('theatreId', theatreId);
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `movies?${queryString}` : 'movies';
  
  return request(endpoint, 'GET', null, token);
};
export const fetchBookings = (token) => request('admin/bookings', 'GET', null, token);

export const loginUser = (email, password) =>
  request('auth/login', 'POST', { email, password });

export const registerUser = (email, password, name) =>
  request('auth/register', 'POST', { email, password, name, isAdmin: false });

export const fetchProfile = (token) => request('profile', 'GET', null, token);
export const fetchUserBookings = (token) => request('bookings', 'GET', null, token);
export const postCity = (token, name) => request('admin/cities', 'POST', { name }, token);
export const postTheatre = (token, name, cityId) =>
  request('admin/theatres', 'POST', { name, cityId }, token);
export const postMovie = (token, title, description, durationMinutes, price, totalSeats, posterUrl) =>
  request(
    'admin/movies',
    'POST',
    { title, description, durationMinutes, price, totalSeats, posterUrl },
    token
  );
export const fetchShows = (token, cityId = '', theatreId = '', movieId = '', date = '') => {
  const queryParams = new URLSearchParams();
  if (cityId) queryParams.append('cityId', cityId);
  if (theatreId) queryParams.append('theatreId', theatreId);
  if (movieId) queryParams.append('movieId', movieId);
  if (date) queryParams.append('date', date);
  const queryString = queryParams.toString();
  const endpoint = queryString ? `shows?${queryString}` : 'shows';
  return request(endpoint, 'GET', null, token);
};

export const postShow = (token, cityId, theatreId, movieId, dateTime, availableSeats, price) =>
  request(
    'admin/shows',
    'POST',
    { cityId, theatreId, movieId, dateTime, availableSeats, price },
    token
  );

export const postBooking = (token, showId, seats) =>
  request(
    'bookings',
    'POST',
    { showId, seats },
    token
  );
