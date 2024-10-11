
const modal = document.getElementById("edit-movie-modal");
const closeModalButton = document.getElementById("close-modal");
const cancelButton = document.getElementById("cancel-button");
const saveButton = document.getElementById("save-button");
const deleteButton = document.getElementById("delete-movie-btn");

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
let currentMovieId = null;
const backendUrl = 'http://localhost:8080';

searchButton.addEventListener("click", function () {
    const movieTitle = searchInput.value.trim();

    if (movieTitle) {
        fetch(`${backendUrl}/movies/search?title=${encodeURIComponent(movieTitle)}`)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("No movie found.");
                    } else {
                        throw new Error("Error fetching movie");
                    }
                }
                return response.json();
            })
            .then(movies => {
                if (movies.length > 0) {

                    const movie = movies[0];
                    currentMovieId = movie.movieId;


                    titleInput.value = movie.title;
                    releaseYearInput.value = movie.year;
                    runtimeInput.value = movie.runtime;
                    genreInput.value = movie.genres.map(g => g.genreName).join(', ');
                    movieDirectorsInput.value = movie.directors.map(d => d.fullName).join(', ');
                    movieActorsInput.value = movie.actors.map(a => a.fullName).join(', ');
                    movieposterInput.value = movie.poster;
                    movieImdbInput.value = movie.imdbRating;
                    movieRelaseDateInput.value = movie.released;

                    modal.classList.add("modal-open");
                } else {
                    alert("No movie found");
                }
            })
            .catch(error => alert(error.message));
    } else {
        alert("Please chose i movie title");
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
        imdbID: movieImdbIDInput.value.trim()
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
                    alert("Movie has been updated");
                    modal.classList.remove("modal-open");
                } else {
                    alert("An error has occurred doing updating");
                }
            })
            .catch(error => console.error("An error has occurred doing updating:", error));
    } else {
        alert("No movie i chosen to be updated");
    }

})
deleteButton.addEventListener("click", function () {
    if (currentMovieId) {
        if (confirm("Are you sure you want to delete the movie")) {
            fetch(`${backendUrl}/movie/${currentMovieId}`, {
                method: 'DELETE',
            })
                .then(response => {
                    if (response.ok) {
                        alert("The movie is deleted!");
                        modal.classList.remove("modal-open");
                    } else {
                        alert("An error has occurred while deleting the movie");
                    }
                })
                .catch(error => console.error("An error while deleting the movie:", error));
        }
    } else {
        alert("No movie are chosen to be deleted.");
    }
});
