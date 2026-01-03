# SoundScout Backend

A FastAPI backend for the SoundScout music discovery platform that integrates with Spotify API to provide music genre exploration, artist discovery, and track information.

## Features

- **Genre Management**: Access to 15+ main genres and thousands of subgenres
- **Artist Discovery**: Search artists by specific music genres
- **Track Information**: Get top tracks for any artist
- **User Authentication**: JWT-based authentication system
- **MongoDB Integration**: User data storage and management

## Setup

1. Create a virtual environment:

```bash
python -m venv venv
```

2. Activate the virtual environment:

```bash
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file based on `.env.example` and add your configuration:

```env
# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=soundscout

# JWT Configuration
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Spotify API
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret

# App Configuration
DEBUG=True
```

5. Run the development server:

```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit `http://localhost:8000/docs` for interactive API documentation.

## Project Structure

```
backend/
├── app/
│   ├── auth/              # Authentication system
│   │   ├── auth_routes.py # Auth endpoints
│   │   ├── dependencies.py
│   │   └── jwt_handler.py
│   ├── data/              # Static data files
│   │   └── genres_dict.json # Genre database
│   ├── database/          # Database configuration
│   │   └── connection.py
│   ├── models/            # Data models
│   │   ├── auth.py
│   │   └── user.py
│   ├── services/          # Business logic
│   │   ├── auth_service.py
│   │   ├── spotify_service.py
│   │   └── user_service.py
│   └── routes.py          # Main API routes
├── main.py               # Application entry point
├── requirements.txt      # Dependencies
└── .env.example         # Environment variables template
```

## Environment Variables

- **Database**:

  - `MONGODB_URL`: MongoDB connection string
  - `DATABASE_NAME`: Database name for the application

- **JWT Configuration**:

  - `SECRET_KEY`: Secret key for JWT token signing
  - `ALGORITHM`: JWT algorithm (default: HS256)
  - `ACCESS_TOKEN_EXPIRE_MINUTES`: Access token expiration time
  - `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token expiration time

- **Spotify API**:

  - `SPOTIFY_CLIENT_ID`: Your Spotify app client ID
  - `SPOTIFY_CLIENT_SECRET`: Your Spotify app client secret

- **App Configuration**:
  - `DEBUG`: Set to True for development

## API Endpoints

### Authentication

- `POST /register` - Register a new user
- `POST /login` - User login
- `POST /refresh` - Refresh access token

### Genres

- `GET /api/genres` - Get main music genres (15 categories)
- `GET /api/genres/all` - Get all genres including subgenres and mapping
- `GET /api/genres/{main_genre}/subgenres` - Get subgenres for a specific main genre
- `GET /api/genres/search?q={query}` - Search genres by name

### Artists & Music

- `GET /api/artists/{genre}` - Get artists by genre (supports all subgenres)
- `GET /api/artist/{artist_id}/tracks` - Get top tracks for an artist
- `GET /api/artist/{artist_id}` - Get detailed artist information

### Utility

- `GET /` - Welcome message
- `GET /api/test` - API test endpoint
- `GET /api/protected` - Protected endpoint (requires authentication)

## Genre System

The application supports a comprehensive genre system with:

- **15 Main Genres**: Pop, Electronic, Hip Hop, R&B, Latin, Rock, Metal, Country, Folk/Acoustic, Classical, Jazz, Blues, Easy listening, New age, World/Traditional

- **Thousands of Subgenres**: From mainstream genres like "indie rock" to highly specific ones like "norwegian black metal" or "vintage old-time"

- **Genre Mapping**: Each main genre maps to hundreds of related subgenres for precise music discovery

## Development

- The application uses FastAPI with async/await patterns
- MongoDB for user data persistence
- Spotify Web API for music data
- JWT tokens for stateless authentication
- CORS enabled for frontend integration

## Dependencies

- FastAPI - Web framework
- uvicorn - ASGI server
- httpx - HTTP client for Spotify API
- motor/pymongo - MongoDB integration
- python-jose - JWT handling
- passlib - Password hashing
- pydantic - Data validation

## Notes

- Genre data is loaded from a local JSON file (`app/data/genres_dict.json`)
- Spotify API uses Client Credentials flow (no user authorization required)
- All Spotify requests are cached and rate-limited appropriately
- The application supports both development and production environments
