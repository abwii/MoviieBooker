import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  Calendar, 
  Film, 
  User, 
  Search, 
  RefreshCw, 
  X, 
  Check, 
  Trash2, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Lock,
  Clapperboard,
  Clock
} from 'lucide-react';

const API_URL = 'http://localhost:3000';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
}

interface Reservation {
  id: number;
  movieId: number;
  reservationDate: string;
  status: string;
  movieTitle?: string;
  moviePoster?: string;
}

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
  const [activeTab, setActiveTab] = useState<'movies' | 'reservations'>('movies');

  // Auth pages
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [authUsername, setAuthUsername] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [authSuccess, setAuthSuccess] = useState<string>('');

  // Movie catalog state
  const [movies, setMovies] = useState<Movie[]>([]);
  const [search, setSearch] = useState<string>('');
  const [sort, setSort] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoadingMovies, setIsLoadingMovies] = useState<boolean>(false);

  // Reservation list state
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState<boolean>(false);

  // Booking Modal
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingError, setBookingError] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState<string>('');
  const [isBooking, setIsBooking] = useState<boolean>(false);

  // Fetch movies on page/sort change
  useEffect(() => {
    if (token) {
      fetchMovies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort, token]);

  // Fetch reservations on tab change
  useEffect(() => {
    if (token && activeTab === 'reservations' && userId) {
      fetchReservations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token, userId]);

  const fetchMovies = async (searchQuery = search) => {
    setIsLoadingMovies(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
      });
      if (searchQuery) queryParams.append('search', searchQuery);
      if (sort) queryParams.append('sort', sort);

      const res = await fetch(`${API_URL}/movies?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch movies');
      const data = await res.json();
      
      if (data && data.results) {
        setMovies(data.results);
        setTotalPages(Math.min(data.total_pages || 1, 500)); // Cap total pages to reasonable TMDB limit
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMovies(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMovies(search);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!authUsername || !authPassword) {
      setAuthError('Veuillez remplir tous les champs.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUsername, password: authPassword })
      });
      const data = await res.json();

      if (data.message && data.message.includes('succès')) {
        setAuthSuccess(data.message);
        setTimeout(() => {
          setIsRegistering(false);
          setAuthSuccess('');
          setAuthPassword('');
        }, 1500);
      } else {
        setAuthError(data.message || "Erreur lors de l'inscription.");
      }
    } catch (err) {
      setAuthError("Connexion impossible avec le serveur.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!authUsername || !authPassword) {
      setAuthError('Veuillez remplir tous les champs.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUsername, password: authPassword })
      });
      const data = await res.json();

      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);

        if (data.user) {
          localStorage.setItem('userId', data.user.id.toString());
          localStorage.setItem('username', data.user.username);
          setUserId(data.user.id.toString());
          setUsername(data.user.username);
        }
        setAuthSuccess('Connexion réussie !');
        setAuthPassword('');
        setAuthUsername('');
      } else {
        setAuthError(data.message || 'Identifiants invalides.');
      }
    } catch (err) {
      setAuthError("Connexion impossible avec le serveur.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setToken(null);
    setUserId(null);
    setUsername(null);
    setActiveTab('movies');
    setMovies([]);
    setReservations([]);
  };

  const fetchReservations = async () => {
    if (!userId || !token) return;
    setIsLoadingReservations(true);
    try {
      const res = await fetch(`${API_URL}/reservations/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch reservations');
      const data: Reservation[] = await res.json();
      
      // Fetch details for each movie asynchronously to enrich the list
      const enrichedReservations = await Promise.all(
        data.map(async (resItem) => {
          try {
            const movieRes = await fetch(`${API_URL}/movies/${resItem.movieId}`);
            if (movieRes.ok) {
              const movieData = await movieRes.json();
              return {
                ...resItem,
                movieTitle: movieData.title,
                moviePoster: movieData.poster_path ? `${TMDB_IMAGE_BASE}${movieData.poster_path}` : undefined,
              };
            }
          } catch (e) {
            console.error(`Failed to fetch movie details for id: ${resItem.movieId}`, e);
          }
          return resItem;
        })
      );

      setReservations(enrichedReservations);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingReservations(false);
    }
  };

  const handleCancelReservation = async (reservationId: number) => {
    if (!token) return;
    if (!confirm('Voulez-vous vraiment annuler cette réservation ?')) return;

    try {
      const res = await fetch(`${API_URL}/reservations/${reservationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.message && data.message.includes('success')) {
        setReservations(prev => prev.filter(item => item.id !== reservationId));
      } else {
        alert(data.message || "Erreur lors de l'annulation.");
      }
    } catch (err) {
      alert("Impossible d'annuler la réservation.");
    }
  };

  const openBookingModal = (movie: Movie) => {
    setSelectedMovie(movie);
    setBookingDate('');
    setBookingError('');
    setBookingSuccess('');
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');

    if (!selectedMovie || !bookingDate || !userId || !token) return;

    const reservationTime = new Date(bookingDate);
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    if (reservationTime < twoHoursLater) {
      setBookingError("La réservation doit être effectuée au moins 2 heures à l'avance.");
      return;
    }

    setIsBooking(true);
    try {
      const res = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: parseInt(userId, 10),
          movieId: selectedMovie.id,
          reservationDate: bookingDate
        })
      });
      const data = await res.json();

      if (res.ok && data.id) {
        setBookingSuccess("Réservation confirmée avec succès !");
        setTimeout(() => {
          setSelectedMovie(null);
          if (activeTab === 'reservations') {
            fetchReservations();
          }
        }, 1500);
      } else {
        setBookingError(data.message || "Erreur de réservation.");
      }
    } catch (err) {
      setBookingError("Une erreur est survenue.");
    } finally {
      setIsBooking(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel w-full max-w-md p-8 relative">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-indigo-600/10 rounded-full text-indigo-400">
              <Clapperboard size={36} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center mb-2 tracking-tight">
            MoviieBooker
          </h2>
          <p className="text-center text-gray-400 mb-8 text-sm">
            Réservez vos places de cinéma en un clic
          </p>

          {authError && (
            <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded text-red-400 text-sm flex items-center gap-2">
              <X size={16} />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="mb-4 p-3 bg-green-500/15 border border-green-500/30 rounded text-green-400 text-sm flex items-center gap-2">
              <Check size={16} />
              <span>{authSuccess}</span>
            </div>
          )}

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  className="form-input" 
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="votre_nom"
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input 
                  type="password" 
                  className="form-input" 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
              <Lock size={16} />
              <span>{isRegistering ? "S'inscrire" : "Se connecter"}</span>
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">
              {isRegistering ? "Déjà un compte ? " : "Pas encore de compte ? "}
            </span>
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError('');
                setAuthSuccess('');
              }} 
              className="text-indigo-400 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              {isRegistering ? "Se connecter" : "S'inscrire"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="glass-panel rounded-none border-t-0 border-x-0 py-4 px-6 mb-8 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clapperboard className="text-indigo-400" size={28} />
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              MoviieBooker
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <nav className="flex gap-4">
              <button 
                onClick={() => setActiveTab('movies')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'movies' 
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
                    : 'text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                Catalogue
              </button>
              <button 
                onClick={() => setActiveTab('reservations')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'reservations' 
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
                    : 'text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                Mes Réservations
              </button>
            </nav>

            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <User size={16} className="text-indigo-400" />
                <span className="font-semibold">{username}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full border border-red-500/20 transition-all"
                title="Déconnexion"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4">
        {activeTab === 'movies' ? (
          <div>
            {/* Search and Filters */}
            <div className="glass-panel p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
              <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[280px] relative">
                <input 
                  type="text" 
                  placeholder="Rechercher un film..." 
                  className="form-input pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
              </form>

              <div className="flex items-center gap-3">
                <ArrowUpDown size={18} className="text-gray-400" />
                <select 
                  className="form-input min-w-[180px] cursor-pointer"
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                >
                  <option value="">Trier par popularité</option>
                  <option value="primary_release_date.desc">Date de sortie (Récent)</option>
                  <option value="primary_release_date.asc">Date de sortie (Ancien)</option>
                  <option value="vote_average.desc">Note moyenne (Max)</option>
                  <option value="vote_average.asc">Note moyenne (Min)</option>
                </select>
              </div>
            </div>

            {/* Movies List */}
            {isLoadingMovies ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <RefreshCw className="animate-spin text-indigo-400 mb-4" size={32} />
                <span>Chargement des films...</span>
              </div>
            ) : movies.length === 0 ? (
              <div className="glass-panel p-12 text-center text-gray-400">
                <Film size={48} className="mx-auto text-gray-500 mb-4" />
                <h3>Aucun film trouvé</h3>
                <p className="text-sm">Essayez de modifier votre recherche ou vos filtres.</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {movies.map((movie) => (
                    <div key={movie.id} className="glass-card flex flex-col h-full">
                      <div className="relative aspect-[2/3] bg-gray-900 flex items-center justify-center overflow-hidden">
                        {movie.poster_path ? (
                          <img 
                            src={`${TMDB_IMAGE_BASE}${movie.poster_path}`} 
                            alt={movie.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-gray-500">
                            <Clapperboard size={48} />
                            <span className="text-xs">Pas d'affiche</span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-xs font-bold text-amber-400">
                          ★ {movie.vote_average?.toFixed(1) || '0.0'}
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-lg leading-snug line-clamp-1 mb-1 text-white" title={movie.title}>
                            {movie.title}
                          </h3>
                          <p className="text-xs text-gray-400 mb-3">
                            Sorti le : {movie.release_date ? new Date(movie.release_date).toLocaleDateString('fr-FR') : 'Inconnue'}
                          </p>
                          <p className="text-sm text-gray-400 line-clamp-3 mb-6">
                            {movie.overview || "Aucun synopsis disponible."}
                          </p>
                        </div>

                        <button 
                          onClick={() => openBookingModal(movie)}
                          className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                          <Calendar size={16} />
                          <span>Réserver</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-4 mt-12">
                  <button 
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="btn-secondary py-2.5 px-4 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft size={16} />
                    Précédent
                  </button>
                  <span className="text-sm font-semibold text-gray-300">
                    Page {page} sur {totalPages}
                  </span>
                  <button 
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="btn-secondary py-2.5 px-4 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Suivant
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Reservations Tab */
          <div>
            <h2 className="text-2xl font-bold mb-6 tracking-tight flex items-center gap-2">
              <Calendar className="text-indigo-400" size={24} />
              <span>Mes réservations</span>
            </h2>

            {isLoadingReservations ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <RefreshCw className="animate-spin text-indigo-400 mb-4" size={32} />
                <span>Chargement de vos réservations...</span>
              </div>
            ) : reservations.length === 0 ? (
              <div className="glass-panel p-12 text-center text-gray-400">
                <Calendar size={48} className="mx-auto text-gray-500 mb-4" />
                <h3>Aucune réservation</h3>
                <p className="text-sm">Vous n'avez pas encore réservé de film.</p>
                <button 
                  onClick={() => setActiveTab('movies')}
                  className="btn-primary mt-6 inline-flex items-center gap-2"
                >
                  <Film size={16} />
                  <span>Découvrir des films</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reservations.map((resItem) => (
                  <div key={resItem.id} className="glass-panel p-5 flex gap-4 items-center">
                    <div className="w-20 aspect-[2/3] rounded bg-gray-900 overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/5">
                      {resItem.moviePoster ? (
                        <img src={resItem.moviePoster} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Film className="text-gray-600" size={28} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-lg text-white truncate">
                          {resItem.movieTitle || `Film ID: ${resItem.movieId}`}
                        </h3>
                        <span className="badge badge-success">
                          {resItem.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                        <Clock size={14} className="text-indigo-400" />
                        <span>
                          {new Date(resItem.reservationDate).toLocaleString('fr-FR', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>

                      <div className="flex justify-end">
                        <button 
                          onClick={() => handleCancelReservation(resItem.id)}
                          className="btn-danger flex items-center gap-1.5 text-xs py-2 px-3"
                        >
                          <Trash2 size={14} />
                          <span>Annuler la réservation</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {selectedMovie && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content p-6 relative">
            <button 
              onClick={() => setSelectedMovie(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-transparent border-none cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold mb-4 tracking-tight pr-6">
              Réserver : {selectedMovie.title}
            </h3>

            {bookingError && (
              <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded text-red-400 text-sm flex items-center gap-2">
                <X size={16} />
                <span>{bookingError}</span>
              </div>
            )}

            {bookingSuccess && (
              <div className="mb-4 p-3 bg-green-500/15 border border-green-500/30 rounded text-green-400 text-sm flex items-center gap-2">
                <Check size={16} />
                <span>{bookingSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateReservation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Date & Heure de la séance
                </label>
                <input 
                  type="datetime-local" 
                  className="form-input" 
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required 
                />
                <p className="text-xs text-gray-500 mt-1">
                  Les réservations doivent être effectuées au moins 2 heures à l'avance.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setSelectedMovie(null)}
                  className="btn-secondary"
                  disabled={isBooking}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn-primary flex items-center gap-2"
                  disabled={isBooking}
                >
                  {isBooking ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    <Check size={16} />
                  )}
                  <span>Confirmer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
