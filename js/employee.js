async function checkEmployeeSession() {
    try {
        const response = await fetch("http://localhost:8080/employee/check-employee-session", {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {

            window.location.href = "../html/login.html";
        }
    } catch (error) {
        console.error("Error checking employee session:", error);
        window.location.href = "../html/login.html";
    }
}


document.addEventListener("DOMContentLoaded", function() {
    checkEmployeeSession();
});

document.getElementById("create-employee-btn").addEventListener("click", function() {
    document.getElementById("create-employee-modal").style.display = "block";
});

document.getElementById("create-employee-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("new-username").value;
    const password = document.getElementById("new-password").value;
    const fullName = document.getElementById("new-fullname").value;

    try {
        const response = await fetch("http://localhost:8080/employee/register", {
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
            alert("Employee is registered successfully");

            document.getElementById("create-employee-form").reset();
            document.getElementById("create-employee-modal").style.display = "none";
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
document.getElementById("create-cinema-hall").addEventListener("click", function (){
    document.getElementById("create-cinema-hall-modal").style.display="block";
});


document.getElementById("create-cinema-hall-form").addEventListener("submit", async function(event) {
    event.preventDefault();
    const seatRows = document.getElementById("rows").value;
    const seatsPerRow = document.getElementById("seats").value;

    try {
        const response = await fetch("http://localhost:8080/cinema-hall/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                seatRows: seatRows,
                seatsPerRow: seatsPerRow
            })
        });

        if (response.ok) {
            alert("Cinema hall created successfully");
            document.getElementById("create-cinema-hall-form").reset();
            document.getElementById("create-cinema-hall-modal").style.display = "none";
        } else {
            const errorText = await response.text();
            alert("Error: " + errorText);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while creating the cinema hall.");
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


            document.getElementById('movie-form').reset();
            const modal = bootstrap.Modal.getInstance(document.getElementById('movie-modal'));
            modal.hide();
        })
        .catch(error => console.error('Error:', error));
});
