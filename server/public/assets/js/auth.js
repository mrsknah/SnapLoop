// Login
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    try {
      const response = await fetch("http://<YOUR_BACKEND_IP>/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.user.username); // Simpan username
        window.location.href = "profile.html";
      } else {
        alert(data.message || "Login failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }
  });
}

// Register
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const userData = {
      email: registerForm.email.value,
      password: registerForm.password.value,
      fullName: registerForm.fullname.value,
      username: registerForm.username.value,
    };

    try {
      const res = await fetch("http://<YOUR_BACKEND_IP>/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.user.username); // Simpan username
        window.location.href = "upload-photo.html"; // Next step: upload profile photo
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }
  });
}
