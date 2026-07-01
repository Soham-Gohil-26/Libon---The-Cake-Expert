const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = { preview: null };
const whatsappBase = "https://wa.me/919881002823";

window.addEventListener("load", () => {
  qs("#loader").classList.add("hidden");
  const isMobile = window.matchMedia("(max-width: 991px)").matches;
  if (window.AOS) AOS.init({ duration: isMobile ? 450 : 850, once: true, offset: isMobile ? 24 : 80 });
  if (window.lucide) lucide.createIcons();
});

const nav = qs("#mainNav");
const progress = qs("#scrollProgress");
const orderModal = qs("#orderModal") ? new bootstrap.Modal(qs("#orderModal")) : null;

function onScroll() {
  nav.classList.toggle("scrolled", window.scrollY > 24);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max ? (window.scrollY / max) * 100 : 0}%`;
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

qsa('a[href^="#"]').forEach(link => {
  link.addEventListener("click", event => {
    const target = qs(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
    const menu = qs("#navMenu");
    if (menu.classList.contains("show")) bootstrap.Collapse.getOrCreateInstance(menu).hide();
  });
});

const particles = qs("#particles");
if (particles && !window.matchMedia("(max-width: 767px)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  for (let i = 0; i < 34; i++) {
    const dot = document.createElement("span");
    dot.className = "particle";
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.bottom = `${Math.random() * -40}px`;
    dot.style.animationDuration = `${8 + Math.random() * 11}s`;
    dot.style.animationDelay = `${Math.random() * 8}s`;
    particles.appendChild(dot);
  }
}

const orderNowBtn = qs("#orderNowBtn");
if (orderNowBtn && orderModal) {
  orderNowBtn.addEventListener("click", () => orderModal.show());
}

const counters = qsa(".counter");
let countersStarted = false;
const counterObserver = new IntersectionObserver(entries => {
  if (countersStarted || !entries.some(entry => entry.isIntersecting)) return;
  countersStarted = true;
  counters.forEach(counter => {
    const target = Number(counter.dataset.target);
    let current = 0;
    const step = Math.max(1, Math.floor(target / 90));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        counter.textContent = target >= 1000 ? `${Math.round(target / 1000)}k+` : `${target}+`;
        clearInterval(timer);
        return;
      }
      counter.textContent = current.toLocaleString("en-IN");
    }, 18);
  });
}, { threshold: .35 });
counters.forEach(counter => counterObserver.observe(counter));

const builder = qs("#cakeBuilder");
const totalPrice = qs("#totalPrice");
const builderSummary = qs("#builderSummary");
const cakeMessage = qs("#cakeMessage");
const customWhatsApp = qs("#customWhatsApp");

function selectedOptionPrice(id) {
  const option = qs(`#${id}`).selectedOptions[0];
  return Number(option.dataset.price || 0);
}

function selectedOptionText(id) {
  return qs(`#${id}`).selectedOptions[0].value;
}

function calcCake() {
  const toppings = qsa('.topping-group input[type="checkbox"]:checked');
  const toppingTotal = toppings.reduce((sum, item) => sum + Number(item.dataset.price), 0);
  const total = selectedOptionPrice("size") + selectedOptionPrice("flavor") + selectedOptionPrice("cream") + toppingTotal;
  const message = qs("#message").value.trim() || "Smiley";
  const toppingText = toppings.map(item => item.value).join(", ") || "classic finish";

  totalPrice.textContent = `Rs. ${total.toLocaleString("en-IN")}`;
  builderSummary.textContent = `${selectedOptionText("flavor")}, ${selectedOptionText("size")}, ${selectedOptionText("cream").toLowerCase()}, ${toppingText}.`;
  cakeMessage.textContent = message.slice(0, 24);
  if (customWhatsApp) {
    const text = `Hi Smiley Cakes, I want to order a custom cake: ${selectedOptionText("flavor")}, ${selectedOptionText("size")}, ${selectedOptionText("cream")}, toppings: ${toppingText}, message: ${message}, estimated total Rs. ${total.toLocaleString("en-IN")}.`;
    customWhatsApp.href = `${whatsappBase}?text=${encodeURIComponent(text)}`;
  }

  return {
    title: `${selectedOptionText("flavor")} Custom Cake`,
    price: total,
    detail: `${selectedOptionText("size")} with ${selectedOptionText("cream")}`
  };
}

if (builder) {
  builder.addEventListener("input", calcCake);
  builder.addEventListener("change", calcCake);
  calcCake();
}

const previewModal = new bootstrap.Modal(qs("#previewModal"));
qsa(".cake-card").forEach(card => {
  card.addEventListener("click", event => {
    if (event.target.closest(".quick-order")) return;
    state.preview = {
      title: card.dataset.title,
      price: Number(card.dataset.price),
      img: card.dataset.img,
      detail: "Quick order"
    };
    qs("#previewImg").src = state.preview.img;
    qs("#previewImg").alt = state.preview.title;
    qs("#previewTitle").textContent = state.preview.title;
    qs("#previewPrice").textContent = `Starting at Rs. ${state.preview.price.toLocaleString("en-IN")}`;
    qs("#modalOrder").href = `${whatsappBase}?text=${encodeURIComponent(`Hi Smiley Cakes, I want to order ${state.preview.title}.`)}`;
    previewModal.show();
  });
});

const lightbox = qs("#lightbox");
const galleryPreviewImg = qs("#galleryPreviewImg");
const galleryCaption = qs("#galleryCaption");

function openGalleryPreview(item) {
  if (!lightbox || !galleryPreviewImg) return;
  galleryPreviewImg.src = item.dataset.img;
  galleryPreviewImg.alt = item.querySelector("img")?.alt || "Gallery preview";
  if (galleryCaption) {
    galleryCaption.textContent = item.dataset.caption || galleryPreviewImg.alt;
  }
  lightbox.classList.add("open");
}

qsa(".gallery-item").forEach(item => {
  item.addEventListener("click", () => openGalleryPreview(item));
});

if (lightbox) {
  const closeButton = qs("button", lightbox);
  closeButton?.addEventListener("click", () => lightbox.classList.remove("open"));
  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) lightbox.classList.remove("open");
  });
}

qsa(".contact-form, .newsletter").forEach(form => {
  form.addEventListener("submit", event => {
    event.preventDefault();
    const name = qs('input[type="text"]', form)?.value || "";
    const phone = qs('input[type="tel"]', form)?.value || "";
    const idea = qs("textarea", form)?.value || "I want to enquire about a cake.";
    const text = `Hi Smiley Cakes, ${idea} Name: ${name}. Phone: ${phone}.`;
    window.open(`${whatsappBase}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  });
});
