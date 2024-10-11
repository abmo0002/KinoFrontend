document.addEventListener("DOMContentLoaded", () => {
    const movieId = getQueryParam('id');

    if (movieId) {
        fetchMovieDetails(movieId);
        fetchShowings(movieId);
    } else {
        document.getElementById('movieDetails').innerHTML = '<p>No movie ID specified.</p>';
    }


    function fetchMovieDetails(movieId) {
        fetch(`http://localhost:8080/movie/${movieId}`)
            .then(response => response.json())
            .then(movie => {
                if (movie) {

                    document.getElementById("movieTitle").textContent = movie.title || 'N/A';
                    document.getElementById("releaseYear").textContent = movie.year || 'N/A';
                    document.getElementById("moviePoster").src = movie.poster || 'default_poster.jpg';

                    if (movie.actors && Array.isArray(movie.actors)) {
                        const actorList = movie.actors.map(actor => `<li>${actor.fullName}</li>`).join('');
                        document.getElementById("actors").innerHTML = `<ul>${actorList}</ul>`;
                    } else {
                        document.getElementById("actors").textContent = 'N/A';
                    }
                    if (movie.directors && Array.isArray(movie.directors)) {
                        const directorList = movie.directors.map(director => `<li>${director.fullName}</li>`).join('');
                        document.getElementById("directors").innerHTML = `<ul>${directorList}</ul>`;
                    } else {
                        document.getElementById("directors").textContent = 'Unknown';
                    }
                    if (movie.genres && Array.isArray(movie.genres)) {
                        const genreNames = movie.genres.map(genre => genre.genreName).join(', ');
                        document.getElementById("genres").textContent = genreNames || 'N/A';
                    } else {
                        document.getElementById("genres").textContent = 'N/A';
                    }

                } else {
                    document.getElementById('movie').innerHTML = '<p>Movie is not found.</p>';
                }

            })
            .catch(error => {
                console.error('Error fetching movie details:', error);
                document.getElementById('movie').innerHTML = '<p>Error fetching details.</p>';
            });


    }


    function fetchShowings(movieId) {
        fetch(`http://localhost:8080/showing/showings/${movieId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const showingsList = document.getElementById("showingsList");
                showingsList.innerHTML = "";


                if (data && data.length > 0) {
                    data.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
                    data.forEach(showing => {
                        const listItem = document.createElement("li");
                        const dateTime = new Date(showing.dateTime);
                        const day = dateTime.getDate();
                        const month = dateTime.getMonth() + 1
                        const time = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        listItem.textContent = `${day}/${month} - ${time}, Cinema hal: ${showing.theatre.theatreId}`;


                        listItem.addEventListener('click', function() {
                            window.location.href = `bio.html?id=${showing.showingId}`;
                        });

                        showingsList.appendChild(listItem);
                    });
                } else {
                    showingsList.innerHTML = "<li>No showings available</li>";
                }
            })
            .catch(error => {
                console.error('Error fetching showings:', error);
                const showingsList = document.getElementById("showingsList");
                showingsList.innerHTML = "<li>Error fetching showings.</li>";
            });
    }


    const modal = document.getElementById("showingModal");
    const addShowingButton = document.getElementById("addShowingButton");
    const closeModal = document.querySelector(".close");

    async function adminLoggedIn() {
        try {
            const response = await fetch("http://localhost:8080/admin/check-employee-session", {
                method: "GET",
                credentials: "include"
            });
            return response.ok;
        } catch (error) {
            console.error("Error checking employee session:", error);
            return false;
        }
    }


    adminLoggedIn().then((isLoggedIn) => {
        if (isLoggedIn) {
            addShowingButton.style.display = 'inline-block';
            addShowingButton.addEventListener("click", () => {
                modal.style.display = "block";
            });
        }
    });

    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });


    const addShowingForm = document.getElementById("addShowingForm");
    addShowingForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const showingData = {
            movie: { movieId: movieId },
            theatre: { theatreId: document.getElementById("theatreId").value },
            admin: { adminId: document.getElementById("adminId").value },
            dateTime: document.getElementById("dateTime").value,

        };


        fetch("http://localhost:8080/showing/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(showingData)
        })
            .then(response => response.json())
            .then(data => {
                console.log("Showing created:", data);
                modal.style.display = "none";
                fetchShowings(movieId);
            })
            .catch(error => console.error('Error for adding a showing:', error));
    });
});


function populateTheatreDropdown() {
    const theatreSelect = document.getElementById('theatreId');


    fetch('http://localhost:8080/showing/cinema-halls')
        .then(response => response.json())
        .then(theatres => {
            theatreSelect.innerHTML = '';

            const placeholderOption = document.createElement('option');
            placeholderOption.text = "Select a Theatre";
            placeholderOption.value = "";
            theatreSelect.appendChild(placeholderOption);

            theatres.forEach(theatre => {
                const option = document.createElement('option');
                option.value = theatre.theatreId;
                option.text = theatre.theatreId;
                theatreSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching theatres:', error));
}


document.addEventListener('DOMContentLoaded', populateTheatreDropdown);

function populateAdminDropdown() {
    const adminSelect = document.getElementById('adminId');


    fetch('http://localhost:8080/showing/employees')
        .then(response => response.json())
        .then(admins => {
            adminSelect.innerHTML = '';

            const placeholderOption = document.createElement('option');
            placeholderOption.text = "Pick a user";
            placeholderOption.value = "";
            adminSelect.appendChild(placeholderOption);

            admins.forEach(admin => {
                const option = document.createElement('option');
                option.value = admin.adminId;
                option.text = admin.username;
                adminSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching admins:', error));
}

document.addEventListener('DOMContentLoaded', populateAdminDropdown);


function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}
