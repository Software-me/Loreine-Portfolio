(function () {
  "use strict";

  var form = document.getElementById("chat-form");
  var statusEl = document.getElementById("chat-form-status");

  if (!form || !statusEl) return;

  function setStatus(message, type) {
    statusEl.textContent = message || "";
    statusEl.classList.remove("is-success", "is-error");
    if (type) statusEl.classList.add(type);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var endpoint = form.getAttribute("action");
    if (!endpoint || endpoint.indexOf("yourFormId") !== -1) {
      setStatus("Set your real Formspree endpoint in contact.html before sending.", "is-error");
      return;
    }

    var formData = new FormData(form);
    setStatus("Sending message...", "");

    fetch(endpoint, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Submission failed");
        form.reset();
        setStatus("Message sent successfully. Loreine can reply to your email.", "is-success");
      })
      .catch(function () {
        setStatus("Could not send message right now. Please try again in a moment.", "is-error");
      });
  });
})();
