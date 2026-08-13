const contactModal = document.getElementById("contact-modal");
const contactDialog = contactModal?.querySelector('[role="dialog"]');
const contactForm = document.getElementById("contactForm");
const formContainer = document.getElementById("formContainer");
const successMessage = document.getElementById("success");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const btnIcon = document.getElementById("btnIcon");
const contactSubmitFrame = document.getElementById("contact-submit-frame");
const contactFormStatus = document.getElementById("contact-form-status");

let lastFocusedElement = null;
let inquirySubmitted = false;
let submissionInFlight = false;
let submissionFallbackTimer = null;

const requiredFields = [
  {
    id: "name",
    isValid: (value) => value.trim().length > 0
  },
  {
    id: "email",
    isValid: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  },
  {
    id: "phone",
    isValid: (value) => value.trim().length >= 5
  },
  {
    id: "existingSite",
    isValid: (value) => value.trim().length > 0
  },
  {
    id: "service",
    isValid: (value) => value !== ""
  },
  {
    id: "idea",
    isValid: (value) => value !== ""
  },
  {
    id: "timeline",
    isValid: (value) => value !== ""
  }
];

function setFieldValidity(input, isValid) {
  const field = input.closest(".contact-field");
  field?.classList.toggle("is-invalid", !isValid);
  input.setAttribute("aria-invalid", String(!isValid));
}

function clearValidationState() {
  if (!contactForm) {
    return;
  }

  contactForm.querySelectorAll(".contact-field").forEach((field) => {
    field.classList.remove("is-invalid");
  });

  contactForm.querySelectorAll("[aria-invalid]").forEach((input) => {
    input.setAttribute("aria-invalid", "false");
  });
}

function resetContactFormState() {
  if (formContainer) {
    formContainer.style.display = "block";
  }

  if (successMessage) {
    successMessage.style.display = "none";
  }

  contactDialog?.setAttribute("aria-labelledby", "contact-title");

  if (inquirySubmitted && contactForm) {
    contactForm.reset();
    inquirySubmitted = false;
  }

  clearValidationState();

  if (submitBtn && btnText && btnIcon) {
    btnText.textContent = "Send project inquiry";
    btnIcon.classList.remove("spinner");
    submitBtn.disabled = false;
  }

  if (contactFormStatus) {
    contactFormStatus.textContent = "Submitted securely to Appy Design through Google Forms.";
  }
}

function openContactModal(event) {
  if (event) {
    event.preventDefault();
    lastFocusedElement = event.currentTarget;
  } else {
    lastFocusedElement = document.activeElement;
  }

  if (!contactModal) {
    return;
  }

  resetContactFormState();
  contactModal.classList.add("is-open");
  contactModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("contact-modal-open");

  window.setTimeout(() => document.getElementById("name")?.focus(), 0);
}

function closeContactModal() {
  if (!contactModal) {
    return;
  }

  contactModal.classList.remove("is-open");
  contactModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("contact-modal-open");
  lastFocusedElement?.focus?.();
}

function showSubmissionSuccess() {
  if (!submissionInFlight && !document.getElementById("companyWebsite")?.value) {
    return;
  }

  submissionInFlight = false;
  window.clearTimeout(submissionFallbackTimer);
  inquirySubmitted = true;

  if (formContainer) {
    formContainer.style.display = "none";
  }

  if (successMessage) {
    successMessage.style.display = "block";
    successMessage.querySelector("h2")?.focus?.();
  }

  contactDialog?.setAttribute("aria-labelledby", "contact-success-title");
}

document.querySelectorAll("[data-contact-open]").forEach((trigger) => {
  trigger.addEventListener("click", openContactModal);
});

document.querySelectorAll("[data-contact-close]").forEach((trigger) => {
  trigger.addEventListener("click", closeContactModal);
});

document.addEventListener("keydown", (event) => {
  if (!contactModal?.classList.contains("is-open")) {
    return;
  }

  if (event.key === "Escape") {
    closeContactModal();
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const focusable = Array.from(
    contactModal.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]'
    )
  ).filter((element) => element.offsetParent !== null);

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
});

requiredFields.forEach(({ id, isValid }) => {
  const input = document.getElementById(id);
  const eventName = input?.tagName === "SELECT" ? "change" : "input";

  input?.addEventListener(eventName, () => {
    setFieldValidity(input, isValid(input.value));
  });
});

contactSubmitFrame?.addEventListener("load", () => {
  if (submissionInFlight) {
    showSubmissionSuccess();
  }
});

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const honeypot = document.getElementById("companyWebsite");

    if (honeypot?.value) {
      showSubmissionSuccess();
      return;
    }

    let firstInvalidInput = null;

    requiredFields.forEach(({ id, isValid }) => {
      const input = document.getElementById(id);

      if (!input) {
        return;
      }

      const valid = isValid(input.value);
      setFieldValidity(input, valid);

      if (!valid && !firstInvalidInput) {
        firstInvalidInput = input;
      }
    });

    if (firstInvalidInput) {
      firstInvalidInput.focus();
      firstInvalidInput.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!submitBtn || !btnText || !btnIcon) {
      return;
    }

    if (navigator.onLine === false) {
      if (contactFormStatus) {
        contactFormStatus.textContent = "You appear to be offline. Check your connection and try again.";
      }
      return;
    }

    btnText.textContent = "Sending inquiry...";
    btnIcon.classList.add("spinner");
    submitBtn.disabled = true;

    // Native submission preserves the Google Form field contract and posts
    // into the hidden iframe, so the visitor never leaves the website.
    submissionInFlight = true;
    contactForm.submit();

    // Cross-origin responses cannot be inspected, so the iframe load event is
    // the primary completion signal and this timer is a conservative fallback.
    submissionFallbackTimer = window.setTimeout(showSubmissionSuccess, 8000);
  });
}

if (window.location.hash === "#contact-modal") {
  openContactModal();
}
