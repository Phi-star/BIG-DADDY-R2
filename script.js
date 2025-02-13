document.getElementById("telethon-form").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent page reload

    const apiId = document.getElementById("api_id").value.trim();
    const apiHash = document.getElementById("api_hash").value.trim();
    const phoneNumber = document.getElementById("phone_number").value.trim();

    if (!apiId || !apiHash || !phoneNumber) {
        alert("Please enter all required details.");
        return;
    }

    // Ensure phone number is in correct format
    const formattedPhone = phoneNumber.replace(/\s+/g, ''); // Remove spaces

    const data = { api_id: apiId, api_hash: apiHash, phone: formattedPhone };
    const url = "/generate-session";

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
            alert("Verification code sent successfully. Please enter it on the next page.");
            sessionStorage.setItem("phone", formattedPhone); // Store phone number for next step
            window.location.href = "/verify-code.html";
        } else {
            alert(`Failed to start session: ${result.message}`);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An unexpected error occurred. Please try again.");
    }
});
