(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header, progress, year and clock
  const header = $('[data-header]');
  const progress = $('.scroll-progress span');
  const liveClock = $('[data-live-clock]');
  const guideLauncher = $('.guide-launcher');
  const updatePageState = () => {
    const y = window.scrollY;
    header?.classList.toggle('is-scrolled', y > 24);
    guideLauncher?.classList.toggle('is-visible', y > 420);
    if (progress) {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      progress.style.width = `${Math.min(100, (y / max) * 100)}%`;
    }
  };
  addEventListener('scroll', updatePageState, { passive: true });
  updatePageState();
  $$('[data-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });
  const updateClock = () => {
    if (!liveClock) return;
    liveClock.textContent = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date());
  };
  updateClock();
  setInterval(updateClock, 1000);

  // Mobile navigation
  const menuButton = $('.menu-button');
  const mobileNav = $('#mobile-nav');
  const setMenu = open => {
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    mobileNav.hidden = !open;
  };
  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  $$('#mobile-nav a').forEach(link => link.addEventListener('click', () => setMenu(false)));

  // Reveal animation
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    reveals.forEach(el => revealObserver.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  // Hero spatial response
  const heroSystem = $('[data-hero-system]');
  const systemFrame = heroSystem ? $('.system-frame', heroSystem) : null;
  if (heroSystem && systemFrame && !reducedMotion && matchMedia('(pointer:fine)').matches) {
    heroSystem.addEventListener('pointermove', event => {
      const rect = heroSystem.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      systemFrame.style.transform = `rotateY(${(-5 + x * 5).toFixed(2)}deg) rotateX(${(1.5 - y * 4).toFixed(2)}deg) translate3d(${(x * 5).toFixed(1)}px,${(y * 4).toFixed(1)}px,0)`;
    });
    heroSystem.addEventListener('pointerleave', () => {
      systemFrame.style.transform = '';
    });
  }

  // Service explorer
  const services = {
    web: {
      kicker: 'Digitale Informationsräume',
      code: 'VK.WEB / 01',
      title: 'Informationsangebote, die funktionieren.',
      text: 'Individuelle Websites, Projektseiten und Portale — responsiv, pflegbar und barrierebewusst umgesetzt.',
      list: ['Informationsarchitektur', 'CMS & Inhaltsmigration', 'Technische Übergabe'],
      project: 'Website oder Portal'
    },
    software: {
      kicker: 'Anwendungen & Schnittstellen',
      code: 'VK.APP / 02',
      title: 'Software für klar definierte Aufgaben.',
      text: 'Webanwendungen, Dashboards und Schnittstellen, die sich an Anforderungen, Rollen und realen Arbeitsabläufen orientieren.',
      list: ['Fachanwendungen & Dashboards', 'APIs & Systemanbindung', 'Tests & Dokumentation'],
      project: 'Software oder Webanwendung'
    },
    automation: {
      kicker: 'Wiederkehrende Arbeit reduzieren',
      code: 'VK.AUTO / 03',
      title: 'Automatisierung mit kontrollierter Verantwortung.',
      text: 'KI-Modelle und regelbasierte Logik unterstützen bei Dokumenten, Daten und Abläufen — Ergebnisse bleiben prüfbar.',
      list: ['Workflow-Automatisierung', 'KI-gestützte Assistenz', 'Menschliche Freigabepunkte'],
      project: 'KI oder Automatisierung'
    },
    data: {
      kicker: 'Struktur aus Beständen',
      code: 'VK.DATA / 04',
      title: 'Dokumente und Daten nutzbar machen.',
      text: 'OCR, Klassifikation, Migration und strukturierte Aufbereitung für digitale Prozesse und verlässliche Weiterverarbeitung.',
      list: ['OCR & Extraktion', 'Datenbereinigung & Migration', 'Qualitätssicherung'],
      project: 'Dokumente oder Daten'
    }
  };

  let selectedService = 'web';
  const serviceVisual = $('[data-service-visual]');
  const serviceTitle = $('[data-service-title]');
  const serviceText = $('[data-service-text]');
  const serviceKicker = $('[data-service-kicker]');
  const serviceCode = $('[data-service-code]');
  const serviceList = $('[data-service-list]');
  const selectService = key => {
    const data = services[key];
    if (!data) return;
    selectedService = key;
    $$('.service-item').forEach(button => {
      const active = button.dataset.service === key;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    if (serviceVisual) serviceVisual.dataset.serviceVisual = key;
    if (serviceKicker) serviceKicker.textContent = data.kicker;
    if (serviceCode) serviceCode.textContent = data.code;
    if (serviceTitle) serviceTitle.textContent = data.title;
    if (serviceText) serviceText.textContent = data.text;
    if (serviceList) serviceList.innerHTML = data.list.map(item => `<li>${item}</li>`).join('');
  };
  $$('.service-item').forEach(button => button.addEventListener('click', () => selectService(button.dataset.service)));

  // Process scrollytelling
  const processSteps = $$('[data-process-step]');
  const processVisual = $('[data-process-visual]');
  const processLabel = $('[data-process-label]');
  const metrics = {
    structure: $('[data-metric-structure]'),
    quality: $('[data-metric-quality]'),
    delivery: $('[data-metric-delivery]')
  };
  const processData = [
    { label: 'Anforderungen', structure: '24%', quality: '18%', delivery: '08%' },
    { label: 'Architektur', structure: '58%', quality: '35%', delivery: '16%' },
    { label: 'Umsetzung', structure: '84%', quality: '64%', delivery: '42%' },
    { label: 'Prüfung & Übergabe', structure: '100%', quality: '100%', delivery: '100%' }
  ];
  const setProcess = index => {
    processSteps.forEach((step, i) => step.classList.toggle('is-active', i === index));
    if (processVisual) processVisual.dataset.processVisual = String(index);
    const data = processData[index];
    if (!data) return;
    if (processLabel) processLabel.textContent = data.label;
    if (metrics.structure) metrics.structure.textContent = data.structure;
    if (metrics.quality) metrics.quality.textContent = data.quality;
    if (metrics.delivery) metrics.delivery.textContent = data.delivery;
  };
  if ('IntersectionObserver' in window) {
    const processObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setProcess(Number(visible.target.dataset.processStep));
    }, { threshold: [0.25, 0.5, 0.75], rootMargin: '-18% 0px -32% 0px' });
    processSteps.forEach(step => processObserver.observe(step));
  }

  // Public sector explorer
  const publicContent = {
    requirements: {
      kicker: 'Präzise Grundlage',
      title: 'Die Leistung wird an den veröffentlichten Anforderungen ausgerichtet.',
      text: 'Muss-Kriterien, Liefergegenstände, Fristen und Abnahmebedingungen werden strukturiert erfasst und während der Umsetzung nachvollziehbar verfolgt.',
      list: ['Anforderungsmatrix', 'Versionierte Dokumentation', 'Klare Abnahmepunkte']
    },
    privacy: {
      kicker: 'Daten bewusst behandeln',
      title: 'Datenschutz wird Teil der technischen Entscheidung.',
      text: 'Datenarten, Verarbeitungswege, Speicherorte und eingesetzte Dienste werden früh betrachtet — nicht erst kurz vor der Übergabe.',
      list: ['Datenminimierung', 'Dokumentierte Anbieter', 'Geeignete Löschwege']
    },
    accessibility: {
      kicker: 'Zugänglichkeit einplanen',
      title: 'Barrierefreiheit wird nicht nachträglich aufgesetzt.',
      text: 'Struktur, Kontraste, Bedienbarkeit, Inhalte und Tests werden bereits im Aufbau der Lösung berücksichtigt.',
      list: ['Semantische Strukturen', 'Tastaturbedienung', 'Prüfbare Ergebnisse']
    },
    operation: {
      kicker: 'Nach dem Projekt weiter nutzbar',
      title: 'Übergabe, Betrieb und Weiterentwicklung werden mitgedacht.',
      text: 'Wartbarkeit, Dokumentation, Zugänge und Verantwortlichkeiten werden so vorbereitet, dass die Lösung nicht am Projektende stehen bleibt.',
      list: ['Technische Dokumentation', 'Geordnete Übergabe', 'Weiterentwicklung möglich']
    }
  };
  const publicInterface = $('[data-public-interface]');
  const selectPublic = key => {
    const data = publicContent[key];
    if (!data) return;
    $$('.public-tab').forEach(button => {
      const active = button.dataset.public === key;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    if (publicInterface) publicInterface.dataset.publicMode = key;
    const kicker = $('[data-public-kicker]');
    const title = $('[data-public-title]');
    const text = $('[data-public-text]');
    const list = $('[data-public-list]');
    if (kicker) kicker.textContent = data.kicker;
    if (title) title.textContent = data.title;
    if (text) text.textContent = data.text;
    if (list) list.innerHTML = data.list.map(item => `<li>${item}</li>`).join('');
  };
  $$('.public-tab').forEach(button => button.addEventListener('click', () => selectPublic(button.dataset.public)));

  // Project checker
  const projectForm = $('#project-form');
  const formSteps = $$('[data-form-step]');
  let currentFormStep = 0;
  const formProgress = $('[data-form-progress]');
  const formStatus = $('[data-form-status]');
  const summary = {
    status: $('[data-summary-status]'),
    title: $('[data-summary-title]'),
    text: $('[data-summary-text]'),
    phase: $('[data-summary-phase]'),
    service: $('[data-summary-service]'),
    org: $('[data-summary-org]'),
    deadline: $('[data-summary-deadline]')
  };

  const formDataObject = () => {
    if (!projectForm) return {};
    return Object.fromEntries(new FormData(projectForm).entries());
  };
  const formatDate = value => {
    if (!value) return '—';
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('de-DE').format(date);
  };
  const updateSummary = () => {
    const data = formDataObject();
    const phase = data.phase || '—';
    const service = data.service || '—';
    const org = data.organization || data.company || '—';
    const deadline = formatDate(data.deadline);
    if (summary.phase) summary.phase.textContent = phase;
    if (summary.service) summary.service.textContent = service;
    if (summary.org) summary.org.textContent = org;
    if (summary.deadline) summary.deadline.textContent = deadline;
    const selectedCount = [data.phase, data.service, data.organization].filter(Boolean).length;
    if (summary.status) summary.status.textContent = selectedCount >= 2 ? 'Prüfbar' : 'Offen';
    if (summary.title) summary.title.textContent = selectedCount >= 2 ? `${service} für ${org !== '—' ? org : 'Ihre Organisation'}` : 'Wählen Sie links die ersten Angaben.';
    if (summary.text) summary.text.textContent = selectedCount >= 2
      ? `${phase}. ${deadline !== '—' ? `Zieltermin: ${deadline}.` : 'Ein Zieltermin kann ergänzt werden.'} Nach Eingang prüfen wir Leistungsumfang, Fristen und erforderliche Nachweise.`
      : 'Die Zusammenfassung aktualisiert sich während der Eingabe.';
    saveFormPreferences();
  };
  const validateCurrentStep = () => {
    if (!projectForm) return false;
    if (currentFormStep === 0 && !projectForm.elements.phase.value) return 'Bitte wählen Sie, was bereits vorliegt.';
    if (currentFormStep === 1 && !projectForm.elements.service.value) return 'Bitte wählen Sie ein Leistungsfeld.';
    if (currentFormStep === 3) {
      const required = ['company', 'name', 'email', 'privacy'];
      for (const name of required) {
        const field = projectForm.elements[name];
        if (!field || (field.type === 'checkbox' ? !field.checked : !field.value.trim())) return 'Bitte füllen Sie alle Pflichtfelder aus.';
      }
      if (!projectForm.elements.email.validity.valid) return 'Bitte prüfen Sie die E-Mail-Adresse.';
    }
    return '';
  };
  const showFormStep = index => {
    currentFormStep = Math.max(0, Math.min(formSteps.length - 1, index));
    formSteps.forEach((step, i) => {
      const active = i === currentFormStep;
      step.hidden = !active;
      step.classList.toggle('is-active', active);
    });
    if (formProgress) formProgress.style.width = `${((currentFormStep + 1) / formSteps.length) * 100}%`;
    if (formStatus) formStatus.textContent = '';
  };
  $$('[data-next]').forEach(button => button.addEventListener('click', () => {
    const error = validateCurrentStep();
    if (error) {
      if (formStatus) formStatus.textContent = error;
      const activeStep = formSteps[currentFormStep];
      activeStep?.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 280 });
      return;
    }
    showFormStep(currentFormStep + 1);
  }));
  $$('[data-prev]').forEach(button => button.addEventListener('click', () => showFormStep(currentFormStep - 1)));
  projectForm?.addEventListener('input', updateSummary);
  projectForm?.addEventListener('change', updateSummary);

  const mailtoFromForm = data => {
    const subject = encodeURIComponent(`Projektanfrage: ${data.service || 'Digitales Vorhaben'} – ${data.company || data.organization || 'Organisation'}`);
    const body = encodeURIComponent([
      'Guten Tag,', '',
      'ich möchte folgendes Vorhaben prüfen lassen:', '',
      `Organisation: ${data.company || data.organization || '—'}`,
      `Ansprechpartner: ${data.name || '—'}`,
      `E-Mail: ${data.email || '—'}`,
      `Telefon: ${data.phone || '—'}`,
      `Status: ${data.phase || '—'}`,
      `Leistungsfeld: ${data.service || '—'}`,
      `Abgabefrist / Zieltermin: ${formatDate(data.deadline)}`,
      `Ausschreibungslink / Vergabenummer: ${data.reference || '—'}`, '',
      'Kurzbeschreibung:', data.message || '—', '',
      'Bitte melden Sie sich zur weiteren Abstimmung.', ''
    ].join('\n'));
    return `mailto:info@vorgangskern.com?subject=${subject}&body=${body}`;
  };

  projectForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const error = validateCurrentStep();
    if (error) {
      if (formStatus) formStatus.textContent = error;
      return;
    }
    const data = formDataObject();
    if (data.website) return;
    if (formStatus) formStatus.textContent = 'Anfrage wird vorbereitet …';
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Backend nicht konfiguriert');
      if (formStatus) formStatus.textContent = 'Vielen Dank. Die Anfrage wurde übermittelt.';
      projectForm.reset();
      updateSummary();
      clearFormPreferences();
    } catch {
      if (formStatus) formStatus.textContent = 'Ihr E-Mail-Programm wird mit einer vorbereiteten Anfrage geöffnet.';
      window.location.href = mailtoFromForm(data);
    }
  });

  $('[data-service-to-project]')?.addEventListener('click', () => {
    if (!projectForm) return;
    projectForm.elements.service.value = services[selectedService].project;
    updateSummary();
    showFormStep(2);
    $('#pruefung')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  });

  // Consent management
  const consentKey = 'vk-consent-v2';
  const storageGet = key => { try { return window.localStorage.getItem(key); } catch { return null; } };
  const storageSet = (key, value) => { try { window.localStorage.setItem(key, value); return true; } catch { return false; } };
  const storageRemove = key => { try { window.localStorage.removeItem(key); } catch { /* storage unavailable in local preview */ } };
  const banner = $('[data-consent-banner]');
  const consentDialog = $('[data-consent-dialog]');
  const preferencesToggle = $('[data-consent-preferences]');
  let consent = null;
  const readConsent = () => {
    try { return JSON.parse(storageGet(consentKey)); } catch { return null; }
  };
  const writeConsent = preferences => {
    consent = { necessary: true, preferences: Boolean(preferences), updatedAt: new Date().toISOString() };
    storageSet(consentKey, JSON.stringify(consent));
    if (banner) banner.hidden = true;
    if (consentDialog?.open) consentDialog.close();
    if (!consent.preferences) clearFormPreferences();
  };
  consent = readConsent();
  if (!consent && banner) banner.hidden = false;
  if (preferencesToggle) preferencesToggle.checked = Boolean(consent?.preferences);
  $('[data-consent-necessary]')?.addEventListener('click', () => writeConsent(false));
  $('[data-consent-comfort]')?.addEventListener('click', () => writeConsent(true));
  $$('[data-open-consent]').forEach(button => button.addEventListener('click', () => {
    if (preferencesToggle) preferencesToggle.checked = Boolean(readConsent()?.preferences);
    consentDialog?.showModal();
  }));
  $('[data-save-consent]')?.addEventListener('click', () => writeConsent(Boolean(preferencesToggle?.checked)));

  function saveFormPreferences() {
    const current = readConsent();
    if (!current?.preferences || !projectForm) return;
    const data = formDataObject();
    const safe = { phase: data.phase || '', service: data.service || '', organization: data.organization || '', deadline: data.deadline || '', reference: data.reference || '', message: data.message || '' };
    storageSet('vk-project-draft-v1', JSON.stringify(safe));
  }
  function restoreFormPreferences() {
    const current = readConsent();
    if (!current?.preferences || !projectForm) return;
    try {
      const saved = JSON.parse(storageGet('vk-project-draft-v1'));
      if (!saved) return;
      Object.entries(saved).forEach(([name, value]) => {
        const field = projectForm.elements[name];
        if (!field || !value) return;
        if (field instanceof RadioNodeList) field.value = value;
        else field.value = value;
      });
      updateSummary();
    } catch { /* ignore malformed storage */ }
  }
  function clearFormPreferences() { storageRemove('vk-project-draft-v1'); }
  restoreFormPreferences();

  // Project guide (local only)
  const guideDialog = $('[data-guide-dialog]');
  const guideQuestion = $('[data-guide-question]');
  const guideOptions = $('[data-guide-options]');
  const guideProgress = $('[data-guide-progress]');
  const guideContent = $('[data-guide-content]');
  const guideResult = $('[data-guide-result]');
  const guideResultTitle = $('[data-guide-result-title]');
  const guideResultText = $('[data-guide-result-text]');
  let guideStep = 0;
  let guideAnswers = {};
  const guideFlow = [
    { key: 'phase', question: 'Womit sollen wir beginnen?', options: [
      ['Ausschreibung veröffentlicht', 'Ausschreibung'], ['Konkretes Projekt', 'Projekt'], ['Erste Idee', 'Idee']
    ]},
    { key: 'service', question: 'Welches Ergebnis wird benötigt?', options: [
      ['Website oder Portal', 'Website / Portal'], ['Software oder Webanwendung', 'Software / App'], ['KI oder Automatisierung', 'Automatisierung'], ['Dokumente oder Daten', 'Daten / Dokumente']
    ]},
    { key: 'organization', question: 'Für welche Organisation?', options: [
      ['Gemeinde', 'Gemeinde'], ['Stadt', 'Stadt'], ['Landkreis', 'Landkreis'], ['Landesbehörde', 'Land / Behörde'], ['Kommunales Unternehmen', 'Kommunales Unternehmen'], ['Unternehmen', 'Unternehmen']
    ]}
  ];
  const renderGuide = () => {
    if (!guideQuestion || !guideOptions || !guideProgress || !guideContent || !guideResult) return;
    if (guideStep >= guideFlow.length) {
      guideContent.hidden = true;
      guideResult.hidden = false;
      const phase = guideAnswers.phase || 'Vorhaben';
      const service = guideAnswers.service || 'digitale Lösung';
      const org = guideAnswers.organization || 'Organisation';
      guideResultTitle.textContent = `${service} für ${org}`;
      guideResultText.textContent = `${phase}. Die nächsten sinnvollen Angaben sind Leistungsumfang, Termin und — falls vorhanden — Vergabenummer oder Bekanntmachungslink.`;
      guideProgress.style.width = '100%';
      return;
    }
    guideContent.hidden = false;
    guideResult.hidden = true;
    const step = guideFlow[guideStep];
    guideQuestion.textContent = step.question;
    guideOptions.innerHTML = '';
    step.options.forEach(([value, label], index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'guide-option';
      button.innerHTML = `<span>${label}</span><span>${String(index + 1).padStart(2, '0')} ↗</span>`;
      button.addEventListener('click', () => {
        guideAnswers[step.key] = value;
        guideStep += 1;
        renderGuide();
      });
      guideOptions.append(button);
    });
    guideProgress.style.width = `${((guideStep + 1) / (guideFlow.length + 1)) * 100}%`;
  };
  const openGuide = () => {
    guideStep = 0; guideAnswers = {}; renderGuide(); guideDialog?.showModal();
  };
  $$('[data-open-guide]').forEach(button => button.addEventListener('click', openGuide));
  $('[data-close-guide]')?.addEventListener('click', () => guideDialog?.close());
  $('[data-guide-restart]')?.addEventListener('click', () => { guideStep = 0; guideAnswers = {}; renderGuide(); });
  $('[data-guide-apply]')?.addEventListener('click', () => {
    if (projectForm) {
      if (guideAnswers.phase) projectForm.elements.phase.value = guideAnswers.phase;
      if (guideAnswers.service) projectForm.elements.service.value = guideAnswers.service;
      if (guideAnswers.organization) projectForm.elements.organization.value = guideAnswers.organization;
      updateSummary();
      showFormStep(2);
    }
    guideDialog?.close();
    $('#pruefung')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  });

  // Generic dialog body lock
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
    dialog.addEventListener('cancel', () => document.body.classList.remove('dialog-open'));
    const originalShowModal = dialog.showModal.bind(dialog);
    dialog.showModal = () => { document.body.classList.add('dialog-open'); originalShowModal(); };
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
      if (outside) dialog.close();
    });
  });

  if (formSteps.length) showFormStep(0);
  updateSummary();
  if ($('[data-service-interface]')) selectService('web');
  if (publicInterface) selectPublic('requirements');
})();

// V6 ambient motion and colour-state layer. Kept separate from the core application logic.
(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero');
  const canvas = document.getElementById('ambient-flow');
  const serviceSection = document.querySelector('.services');
  const publicSection = document.querySelector('.public-sector');

  document.querySelectorAll('.service-item').forEach(button => {
    button.addEventListener('click', () => {
      if (serviceSection && button.dataset.service) serviceSection.dataset.activeService = button.dataset.service;
    });
  });
  document.querySelectorAll('.public-tab').forEach(button => {
    button.addEventListener('click', () => {
      if (publicSection && button.dataset.public) publicSection.dataset.activePublic = button.dataset.public;
    });
  });

  if (!hero || !canvas) return;
  const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
  if (!context) return;

  const palette = [
    [143, 241, 198],
    [117, 216, 255],
    [138, 120, 255],
    [255, 135, 106]
  ];
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: 0 };
  let width = 1;
  let height = 1;
  let dpr = 1;
  let particles = [];
  let animationFrame = 0;
  let visible = true;
  let lastTime = performance.now();

  const createParticle = (index, randomizeX = true) => ({
    x: randomizeX ? Math.random() * width : -20,
    y: Math.random() * height,
    vx: 0,
    vy: 0,
    speed: 0.16 + Math.random() * 0.30,
    drift: Math.random() * Math.PI * 2,
    color: index % palette.length,
    radius: 0.55 + Math.random() * 1.15,
    history: []
  });

  const resetParticles = () => {
    const amount = Math.max(42, Math.min(96, Math.round(width / 17)));
    particles = Array.from({ length: amount }, (_, index) => createParticle(index));
  };

  const resize = () => {
    const rect = hero.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    resetParticles();
    if (reducedMotion) draw(performance.now(), true);
  };

  const flowAngle = (x, y, time) => {
    const nx = x / Math.max(width, 1);
    const ny = y / Math.max(height, 1);
    return (
      Math.sin(nx * 7.2 + time * 0.00019) * 0.78 +
      Math.cos(ny * 8.4 - time * 0.00016) * 0.62 +
      Math.sin((nx + ny) * 5.1 + time * 0.00011) * 0.42
    );
  };

  const drawStreams = time => {
    const scrollOffset = Math.max(0, Math.min(1, -hero.getBoundingClientRect().top / Math.max(hero.offsetHeight, 1)));
    for (let stream = 0; stream < 7; stream += 1) {
      const color = palette[stream % palette.length];
      const phase = stream * 1.27;
      const base = height * (0.10 + stream * 0.135);
      const amplitude = height * (0.025 + (stream % 3) * 0.009);
      context.beginPath();
      for (let x = -30; x <= width + 30; x += 22) {
        const influence = pointer.active * Math.exp(-Math.abs(x - pointer.x) / 260) * (pointer.y - base) * 0.022;
        const y = base +
          Math.sin(x * 0.0045 + time * 0.00022 + phase) * amplitude +
          Math.cos(x * 0.0022 - time * 0.00012 + phase * 1.4) * amplitude * 0.55 +
          influence + scrollOffset * (stream - 3) * 5;
        if (x === -30) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      const gradient = context.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},0)`);
      gradient.addColorStop(0.22, `rgba(${color[0]},${color[1]},${color[2]},${0.05 + stream * 0.0035})`);
      gradient.addColorStop(0.72, `rgba(${color[0]},${color[1]},${color[2]},${0.075 - stream * 0.0025})`);
      gradient.addColorStop(1, `rgba(${color[0]},${color[1]},${color[2]},0)`);
      context.strokeStyle = gradient;
      context.lineWidth = 0.65 + (stream % 2) * 0.35;
      context.stroke();
    }
  };

  const draw = (time, staticFrame = false) => {
    context.clearRect(0, 0, width, height);
    drawStreams(time);

    const delta = Math.min(32, Math.max(8, time - lastTime)) / 16.67;
    lastTime = time;
    pointer.x += (pointer.tx - pointer.x) * 0.055;
    pointer.y += (pointer.ty - pointer.y) * 0.055;
    pointer.active *= 0.985;

    particles.forEach((particle, index) => {
      if (!staticFrame) {
        const angle = flowAngle(particle.x, particle.y, time) + particle.drift * 0.035;
        let forceX = Math.cos(angle) * particle.speed;
        let forceY = Math.sin(angle) * particle.speed * 0.72;
        const dx = pointer.x - particle.x;
        const dy = pointer.y - particle.y;
        const distance = Math.max(70, Math.hypot(dx, dy));
        const pointerForce = pointer.active * Math.min(1, 210 / distance) * 0.028;
        forceX += dx * pointerForce / distance;
        forceY += dy * pointerForce / distance;
        particle.vx = particle.vx * 0.94 + forceX * 0.26;
        particle.vy = particle.vy * 0.94 + forceY * 0.26;
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.history.push([particle.x, particle.y]);
        if (particle.history.length > 12) particle.history.shift();

        if (particle.x > width + 35 || particle.y < -35 || particle.y > height + 35) {
          Object.assign(particle, createParticle(index, false));
          particle.y = Math.random() * height;
        }
      }

      const color = palette[particle.color];
      if (particle.history.length > 1) {
        context.beginPath();
        particle.history.forEach((point, pointIndex) => {
          if (pointIndex === 0) context.moveTo(point[0], point[1]);
          else context.lineTo(point[0], point[1]);
        });
        context.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${0.10 + particle.radius * 0.042})`;
        context.lineWidth = particle.radius * 0.72;
        context.stroke();
      }
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${0.20 + particle.radius * 0.09})`;
      context.fill();
    });

    // Sparse connections create a technical, living mesh without visual clutter.
    for (let index = 0; index < particles.length; index += 6) {
      const a = particles[index];
      let nearest = null;
      let nearestDistance = 165;
      for (let candidate = index + 1; candidate < particles.length; candidate += 1) {
        const b = particles[candidate];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < nearestDistance) {
          nearest = b;
          nearestDistance = distance;
        }
      }
      if (!nearest) continue;
      const color = palette[a.color];
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(nearest.x, nearest.y);
      context.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${(1 - nearestDistance / 165) * 0.075})`;
      context.lineWidth = 0.65;
      context.stroke();
    }
  };

  const loop = time => {
    if (!visible || document.hidden) {
      animationFrame = 0;
      return;
    }
    draw(time);
    animationFrame = requestAnimationFrame(loop);
  };

  const start = () => {
    if (!reducedMotion && visible && !document.hidden && !animationFrame) {
      lastTime = performance.now();
      animationFrame = requestAnimationFrame(loop);
    }
  };

  hero.addEventListener('pointermove', event => {
    const rect = hero.getBoundingClientRect();
    pointer.tx = event.clientX - rect.left;
    pointer.ty = event.clientY - rect.top;
    pointer.active = 1;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { pointer.active = 0; });
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', start);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible && animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
      start();
    }, { threshold: 0 }).observe(hero);
  }

  resize();
  if (reducedMotion) draw(performance.now(), true);
  else start();
})();
