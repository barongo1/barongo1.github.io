/**
 * Anne Barongo Ondieki - Academic Portfolio Scripts
 * Handles mobile drawer nav, publication filter tabs, citation clipboard, and active nav state.
 */

document.addEventListener('DOMContentLoaded', () => {
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  const setMobileMenu = (isOpen) => {
    if (!mobileToggle || !navMenu) return;

    navMenu.classList.toggle('active', isOpen);
    mobileToggle.setAttribute('aria-expanded', String(isOpen));

    const icon = mobileToggle.querySelector('i');
    if (icon) {
      icon.classList.toggle('bi-list', !isOpen);
      icon.classList.toggle('bi-x-lg', isOpen);
    }
  };

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileToggle.getAttribute('aria-expanded') === 'true';
      setMobileMenu(!isOpen);
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setMobileMenu(false));
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        setMobileMenu(false);
      }
    });
  }

  const tabBtns = Array.from(document.querySelectorAll('.tab-btn'));
  const pubCards = Array.from(document.querySelectorAll('.pub-card'));

  const activateTab = (activeBtn) => {
    const filter = activeBtn.getAttribute('data-filter');

    tabBtns.forEach(btn => {
      const isActive = btn === activeBtn;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    pubCards.forEach(card => {
      const shouldShow = filter === 'all' || card.getAttribute('data-category') === filter;
      card.hidden = !shouldShow;
    });
  };

  if (tabBtns.length && pubCards.length) {
    tabBtns.forEach((btn, index) => {
      btn.addEventListener('click', () => activateTab(btn));

      btn.addEventListener('keydown', event => {
        const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
        if (!direction) return;

        event.preventDefault();
        const nextIndex = (index + direction + tabBtns.length) % tabBtns.length;
        tabBtns[nextIndex].focus();
        activateTab(tabBtns[nextIndex]);
      });
    });
  }

  const citationStatus = document.createElement('div');
  citationStatus.className = 'visually-hidden';
  citationStatus.setAttribute('aria-live', 'polite');
  document.body.appendChild(citationStatus);

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  };

  document.querySelectorAll('.btn-copy-citation').forEach(btn => {
    btn.addEventListener('click', async event => {
      event.preventDefault();
      const citationText = btn.getAttribute('data-citation');
      if (!citationText) return;

      const originalText = btn.innerHTML;
      btn.disabled = true;

      try {
        await copyText(citationText);
        btn.innerHTML = '<i class="bi bi-check2"></i> Copied';
        citationStatus.textContent = 'Citation copied to clipboard.';
      } catch (error) {
        console.error('Failed to copy citation:', error);
        btn.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Copy failed';
        citationStatus.textContent = 'Citation could not be copied.';
      } finally {
        window.setTimeout(() => {
          btn.innerHTML = originalText;
          btn.disabled = false;
        }, 2000);
      }
    });
  });

  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  let ticking = false;

  const updateActiveNav = () => {
    const scrollY = window.pageYOffset;
    const current = sections.reduce((activeId, section) => {
      const sectionTop = section.offsetTop - 110;
      const sectionBottom = sectionTop + section.offsetHeight;
      return scrollY >= sectionTop && scrollY < sectionBottom ? section.id : activeId;
    }, 'hero');

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateActiveNav);
      ticking = true;
    }
  }, { passive: true });

  updateActiveNav();
});
