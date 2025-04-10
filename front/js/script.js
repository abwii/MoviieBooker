document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = 'http://localhost:3000';

    // Gestion de l'inscription
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const username = document.getElementById("username").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch(`${apiUrl}/auth/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ username, email, password })
                });
                const data = await response.json();
                alert(data.message);
                window.location.href = "login.html";
            } catch (error) {
                console.error("Error:", error);
                alert("Erreur lors de l'inscription.");
            }
        });
    }

    // Gestion de la connexion
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch(`${apiUrl}/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();

                if (data.access_token) {
                    localStorage.setItem("token", data.access_token);
                    window.location.href = "reservation.html";
                } else {
                    alert("Erreur de connexion.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Erreur lors de la connexion.");
            }
        });
    }

    // Gestion de la réservation
    const reservationForm = document.getElementById("reservationForm");
    if (reservationForm) {
        reservationForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const userId = localStorage.getItem("userId"); // Vous devez récupérer l'ID de l'utilisateur depuis votre session
            const movieId = document.getElementById("movieId").value;
            const reservationDate = document.getElementById("reservationDate").value;

            try {
                const response = await fetch(`${apiUrl}/reservations`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({ userId, movieId, reservationDate })
                });
                const data = await response.json();
                alert(data.message || "Réservation réussie");
            } catch (error) {
                console.error("Error:", error);
                alert("Erreur lors de la réservation.");
            }
        });
    }

    // Afficher les réservations de l'utilisateur
    const reservationsList = document.getElementById("reservationsList");
    if (reservationsList) {
        const userId = localStorage.getItem("userId");

        if (userId) {
            fetch(`${apiUrl}/reservations/${userId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            })
                .then(response => response.json())
                .then(reservations => {
                    if (reservations.length > 0) {
                        reservations.forEach(reservation => {
                            const div = document.createElement("div");
                            div.classList.add("card", "mb-3");
                            div.innerHTML = `
                                <div class="card-body">
                                    <h5 class="card-title">Réservation de film #${reservation.id}</h5>
                                    <p>Film ID: ${reservation.movieId}</p>
                                    <p>Réservé le: ${reservation.reservationDate}</p>
                                </div>
                            `;
                            reservationsList.appendChild(div);
                        });
                    } else {
                        reservationsList.innerHTML = "<p>Aucune réservation trouvée.</p>";
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    reservationsList.innerHTML = "<p>Erreur de récupération des réservations.</p>";
                });
        }
    }
});
