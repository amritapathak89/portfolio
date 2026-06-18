// Single DOM-ready entry point. Each feature guards for the elements it needs,
// so adding a feature here is safe across every page that loads this script.
document.addEventListener("DOMContentLoaded", () => {
  initContactForm();
});

/* Contact form submission */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return; // No contact form on this page.

  const backendUrl = (window.APP_CONFIG && window.APP_CONFIG.backendUrl) || "http://localhost:8000";
  const status = document.getElementById("formStatus");

  function showStatus(message, ok) {
    if (!status) return;
    status.textContent = message;
    status.className = `text-sm mt-2 ${ok ? "text-green-600" : "text-red-600"}`;
  }

  const getValue = (id) => {
    const el = document.getElementById(id);
    return el ? el.value : "";
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = {
      name: getValue("name"),
      email: getValue("email"),
      company: getValue("company"),
      phone: getValue("phone"),
      message: getValue("message"),
      website: getValue("website"), // honeypot — should stay empty
    };

    showStatus("Sending…", true);

    try {
      const response = await fetch(`${backendUrl}/submit-form`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        showStatus(result.message || "Form submitted successfully!", true);
        form.reset();
      } else {
        const detail = result.errors ? result.errors.join(", ") : result.message;
        showStatus(`Error: ${detail || "submission failed"}`, false);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      showStatus("An error occurred while submitting the form.", false);
    }
  });
}
