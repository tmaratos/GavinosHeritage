import '../css/main.css';
import '../css/employment.css';
import '../css/chalkboard.css';
import { renderSiteChrome } from './layout.js';
import { initChalkboard } from './announcements.js';
import { loadRestaurantInfo } from './site-content.js';
import formConfig from '../../data/employment/form-config.json';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS',
  'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY',
  'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
  'WI', 'WY', 'DC',
];

const SECTIONS = [
  { id: 'applicant', label: 'Applicant' },
  { id: 'education', label: 'Education' },
  { id: 'references', label: 'References' },
  { id: 'employment', label: 'Employment' },
  { id: 'military', label: 'Military' },
  { id: 'signature', label: 'Signature' },
];

const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

function populateStates() {
  const select = document.getElementById('state');
  if (!select) return;

  US_STATES.forEach((code) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = code;
    select.appendChild(option);
  });
}

function getSectionElements() {
  return SECTIONS.map(({ id }) => document.getElementById(`section-${id}`)).filter(Boolean);
}

function setActiveProgress(sectionId) {
  document.querySelectorAll('.employment-progress__step').forEach((step) => {
    const href = step.getAttribute('href')?.slice(1);
    step.classList.toggle('is-active', href === sectionId);
  });

  const activeStep = document.querySelector(`.employment-progress__step[href="#${sectionId}"]`);
  activeStep?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

function openSection(section, { closeOthers = false, scroll = true } = {}) {
  if (!section) return;

  if (closeOthers) {
    document.querySelectorAll('.form-section').forEach((other) => {
      if (other !== section) {
        other.classList.remove('is-open');
        other.querySelector('.form-section__toggle')?.setAttribute('aria-expanded', 'false');
      }
    });
  }

  section.classList.add('is-open');
  section.querySelector('.form-section__toggle')?.setAttribute('aria-expanded', 'true');
  setActiveProgress(section.id);

  if (scroll) {
    const offset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 80;
    const progressBar = document.querySelector('.employment-progress-bar');
    const extra = progressBar?.offsetHeight || 0;
    const top = section.getBoundingClientRect().top + window.scrollY - offset - extra - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

function closeSection(section) {
  section.classList.remove('is-open');
  section.querySelector('.form-section__toggle')?.setAttribute('aria-expanded', 'false');
}

function toggleSection(section) {
  const isOpen = section.classList.contains('is-open');

  if (isOpen) {
    closeSection(section);
    return;
  }

  openSection(section, { closeOthers: isMobile(), scroll: true });
}

function renderProgress() {
  const mount = document.getElementById('form-progress');
  if (!mount) return;

  mount.innerHTML = SECTIONS.map(
    ({ id, label }, index) =>
      `<a class="employment-progress__step${index === 0 ? ' is-active' : ''}" href="#section-${id}">${label}</a>`,
  ).join('');
}

function addSectionNavButtons() {
  getSectionElements().forEach((section, index) => {
    const body = section.querySelector('.form-section__body');
    if (!body || body.querySelector('.employment-section-nav')) return;

    const prev = SECTIONS[index - 1];
    const next = SECTIONS[index + 1];

    const nav = document.createElement('div');
    nav.className = 'employment-section-nav';
    nav.innerHTML = `
      ${prev ? `<button type="button" class="btn btn--outline" data-goto="${prev.id}">← ${prev.label}</button>` : '<span></span>'}
      ${next ? `<button type="button" class="btn btn--secondary" data-goto="${next.id}">${next.label} →</button>` : ''}
    `;
    body.appendChild(nav);
  });

  document.querySelectorAll('[data-goto]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.getElementById(`section-${button.dataset.goto}`);
      openSection(target, { closeOthers: isMobile(), scroll: true });
    });
  });
}

function bindSectionToggles() {
  document.querySelectorAll('.form-section').forEach((section) => {
    const toggle = section.querySelector('.form-section__toggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => toggleSection(section));
  });

  document.querySelectorAll('.employment-progress__step').forEach((step) => {
    step.addEventListener('click', (event) => {
      event.preventDefault();
      const id = step.getAttribute('href')?.slice(1);
      const section = id ? document.getElementById(id) : null;
      openSection(section, { closeOthers: isMobile(), scroll: true });
    });
  });
}

function bindSubsectionToggles() {
  document.querySelectorAll('.form-subsection').forEach((subsection, index) => {
    const heading = subsection.querySelector('h3');
    if (!heading || subsection.dataset.enhanced) return;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'form-subsection__toggle';
    toggle.textContent = heading.textContent;
    heading.replaceWith(toggle);

    const content = document.createElement('div');
    content.className = 'form-subsection__content';
    while (toggle.nextSibling) {
      content.appendChild(toggle.nextSibling);
    }
    subsection.appendChild(content);

    toggle.addEventListener('click', () => {
      if (!isMobile()) return;
      subsection.classList.toggle('is-open');
    });

    if (isMobile() && index > 0) {
      subsection.classList.remove('is-open');
    } else if (isMobile()) {
      subsection.classList.add('is-open');
    } else {
      subsection.classList.add('is-open');
    }

    subsection.dataset.enhanced = 'true';
  });
}

function initSectionState() {
  const sections = getSectionElements();
  sections.forEach((section, index) => {
    if (index === 0) {
      openSection(section, { closeOthers: false, scroll: false });
    } else {
      closeSection(section);
    }
  });
}

function bindConditionalFields() {
  document.querySelectorAll('[data-conditional]').forEach((wrapper) => {
    const fieldName = wrapper.dataset.conditional;
    const showWhen = wrapper.dataset.showWhen;
    const inputs = document.querySelectorAll(`input[name="${fieldName}"]`);

    const update = () => {
      const selected = [...inputs].find((input) => input.checked)?.value;
      wrapper.hidden = selected !== showWhen;
    };

    inputs.forEach((input) => input.addEventListener('change', update));
    update();
  });
}

function setStatus(message, type = 'info') {
  const status = document.getElementById('form-status');
  if (!status) return;

  status.textContent = message;
  status.className = `form-status is-visible form-status--${type}`;
}

function clearFieldErrors(form) {
  form.querySelectorAll('.form-field--error').forEach((field) => {
    field.classList.remove('form-field--error');
    field.querySelector('.field-error')?.remove();
  });
}

function markFieldError(field, message) {
  field.classList.add('form-field--error');
  const error = document.createElement('p');
  error.className = 'field-error';
  error.textContent = message;
  field.appendChild(error);
}

function getSubmitEndpoint(info) {
  if (formConfig.submitEndpoint) return formConfig.submitEndpoint;
  const email = info?.applicationsEmail || info?.contactEmail;
  if (email) {
    return `https://formsubmit.co/ajax/${encodeURIComponent(email)}`;
  }
  return '';
}

function serializeForm(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  data._subject = `Employment Application — ${data.firstName || ''} ${data.lastName || ''}`.trim();
  data._template = 'table';
  data._captcha = 'false';
  return data;
}

async function submitApplication(form) {
  const info = await loadRestaurantInfo();
  const endpoint = getSubmitEndpoint(info);

  if (!endpoint) {
    setStatus(
      'Applications are not configured yet. Please call the restaurant or try again later.',
      'error',
    );
    return false;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(serializeForm(form)),
  });

  if (!response.ok) {
    throw new Error(`Submit failed (${response.status})`);
  }

  return true;
}

function bindForm() {
  const form = document.getElementById('employment-form');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFieldErrors(form);

    if (!form.checkValidity()) {
      const firstInvalid = form.querySelector(':invalid');
      if (firstInvalid) {
        const section = firstInvalid.closest('.form-section');
        if (section) openSection(section, { closeOthers: isMobile(), scroll: true });

        const field = firstInvalid.closest('.form-field') || firstInvalid.closest('fieldset');
        if (field) markFieldError(field, 'This field is required.');
        firstInvalid.focus();
      }
      setStatus('Please complete all required fields before submitting.', 'error');
      return;
    }

    const submitButton = document.getElementById('submit-application');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting…';

    try {
      const submitted = await submitApplication(form);
      if (!submitted) return;
      setStatus(formConfig.successMessage, 'success');
      form.reset();
      bindConditionalFields();
      initSectionState();
    } catch (error) {
      console.error(error);
      setStatus(formConfig.errorMessage, 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit Application';
    }
  });
}

renderSiteChrome();
initChalkboard();
populateStates();
renderProgress();
initSectionState();
bindSubsectionToggles();
addSectionNavButtons();
bindSectionToggles();
bindConditionalFields();
bindForm();
