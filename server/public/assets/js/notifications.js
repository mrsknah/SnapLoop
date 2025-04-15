document.addEventListener("DOMContentLoaded", () => {
    const notifList = document.querySelector(".notification-list");
    if (notifList) {
      const sample = [
        "🌟 You have a new follower!",
        "📷 Someone liked your photo.",
        "💬 New comment on your post!",
      ];
  
      notifList.innerHTML = sample
        .map(msg => `<li class="notif-item">${msg}</li>`)
        .join("");
    }
  });
  