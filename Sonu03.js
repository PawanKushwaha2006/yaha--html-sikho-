// Update budget range output
const budget = document.getElementById('budget');
const output = document.querySelector('output[for="budget"]');
if(budget && output){
  budget.addEventListener('input', () => {
    output.textContent = '$' + budget.value;
  });
}

// Form validation feedback
const form = document.querySelector('form');
if(form){
  form.addEventListener('submit', (e) => {
    if(!form.checkValidity()){
      e.preventDefault();
      alert('Please fill all required fields correctly');
    } else {
      e.preventDefault();
      alert('Form submitted! Check console for data.');
      console.log('Form data:', new FormData(form));
    }
  });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if(target) target.scrollIntoView({behavior: 'smooth'});
  });
});

// Current year in footer
document.querySelectorAll('footer p').forEach(p => {
  if(p.textContent.includes('2026')) {
    p.textContent = p.textContent.replace('2026', new Date().getFullYear());
  }
});
