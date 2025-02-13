document.getElementById("verify-form").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent page reload

    const phoneNumber = sessionStorage.getItem("phone"); // Retrieve stored phone number
    const verificationCode = document.getElementById("verification_code").value.trim();

    if (!verificationCode) {
        alert("Please enter your verification code.");
        return;
    }

    const data = { phone: phoneNumber, code: verificationCode };
    const url = "/verify-code";

    try {
        const response = await fetch(url, {
            method: "POST",
            mode: "cors", 
            cache: "no-cache", 
            credentials: "omit",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            alert("Session created successfully!");
            window.location.href = "success.html"; 
        } else {
            alert("Verification failed. Please check your code.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An unexpected error occurred. Please try again.");
    }
});
