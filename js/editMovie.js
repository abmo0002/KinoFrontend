// Modal elements
const modal = document.getElementById("edit-movie-modal");
const closeModalButton = document.getElementById("close-modal");
const cancelButton = document.getElementById("cancel-button");
const saveButton = document.getElementById("save-button");
const deleteButton = document.getElementById("delete-movie-btn");
// Input elements
const searchInput = document.getElementById("searched-movie");
const searchButton = document.getElementById("search-button");
const titleInput = document.getElementById("movie-title");
const releaseYearInput = document.getElementById("movie-release-year");
const genreInput = document.getElementById("movie-genre");
const runtimeInput = document.getElementById("movie-runtime");
const movieposterInput = document.getElementById("movie-poster");
const movieImdbInput = document.getElementById("movie-Imdb-rating");
const movieActorsInput = document.getElementById("movie-actors");
const movieDirectorsInput = document.getElementById("movie-directors");
const movieRelaseDateInput = document.getElementById("movie-release-date");
let currentMovieId = null; // To keep track of the current movie
const backendUrl = 'http://localhost:8080'; // Replace with your backend's URL and port

searchButton.addEventListener("click", function () {
    const movieTitle = searchInput.value.trim();

    if (movieTitle) {
        fetch(`${backendUrl}/movies/search?title=${encodeURIComponent(movieTitle)}`)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("Ingen film fundet.");
                    } else {
                        throw new Error("Fejl ved hentning af film.");
                    }
                }
                return response.json();
            })
            .then(movies => {
                if (movies.length > 0) {
                    // For simplicity, take the first movie that matches
                    const movie = movies[0];
                    currentMovieId = movie.movieId;

                    // Populate modal with movie data
                    titleInput.value = movie.title;
                    releaseYearInput.value = movie.year;
                    runtimeInput.value = movie.runtime;
                    genreInput.value = movie.genres.map(g => g.genreName).join(', ');
                    movieDirectorsInput.value = movie.directors.map(d => d.fullName).join(', ');
                    movieActorsInput.value = movie.actors.map(a => a.fullName).join(', ');
                    movieposterInput.value = movie.poster;
                    movieImdbInput.value = movie.imdbRating;
                    movieRelaseDateInput.value = movie.released;
                    // Open the modal
                    modal.classList.add("modal-open");
                } else {
                    alert("Ingen film fundet.");
                }
            })
            .catch(error => alert(error.message));
    } else {
        alert("Indtast venligst en film titel.");
    }
});

saveButton.addEventListener("click", function (e) {
    e.preventDefault();

    const updatedMovie = {
        movieId: currentMovieId,
        title: titleInput.value.trim(),
        year: releaseYearInput.value,
        released: movieRelaseDateInput.value.trim(),
        runtime: runtimeInput.value.trim(),
        genres: genreInput.value.split(',').map(name => ({ genreName: name.trim() })).filter(g => g.genreName),
        directors: movieDirectorsInput.value.split(',').map(name => ({ fullName: name.trim() })).filter(d => d.fullName),
        actors: movieActorsInput.value.split(',').map(name => ({ fullName: name.trim() })).filter(a => a.fullName),
        poster: movieposterInput.value.trim(),
        imdbRating: movieImdbInput.value.trim(),
        imdbID: movieImdbIDinput.value.trim()
    };

    if (currentMovieId) {
        fetch(`${backendUrl}/movie/${currentMovieId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedMovie),
        })
            .then(response => {
                if (response.ok) {
                    alert("Filmen er blevet opdateret!");
                    modal.classList.remove("modal-open");
                } else {
                    alert("Der opstod en fejl under opdateringen.");
                }
            })
            .catch(error => console.error("Fejl ved opdatering af film:", error));
    } else {
        alert("Ingen film valgt til opdatering.");
    }
    ;
})
deleteButton.addEventListener("click", function () {
    if (currentMovieId) {
        if (confirm("Er du sikker på, at du vil slette denne film?")) {
            fetch(`${backendUrl}/movie/${currentMovieId}`, {
                method: 'DELETE',
            })
                .then(response => {
                    if (response.ok) {
                        alert("Filmen er blevet slettet!");
                        modal.classList.remove("modal-open");
                    } else {
                        alert("Der opstod en fejl under sletningen.");
                    }
                })
                .catch(error => console.error("Fejl ved sletning af film:", error));
        }
    } else {
        alert("Ingen film valgt til sletning.");
    }
});
