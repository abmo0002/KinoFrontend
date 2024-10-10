document.addEventListener("DOMContentLoaded", () => {
    const movieId = getQueryParam('id'); // Get the movie ID from the URL

    if (movieId) {
        fetchMovieDetails(movieId);
        fetchShowings(movieId);
    } else {
        document.getElementById('movieDetails').innerHTML = '<p>No movie ID specified.</p>';
    }

    // Function to fetch movie details from the backend
    function fetchMovieDetails(movieId) {
        fetch(`http://localhost:8080/movie/${movieId}`)
            .then(response => response.json())
            .then(movie => {
                if (movie) {
                    // Update the DOM with movie details
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
                        document.getElementById("directors").textContent = 'N/A';
                    }
                    if (movie.genres && Array.isArray(movie.genres)) {
                        const genreNames = movie.genres.map(genre => genre.genreName).join(', ');
                        document.getElementById("genres").textContent = genreNames || 'N/A';
                    } else {
                        document.getElementById("genres").textContent = 'N/A';
                    }

                } else {
                    document.getElementById('movieDetails').innerHTML = '<p>Movie not found.</p>';
                }

            })
            .catch(error => {
                console.error('Error fetching movie details:', error);
                document.getElementById('movieDetails').innerHTML = '<p>Error fetching movie details.</p>';
            });


    }

    // Updated fetchShowings function
    function fetchShowings(movieId) {
        fetch(`http://localhost:8080/showing/showings/${movieId}`) // Adjusted endpoint to match your backend
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const showingsList = document.getElementById("showingsList");
                showingsList.innerHTML = ""; // Clear any previous showings

                // Loop through the showings and add them to the list
                if (data && data.length > 0) {
                    data.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
                    data.forEach(showing => {
                        const listItem = document.createElement("li");
                        const dateTime = new Date(showing.dateTime);
                        const day = dateTime.getDate();
                        const month = dateTime.getMonth() + 1 //Starter fra 0 så der tilføjes 1;
                        const time = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        listItem.textContent = `${day}/${month} - ${time}, Sal: ${showing.theatre.theatreId}`;

                        // Add click event to change the location
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

    // Modal handling for "Add New Showing"
    const modal = document.getElementById("showingModal");
    const addShowingButton = document.getElementById("addShowingButton");
    const closeModal = document.querySelector(".close");

    async function adminLoggedIn() {
        try {
            const response = await fetch("http://localhost:8080/admin/check-admin-presence", {
                method: "GET",
                credentials: "include" // Include credentials for session management
            });
            return response.ok;
        } catch (error) {
            console.error("Error checking admin session:", error);
            return false;
        }
    }

// Show the button if the condition is met
    adminLoggedIn().then((isLoggedIn) => {
        if (isLoggedIn) {
            addShowingButton.style.display = 'inline-block';
            addShowingButton.addEventListener("click", () => {
                modal.style.display = "block"; // Show the modal
            });
        }
    });

    closeModal.addEventListener("click", () => {
        modal.style.display = "none"; // Hide the modal
    });

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none"; // Hide the modal when clicking outside
        }
    });

    // Form submission for adding a new showing
    const addShowingForm = document.getElementById("addShowingForm");
    addShowingForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent the form from submitting normally

        const showingData = {
            movie: { movieId: movieId },
            theatre: { theatreId: document.getElementById("theatreId").value },
            admin: { adminId: document.getElementById("adminId").value },
            dateTime: document.getElementById("dateTime").value,

        };

        // Send a POST request to the backend to create a new showing
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
                modal.style.display = "none"; // Close the modal
                fetchShowings(movieId); // Refresh the showings list
            })
            .catch(error => console.error('Error adding showing:', error));
    });
});

// movie_detail.js

// Function to populate theatre dropdown
function populateTheatreDropdown() {
    const theatreSelect = document.getElementById('theatreId');

    // Fetch the list of theatres from the backend
    fetch('http://localhost:8080/showing/theatres')
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

// Call the function when the page is loaded or modal is opened
document.addEventListener('DOMContentLoaded', populateTheatreDropdown);

function populateAdminDropdown() {
    const adminSelect = document.getElementById('adminId');


    fetch('http://localhost:8080/showing/admins')
        .then(response => response.json())
        .then(admins => {
            adminSelect.innerHTML = '';

            const placeholderOption = document.createElement('option');
            placeholderOption.text = "Select a user";
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
