// Check if admin is logged in
async function checkAdminSession() {
    try {
        const response = await fetch("http://localhost:8080/admin/check-admin-presence", {
            method: "GET",
            credentials: "include" // Include credentials for session management
        });

        if (!response.ok) {
            // If the response is not OK, redirect to login
            window.location.href = "../html/login.html";
        }
    } catch (error) {
        console.error("Error checking admin session:", error);
        window.location.href = "../html/login.html"; // Redirect on error
    }
}

// Call the session check on page load
document.addEventListener("DOMContentLoaded", function() {
    checkAdminSession();
});

document.getElementById("create-admin-btn").addEventListener("click", function() {
    document.getElementById("create-admin-modal").style.display = "block";
});

document.getElementById("create-admin-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("new-username").value;
    const password = document.getElementById("new-password").value;
    const fullName = document.getElementById("new-fullname").value;

    try {
        const response = await fetch("http://localhost:8080/admin/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password,
                fullName: fullName
            })
        });

        if (response.ok) {
            alert("Admin registered successfully");
            // Optionally, reset the form or close the modal
            document.getElementById("create-admin-form").reset();
            document.getElementById("create-admin-modal").style.display = "none";
        } else {
            const errorText = await response.text();
            alert("Error: " + errorText);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while registering the admin.");
    }
});
document.getElementById("edit-movie-btn").addEventListener("click", function() {
    window.location.href = "editMovie.html";
});
document.getElementById("create-theatre").addEventListener("click", function (){
    document.getElementById("create-theatre-modal").style.display="block";
});

document.getElementById("create-theatre-form").addEventListener("submit", async function(event) {
    event.preventDefault();
    const seatRows = document.getElementById("rows").value;
    const seatsPerRow = document.getElementById("seats").value;

    try {
        const response = await fetch("http://localhost:8080/theatre/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                seatRows: seatRows,  // Use seatRows instead of rows
                seatsPerRow: seatsPerRow  // Use seatsPerRow instead of seats
            })
        });

        if (response.ok) {
            alert("Theatre created successfully");
            document.getElementById("create-theatre-form").reset();
            document.getElementById("create-theatre-modal").style.display = "none";
        } else {
            const errorText = await response.text();
            alert("Error: " + errorText);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while creating the theatre.");
    }
});














document.getElementById('btn-save-movie').addEventListener('click', function () {
    const movie = {
        title: document.getElementById('input-title').value,
        year: document.getElementById('input-year').value,
        released: document.getElementById('input-released').value,
        runtime: document.getElementById('input-runtime').value,
        genres: document.getElementById('input-genre').value.split(',').map(name => ({ genreName: name.trim() })).filter(g => g.genreName),
        directors: document.getElementById('input-director').value.split(',').map(name => ({ fullName: name.trim() })).filter(d => d.fullName),
        actors: document.getElementById('input-actors').value.split(',').map(name => ({ fullName: name.trim() })).filter(a => a.fullName),
        poster: document.getElementById('input-poster').value,
        imdbRating: document.getElementById('input-imdbRating').value,
        imdbID: document.getElementById('input-imdbID').value
    };

    // Log the movie object to debug
    console.log("Submitting movie:", movie);

    fetch('http://localhost:8080/movies', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(movie),
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text); });
            }
            return response.json();
        })
        .then(addedMovie => {
            alert('Movie added successfully');

            const moviesGrid = document.getElementById('moviesGrid');
            const movieItem = document.createElement('div');
            movieItem.classList.add('movie-item');

            movieItem.innerHTML = `
    <div class="poster">
        <a href="/movie-details.html?id=${addedMovie.movieId}">
            <img src="${addedMovie.poster}" alt="${addedMovie.title} Poster">
        </a>
    </div>
    <div class="title">${addedMovie.title}</div>
`;



            moviesGrid.appendChild(movieItem);

            // Reset the form
            document.getElementById('movie-form').reset();
            const modal = bootstrap.Modal.getInstance(document.getElementById('movie-modal'));
            modal.hide();
        })
        .catch(error => console.error('Error:', error));
});
