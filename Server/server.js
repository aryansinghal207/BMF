const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your_jwt_secret_key_change_this';

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/movie-booking', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Schemas and Models
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }]
});

const citySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
});

const theatreSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true }
});

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    durationMinutes: Number,
    price: { type: Number, required: true, default: 0 },
    totalSeats: { type: Number, required: true, default: 100 },
    availableSeats: { type: Number, required: true, default: 100 },
    posterUrl: { type: String, default: 'https://via.placeholder.com/300x450?text=No+Poster' }
});

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
    city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
    date: { type: Date, required: true },
    seats: { type: Number, required: true }
}, { timestamps: true });

const showSchema = new mongoose.Schema({
    city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
    theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    dateTime: { type: Date, required: true },
    availableSeats: { type: Number, required: true },
    price: { type: Number, required: true }
});

const User = mongoose.model('User', userSchema);
const City = mongoose.model('City', citySchema);
const Theatre = mongoose.model('Theatre', theatreSchema);
const Movie = mongoose.model('Movie', movieSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Show = mongoose.model('Show', showSchema);

// Auth Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, userData) => {
        if (err) return res.sendStatus(403);
        req.user = userData;
        next();
    });
}

// Routes

// Register
app.post('/api/auth/register', async (req, res) => {
    const { email, password, isAdmin } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already registered' });

        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({ email, passwordHash, isAdmin: isAdmin || false });
        await user.save();

        res.json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, isAdmin: user.isAdmin });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get profile with bookings
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-passwordHash')
            .populate({
                path: 'bookings',
                populate: [
                    { path: 'movie', select: 'title' },
                    { path: 'theatre', select: 'name' },
                    { path: 'city', select: 'name' }
                ]
            });
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Admin protected middleware
function adminOnly(req, res, next) {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin access required' });
    next();
}

// Add city
app.post('/api/admin/cities', authenticateToken, adminOnly, async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'City name required' });

    try {
        const existingCity = await City.findOne({ name });
        if (existingCity) return res.status(400).json({ message: 'City already exists' });

        const city = new City({ name });
        await city.save();
        res.json(city);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Add theatre
app.post('/api/admin/theatres', authenticateToken, adminOnly, async (req, res) => {
    const { name, cityId } = req.body;
    if (!name || !cityId) return res.status(400).json({ message: 'Name and cityId required' });

    try {
        const city = await City.findById(cityId);
        if (!city) return res.status(400).json({ message: 'City not found' });

        const theatre = new Theatre({ name, city: city._id });
        await theatre.save();
        res.json(theatre);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Add movie
app.post('/api/admin/movies', authenticateToken, adminOnly, async (req, res) => {
    const { title, description, durationMinutes, price, totalSeats, posterUrl } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });

    try {
        const movie = new Movie({ title, description, durationMinutes, price, totalSeats, posterUrl });
        await movie.save();
        res.json(movie);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get lists for cities, theatres, movies (public)
app.get('/api/cities', async (req, res) => {
    try {
        const cities = await City.find();
        res.json(cities);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

app.get('/api/theatres', async (req, res) => {
    try {
        const theatres = await Theatre.find().populate('city');
        res.json(theatres);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get movies with optional city and theatre filters
app.get('/api/movies', async (req, res) => {
  try {
    const { cityId, theatreId } = req.query;
    let query = {};

    if (cityId || theatreId) {
      // If we need to filter by city or theatre, we'll need to get the bookings first
      const bookings = await Booking.find({
        ...(cityId && { city: cityId }),
        ...(theatreId && { theatre: theatreId })
      }).distinct('movie');

      if (bookings.length > 0) {
        query._id = { $in: bookings };
      } else {
        // If no bookings found for the filters, return empty array
        return res.json([]);
      }
    }

    const movies = await Movie.find(query);
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add endpoint to create a show (admin only)
app.post('/api/admin/shows', authenticateToken, adminOnly, async (req, res) => {
    const { cityId, theatreId, movieId, dateTime, availableSeats, price } = req.body;
    if (!cityId || !theatreId || !movieId || !dateTime || !availableSeats || !price) {
        return res.status(400).json({ message: 'All show details required' });
    }
    try {
        const show = new Show({
            city: cityId,
            theatre: theatreId,
            movie: movieId,
            dateTime,
            availableSeats,
            price
        });
        await show.save();
        res.json(show);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Add endpoint to fetch shows filtered by city, theatre, movie, and date
app.get('/api/shows', async (req, res) => {
    try {
        const { cityId, theatreId, movieId, date } = req.query;
        let query = {};
        if (cityId) query.city = cityId;
        if (theatreId) query.theatre = theatreId;
        if (movieId) query.movie = movieId;
        if (date) {
            // Find shows on the same day
            const start = new Date(date);
            start.setHours(0,0,0,0);
            const end = new Date(date);
            end.setHours(23,59,59,999);
            query.dateTime = { $gte: start, $lte: end };
        }
        const shows = await Show.find(query).populate('city theatre movie');
        res.json(shows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update booking endpoint to use showId and update seat availability
app.post('/api/bookings', authenticateToken, async (req, res) => {
    const { showId, seats } = req.body;
    if (!showId || !seats) 
        return res.status(400).json({ message: 'Show and seats required' });
    try {
        const show = await Show.findById(showId).populate('movie theatre city');
        if (!show) return res.status(400).json({ message: 'Show not found' });
        if (show.availableSeats < seats) return res.status(400).json({ message: 'Not enough seats available' });
        show.availableSeats -= seats;
        await show.save();
        const booking = new Booking({
            user: req.user.id,
            movie: show.movie._id,
            theatre: show.theatre._id,
            city: show.city._id,
            date: show.dateTime,
            seats
        });
        await booking.save();
        await User.findByIdAndUpdate(req.user.id, { $push: { bookings: booking._id } });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get bookings for logged user
app.get('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('movie', 'title price')
            .populate('theatre', 'name')
            .populate('city', 'name')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get all bookings (admin only)
app.get('/api/admin/bookings', authenticateToken, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('movie', 'title price')
      .populate('theatre', 'name')
      .populate('city', 'name')
      .populate('user', 'email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
