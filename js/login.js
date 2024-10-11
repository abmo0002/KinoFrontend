document.getElementById("login-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        
        const response = await fetch("http://localhost:8080/employee/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            }),
            credentials: "include" 
        });

        if (response.ok) {
            alert("You are now logged in as an employee");
            window.location.href = 'employee.html'; 
        } else {
            document.getElementById("error-message").style.display = "block";
        }
    } catch (error) {
        console.error("Error", error);
        document.getElementById("error-message").innerText = "an error has occurred!";
        document.getElementById("error-message").style.display = "block";
    }
});