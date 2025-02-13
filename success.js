document.addEventListener("DOMContentLoaded", function() {
    const progressBar = document.querySelector(".progress");
    const statusText = document.getElementById("status-text");

    let time = 0;
    const messages = [
        "Initializing...",
        "Connecting to Server...",
        "Authenticating...",
        "Deploying Modules...",
        "Finalizing Setup...",
        "Almost Done...",
        "Deployment Complete!"
    ];

    // Animate progress bar
    progressBar.style.width = "100%";

    // Change text messages over time
    const interval = setInterval(() => {
        time += 20;
        statusText.innerText = messages[Math.floor(time / 20)] || "Deployment Complete!";
        
        if (time >= 120) {
            clearInterval(interval);
            document.querySelector("h1").innerText = "Deployed!";
        }
    }, 20000); // Change message every 20 seconds
});
