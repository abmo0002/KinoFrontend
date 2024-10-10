const showingId = getQueryParam('id'); // Get the movie ID from the URL

if (showingId) {
    loadSeatsForShowing(showingId);
} else {
    document.getElementById('movieDetails').innerHTML = '<p>No showing ID selected</p>';
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

let selectedSeatIds = [];

// Function to load all seats for a specific showing
function loadSeatsForShowing(showingId) {
    // Fetch the seats data, including seatRows and seatsPerRow
    fetch(`http://localhost:8080/showing/${showingId}/seats`)
        .then(response => response.json())
        .then(data => {
            console.log('Data recieved from server:', data)
            const { bookedSeats, allSeats, seatRows, seatsPerRow } = data;  // Destructure the data
            renderSeats(allSeats, bookedSeats, seatRows, seatsPerRow);      // Pass seatRows and seatsPerRow to the render function
        })
        .catch(error => {
            console.error("Error fetching seats: ", error);
        });
}

// Function to check if a seat is booked
function isSeatBooked(seat, bookedSeats) {
    return bookedSeats.some(bookedSeat => bookedSeat.seatId === seat.seatId);
}

// Function to render all seats based on theater layout and mark occupied ones
function renderSeats(allSeats, bookedSeats, seatRows, seatsPerRow) {
    const container = document.querySelector('.container');
    container.innerHTML = ''; // Clear previous seats

    // Loop over all rows and seats per row
    for (let rowIndex = 1; rowIndex <= seatRows; rowIndex++) {
        const rowElement = document.createElement('div');
        rowElement.classList.add('row');  // Create a new row for each rowIndex

        for (let seatIndex = 1; seatIndex <= seatsPerRow; seatIndex++) {
            const seat = allSeats.find(seat => seat.rowNumber === rowIndex && seat.seatNumber === seatIndex);

            const seatElement = document.createElement('div');
            seatElement.classList.add('seat');  // Set default seat class
            seatElement.dataset.seatId = seat.seatId;

            // Set the text to display row and seat number
            seatElement.innerText = `${seat.rowNumber}-${seat.seatNumber}`;

            // Check if the seat is in the bookedSeats list
            if (isSeatBooked(seat, bookedSeats)) {
                seatElement.classList.add('occupied');  // Mark it as occupied
                seatElement.style.pointerEvents = 'none';  // Make it unclickable
            } else {
                seatElement.classList.add('available');  // Mark as available (clickable)
                seatElement.addEventListener('click', () => selectSeat(seat.seatId)); // Add click event for available seats
            }

            rowElement.appendChild(seatElement);
        }
        container.appendChild(rowElement);  // Append the row to the container after completing all seats in the row
    }

    // Update selected seats visually
    selectedSeatIds.forEach(seatId => {
        const selectedSeat = container.querySelector(`[data-seat-id="${seatId}"]`);
        if (selectedSeat) {
            selectedSeat.classList.add('selected');
        }
    });
}

// Function to handle seat selection
function selectSeat(seatId) {
    const selectedSeat = document.querySelector(`[data-seat-id="${seatId}"]`);

    // Toggle selection
    if (selectedSeat.classList.contains('selected')) {
        selectedSeat.classList.remove('selected');  // Unselect if already selected
        selectedSeatIds = selectedSeatIds.filter(id => id !== seatId); // Remove from selectedSeatIds
    } else {
        selectedSeat.classList.add('selected');  // Mark as selected
        selectedSeatIds.push(seatId); // Add to selectedSeatIds
    }

    console.log('Selected seat IDs: ', selectedSeatIds);
}

// Add event listener to the save booking button
document.getElementById('save_booking_btn').addEventListener('click', saveBooking);

// Function to handle saving the booking
function saveBooking() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    if (!email) {
        alert('Indtast venligst din email.');
        return;
    }

    createBooking(showingId, email, selectedSeatIds);
}

// Function to send booking data to the backend
function createBooking(showingId, email, seatIds) {
    if (!Array.isArray(seatIds) || seatIds.length === 0) {
        alert('No seats selected. Please select at least one seat.');
        return;
    }

    fetch(`http://localhost:8080/showing/booking/${showingId}?email=${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(seatIds) // Ensure you're sending an array
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text); });
            }
            return response.json();
        })
        .then(responseData => {
            alert('Booking gemt!');
            localStorage.setItem('bookingDetails', JSON.stringify(responseData));
            window.location.href= "../html/reservation.html"
            // Update the UI by calling loadSeatsForShowing
            //loadSeatsForShowing(showingId); // Refresh the seat display
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Der opstod en fejl under oprettelse af bookingen: ' + error.message);
        });
}


