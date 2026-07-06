// Shared navigation and footer injected into every page

const NAV_HTML = `
<nav>
  <div class="nav-inner">
    <a href="index.html" class="nav-logo">
      <img src="ftcc_full_logo.png" alt="FTCC Filipino Tech Community Canberra" class="nav-logo-img" />
    </a>
    <div class="nav-links">
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="programs.html">Programs</a>
      <a href="events.html">Events</a>
      <a href="membership.html">Membership</a>
      <a href="contact.html" class="btn-nav">Join Us</a>
    </div>
    <div class="nav-toggle" id="nav-toggle">
      <span></span><span></span><span></span>
    </div>
  </div>
  <div class="nav-mobile hidden" id="nav-mobile">
    <a href="index.html">Home</a>
    <a href="about.html">About</a>
    <a href="programs.html">Programs</a>
    <a href="events.html">Events</a>
    <a href="membership.html">Membership</a>
    <a href="contact.html">Join Us →</a>
  </div>
</nav>
`;

const FOOTER_HTML = `
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="index.html" style="display:inline-block;margin-bottom:16px;">
          <img src="ftcc_full_logo.png" alt="FTCC Filipino Tech Community Canberra" class="footer-logo-img" />
        </a>
        <p>Empowering Filipino ICT professionals in the ACT to connect, grow, and lead Australia's digital future.</p>
        <div class="socials">
          <a href="https://www.facebook.com/filotechcanberra/" target="_blank" class="social-btn" title="Facebook">f</a>
          <a href="mailto:hello@ftcc.org.au" class="social-btn" title="Email">@</a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Navigate</h4>
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="about.html">About Us</a></li>
          <li><a href="programs.html">Programs</a></li>
          <li><a href="events.html">Events</a></li>
          <li><a href="membership.html">Membership</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Get in touch</h4>
        <ul>
          <li><a href="mailto:hello@ftcc.org.au">hello@ftcc.org.au</a></li>
          <li><a href="https://www.facebook.com/filotechcanberra/" target="_blank">Facebook Page</a></li>
          <li><a href="events.html">Upcoming Events</a></li>
          <li><a href="membership.html">Join the Community</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-acknowledgement">
      The FTCC acknowledges the Ngunnawal people as traditional custodians of the ACT and recognise any other people or families with connection to the lands of the ACT and region. We acknowledge and respect their continuing culture and the contributions they make to the life of this city and this region.
    </div>
    <div class="footer-bottom">
      <p>© 2024 Filipino Tech Community Canberra (FTCC). All rights reserved.</p>
      <p>Incorporated Association, Australian Capital Territory</p>
    </div>
  </div>
</footer>
`;

// Inject into page
document.getElementById('nav-placeholder').innerHTML = NAV_HTML;
document.getElementById('footer-placeholder').innerHTML = FOOTER_HTML;

// Re-bind mobile menu after injection
const toggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('nav-mobile');
if (toggle && mobileMenu) {
  toggle.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
}

// Nav active state
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('nav a:not(.btn-nav):not(.nav-logo)').forEach(a => {
  if (a.getAttribute('href') === currentPage) a.classList.add('active');
});
