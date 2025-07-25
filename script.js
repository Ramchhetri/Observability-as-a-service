// JavaScript controlling the multi‑step observability assessment
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('assessment-form');
  const steps = Array.from(document.querySelectorAll('.step'));
  const progressBar = document.getElementById('progress');
  let currentStep = 0;

  /**
   * Update the visible step and progress bar width
   */
  function updateSteps() {
    steps.forEach((step, index) => {
      step.classList.toggle('active', index === currentStep);
    });
    const progressPercent = (currentStep / (steps.length - 1)) * 100;
    progressBar.style.width = `${progressPercent}%`;
  }

  /**
   * Validate all required fields within the current step
   * Returns true if valid, false otherwise
   */
  function validateCurrentStep() {
    const activeStep = steps[currentStep];
    const requiredFields = activeStep.querySelectorAll('input[required]');
    for (const field of requiredFields) {
      // For radio groups only one element will be present with required attribute
      if (field.type === 'radio') {
        const name = field.name;
        const group = activeStep.querySelectorAll(`input[name='${name}']`);
        let checked = false;
        group.forEach(r => {
          if (r.checked) checked = true;
        });
        if (!checked) {
          field.focus();
          return false;
        }
      } else if (field.type === 'checkbox') {
        if (!field.checked) {
          // It's acceptable for consent; rely on default validity
          return false;
        }
      } else {
        if (!field.value) {
          field.focus();
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Navigate to the next step
   */
  function goNext() {
    if (!validateCurrentStep()) {
      // Use built‑in reportValidity for more user feedback
      const activeStep = steps[currentStep];
      const invalidInput = activeStep.querySelector('input:invalid');
      if (invalidInput) {
        invalidInput.reportValidity();
      }
      return;
    }
    if (currentStep < steps.length - 1) {
      currentStep += 1;
      updateSteps();
    }
  }

  /**
   * Navigate to the previous step
   */
  function goPrev() {
    if (currentStep > 0) {
      currentStep -= 1;
      updateSteps();
    }
  }

  // Attach event listeners to navigation buttons
  document.querySelectorAll('.next-button').forEach(btn => {
    btn.addEventListener('click', goNext);
  });
  document.querySelectorAll('.prev-button').forEach(btn => {
    btn.addEventListener('click', goPrev);
  });

  // Handle form submission on the final step
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!validateCurrentStep()) {
      return;
    }
    // Gather responses
    const formData = new FormData(form);
    const visibilityScore = parseInt(formData.get('visibility')) || 0;
    const capabilities = formData.getAll('capabilities');
    const scaleScore = parseInt(formData.get('scale')) || 0;
    const downtimeScore = parseInt(formData.get('downtime')) || 0;
    const toolsScore = parseInt(formData.get('toolsCount')) || 0;
    const collaborationScore = parseInt(formData.get('collaboration')) || 0;
    const alertScore = parseInt(formData.get('alertNoise')) || 0;
    const resolutionScore = parseInt(formData.get('resolution')) || 0;
    // Calculate a composite score: visibility + number of capabilities + scale + downtime + tools + collaboration
    const score =
      visibilityScore +
      capabilities.length +
      scaleScore +
      downtimeScore +
      toolsScore +
      collaborationScore +
      alertScore +
      resolutionScore;
    // Determine maturity level and description
    let category;
    let description;
    // Recalibrate thresholds based on maximum possible score (20)
    if (score <= 8) {
      category = 'Reactive';
      description =
        'Your observability maturity is low. You likely react to issues after they occur. Consider adopting unified logging, metrics and proactive monitoring to gain better visibility and reduce downtime.';
    } else if (score <= 16) {
      category = 'Basic';
      description =
        'Your observability maturity is basic. You have some monitoring in place but still struggle with root cause analysis and siloed data. Consolidating tools and investing in expertise will help you move towards proactive insights.';
    } else if (score <= 22) {
      category = 'Intermediate';
      description =
        'Your observability maturity is intermediate. You have dashboards and alerting, but there is room to improve integration across teams and systems. Implementing unified observability practices and proactive support can elevate your maturity.';
    } else {
      category = 'Advanced';
      description =
        'Great job! You have advanced observability capabilities with proactive monitoring and unified data. Our experts can help you optimize further, scale cost‑effectively and ensure continuous improvement.';
    }

    // --- New: Tailored feedback based on ticked checkboxes ---
    // Challenges
    const challenges = formData.getAll('challenges');
    let challengeFeedback = '';
    if (challenges.length > 0) {
      challengeFeedback += '<strong>Challenges identified:</strong><ul>';
      if (challenges.includes('expertise')) {
        challengeFeedback += '<li>Lack of internal expertise: Consider investing in training or partnering with observability experts.</li>';
      }
      if (challenges.includes('tools')) {
        challengeFeedback += '<li>Too many tools / siloed data: Consolidate monitoring tools for unified visibility and easier management.</li>';
      }
      if (challenges.includes('costs')) {
        challengeFeedback += '<li>High costs of monitoring: Review your toolset and processes for cost efficiency.</li>';
      }
      if (challenges.includes('resolution')) {
        challengeFeedback += '<li>Slow incident resolution: Streamline workflows and improve root-cause analysis capabilities.</li>';
      }
      if (challenges.includes('visibility')) {
        challengeFeedback += '<li>Limited visibility: Expand monitoring coverage and break down data silos.</li>';
      }
      challengeFeedback += '</ul>';
    }

    // Capabilities
    let capabilityFeedback = '';
    if (capabilities.length > 0) {
      capabilityFeedback += '<strong>Current strengths:</strong><ul>';
      if (capabilities.includes('dashboard')) {
        capabilityFeedback += '<li>Real-time dashboards: You have good visibility into your systems.</li>';
      }
      if (capabilities.includes('alerts')) {
        capabilityFeedback += '<li>Automated alerts: You are able to respond quickly to incidents.</li>';
      }
      if (capabilities.includes('rootcause')) {
        capabilityFeedback += '<li>Root cause analysis: You can identify and address underlying issues.</li>';
      }
      if (capabilities.includes('monitoring')) {
        capabilityFeedback += '<li>24/7 monitoring: Your systems are continuously observed for issues.</li>';
      }
      if (capabilities.includes('integration')) {
        capabilityFeedback += '<li>Integration across systems: You are reducing silos and improving collaboration.</li>';
      }
      capabilityFeedback += '</ul>';
    }

    // Special combinations (example: if both expertise and tools are challenges)
    let comboFeedback = '';
    if (challenges.includes('expertise') && challenges.includes('tools')) {
      comboFeedback += '<em>Tip: Addressing both expertise and tool sprawl together can have a multiplying effect on your observability maturity.</em>';
    }
    if (capabilities.includes('alerts') && capabilities.includes('integration')) {
      comboFeedback += '<em>Great! Automated alerts and integration across systems are a strong foundation for proactive observability.</em>';
    }

    // Display results
    const resultContainer = document.getElementById('result-message');
    resultContainer.innerHTML = `<span style="font-size:1.5rem">${category}</span><br>${description}` +
      (challengeFeedback ? `<div style="margin-top:1.5rem">${challengeFeedback}</div>` : '') +
      (capabilityFeedback ? `<div style="margin-top:1rem">${capabilityFeedback}</div>` : '') +
      (comboFeedback ? `<div style="margin-top:1rem;color:#0D1C4D">${comboFeedback}</div>` : '');
    // Show the results step
    currentStep = steps.length - 1;
    updateSteps();
    // Scroll results into view smoothly
    resultContainer.scrollIntoView({ behavior: 'smooth' });
  });

  // Initialise the first step display
  updateSteps();
});