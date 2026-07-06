const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.pillar-card, .event-card, .founder-card, .program-item, .eligibility-card, .process-card').forEach(el => {
  if (reduceMotion) return;
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease, box-shadow 0.25s';
  revealObserver.observe(el);
});

const form = document.getElementById('contact-form');
if (form) {
  const status = document.getElementById('form-status');
  const submitBtn = form.querySelector('button[type=submit]');
  const PLACEHOLDER = 'YOUR_WEB3FORMS_ACCESS_KEY';

  const setStatus = (msg, ok) => {
    if (!status) return;
    status.textContent = msg;
    status.style.color = ok === true ? '#16a34a' : ok === false ? '#dc2626' : '';
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = new FormData(form);
    const key = data.get('access_key');

    if (!key || key === PLACEHOLDER) {
      const reason = data.get('reason') || '';
      const subject = encodeURIComponent('FTCC enquiry' + (reason ? ' — ' + reason : ''));
      const body = encodeURIComponent(
        `Name: ${data.get('name') || ''}\n` +
        `Email: ${data.get('email') || ''}\n` +
        `Reason: ${reason}\n\n` +
        `${data.get('message') || ''}`
      );
      window.location.href = `mailto:hello@ftcc.org.au?subject=${subject}&body=${body}`;
      setStatus('Opening your email app so you can send the message…');
      return;
    }

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
    setStatus('');
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      const result = await res.json();
      if (result.success) {
        setStatus('✓ Thanks! Your message has been sent.', true);
        form.reset();
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (err) {
      setStatus('Sorry, something went wrong. Please email hello@ftcc.org.au directly.', false);
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send message'; }
    }
  });
}
