
fetch('http://localhost:8080/movies')
    .then(response => response.json())
    .then(data => {
        const moviesGrid = document.getElementById('moviesGrid');
        data.forEach(movie => {
            const movieItem = document.createElement('div');
            movieItem.classList.add('movie-item');

            movieItem.innerHTML = `
                <div class="poster">
                    <a href="movie.html?id=${movie.movieId}">
                        <img src="${movie.poster}" alt="${movie.title} Poster">
                    </a>
                </div>
                <div class="title">${movie.title}</div>
            `;

            moviesGrid.appendChild(movieItem);
        });
    })
    .catch(error => console.error('Error fetching movies:', error));



