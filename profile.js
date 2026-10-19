
// Shared TaskFlow user profile
(function () {
    function loadUserProfile() {
        let user = {};

        try {
            user = JSON.parse(
                localStorage.getItem("taskflow_current_user") || "{}"
            );
        } catch (error) {
            user = {};
        }

        const name =
            typeof user.name === "string" && user.name.trim()
                ? user.name.trim()
                : "User";

        // Update existing profile elements only
        const userName = document.getElementById("userName");
        const userInitial = document.getElementById("userInitial");

        if (userName) {
            userName.textContent = name;
        }

        if (userInitial) {
            userInitial.textContent = name.charAt(0).toUpperCase();
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            loadUserProfile
        );
    } else {
        loadUserProfile();
    }
})();
