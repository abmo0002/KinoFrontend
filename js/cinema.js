const showingId = getQueryParam('id');

if (showingId) {
    loadSeatsForShowing(showingId);
} else {
    document.getElementById('movie').innerHTML = '<p>No showing ID selected</p>';
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

let selectedSeatIds = [];


function loadSeatsForShowing(showingId) {

    fetch(`http://localhost:8080/showing/${showingId}/seats`)
        .then(response => response.json())
        .then(data => {
            console.log('Data recieved from server:', data)
            const { bookedSeats, allSeats, seatRows, seatsPerRow } = data;
            renderSeats(allSeats, bookedSeats, seatRows, seatsPerRow);
        })
        .catch(error => {
            console.error("Error fetching seats: ", error);
        });
}


function isSeatBooked(seat, bookedSeats) {
    return bookedSeats.some(bookedSeat => bookedSeat.seatId === seat.seatId);
}


function renderSeats(allSeats, bookedSeats, seatRows, seatsPerRow) {
    const container = document.querySelector('.container');
    container.innerHTML = '';


    for (let rowIndex = 1; rowIndex <= seatRows; rowIndex++) {
        const rowElement = document.createElement('div');
        rowElement.classList.add('row');

        for (let seatIndex = 1; seatIndex <= seatsPerRow; seatIndex++) {
            const seat = allSeats.find(seat => seat.rowNumber === rowIndex && seat.seatNumber === seatIndex);

            const seatElement = document.createElement('div');
            seatElement.classList.add('seat');
            seatElement.dataset.seatId = seat.seatId;


            seatElement.innerText = `${seat.rowNumber}-${seat.seatNumber}`;


            if (isSeatBooked(seat, bookedSeats)) {
                seatElement.classList.add('occupied');
                seatElement.style.pointerEvents = 'none';
            } else {
                seatElement.classList.add('available');
                seatElement.addEventListener('click', () => selectSeat(seat.seatId));
            }

            rowElement.appendChild(seatElement);
        }
        container.appendChild(rowElement);
    }


    selectedSeatIds.forEach(seatId => {
        const selectedSeat = container.querySelector(`[data-seat-id="${seatId}"]`);
        if (selectedSeat) {
            selectedSeat.classList.add('selected');
        }
    });
}


function selectSeat(seatId) {
    const selectedSeat = document.querySelector(`[data-seat-id="${seatId}"]`);


    if (selectedSeat.classList.contains('selected')) {
        selectedSeat.classList.remove('selected');
        selectedSeatIds = selectedSeatIds.filter(id => id !== seatId);
    } else {
        selectedSeat.classList.add('selected');
        selectedSeatIds.push(seatId);
    }

    console.log('Selected seat IDs: ', selectedSeatIds);
}


document.getElementById('save_booking_btn').addEventListener('click', saveBooking);


function saveBooking() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    if (!email) {
        alert('Write your email.');
        return;
    }

    createBooking(showingId, email, selectedSeatIds);
}


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
        body: JSON.stringify(seatIds)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text); });
            }
            return response.json();
        })
        .then(responseData => {
            alert('Booking is saved!');
            localStorage.setItem('bookingDetails', JSON.stringify(responseData));
            window.location.href= "../html/reservation.html"

        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while creating the booking' + error.message);
        });
}


