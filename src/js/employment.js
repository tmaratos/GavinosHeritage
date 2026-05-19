import { renderSiteChrome } from './layout.js';
import formConfig from '../../data/employment/form-config.json';
import restaurantInfo from '../../data/restaurant/restaurant-info.json';

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

function renderProgress() {
  const mount = document.getElementById('form-progress');
  if (!mount) return;

  mount.innerHTML = SECTIONS.map(
    ({ id, label }, index) =>
      `<a class="employment-progress__step${index === 0 ? ' is-active' : ''}" href="#section-${id}">${label}</a>`,
  ).join('');
}

function bindSectionToggles() {
  const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

  document.querySelectorAll('.form-section').forEach((section) => {
    const toggle = section.querySelector('.form-section__toggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
      if (!isMobile()) return;

      const open = section.classList.contains('is-open');
      document.querySelectorAll('.form-section').forEach((other) => {
        other.classList.remove('is-open');
        other.querySelector('.form-section__toggle')?.setAttribute('aria-expanded', 'false');
      });

      if (!open) {
        section.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  document.querySelectorAll('.employment-progress__step').forEach((step) => {
    step.addEventListener('click', (event) => {
      if (!isMobile()) return;
      event.preventDefault();
      const id = step.getAttribute('href')?.slice(1);
      const section = id ? document.getElementById(id) : null;
      section?.querySelector('.form-section__toggle')?.click();
    });
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

function getSubmitEndpoint() {
  if (formConfig.submitEndpoint) return formConfig.submitEndpoint;
  if (restaurantInfo.applicationsEmail) {
    return `https://formsubmit.co/ajax/${encodeURIComponent(restaurantInfo.applicationsEmail)}`;
  }
  return '';
}

function serializeForm(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  data._subject = `Employment Application — ${data.firstName || ''} ${data.lastName || ''}`.trim();
  data._template = 'table';
  return data;
}

async function submitApplication(form) {
  const endpoint = getSubmitEndpoint();

  if (!endpoint) {
    setStatus(
      'Form saved locally for preview. Set applicationsEmail in data/restaurant/restaurant-info.json or submitEndpoint in data/employment/form-config.json to enable submissions.',
      'info',
    );
    console.info('Application preview payload:', serializeForm(form));
    return true;
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
      await submitApplication(form);
      setStatus(formConfig.successMessage, 'success');
      form.reset();
      bindConditionalFields();
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
populateStates();
renderProgress();
bindSectionToggles();
bindConditionalFields();
bindForm();
