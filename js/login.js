document.getElementById("login-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const Username = document.getElementById("Username").value;
    const password = document.getElementById("password").value;

    try {
        // Ensure the path is correct
        const response = await fetch("http://localhost:8080/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: Username,
                password: password
            }),
            credentials: "include" // Include credentials (cookies) in the request
        });

        if (response.ok) {
            alert("Du er nu logget ind som admin");
            window.location.href = 'employee.html'; // Redirect to the admin dashboard
        } else {
            document.getElementById("error-message").style.display = "block";
        }
    } catch (error) {
        console.error("Error", error);
        document.getElementById("error-message").innerText = "Der skete en fejl, prøv igen!";
        document.getElementById("error-message").style.display = "block";
    }
});