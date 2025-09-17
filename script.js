// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
  // Initialize EmailJS
  (function () {
    emailjs.init({
      publicKey: 'P85AHdytGClllwG5i',
    });
  })();

  // --- Constants and Configuration ---
  const STAR_PRIZE_SPIN_LIMIT = 3;

  // --- Element References ---
  const canvas = document.getElementById('spinWheelCanvas');
  const ctx = canvas.getContext('2d');
  const spinButton = document.getElementById('spinButton');
  const messageBox = document.getElementById('messageBox');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const formContainer = document.getElementById('formContainer');
  const userDetailsForm = document.getElementById('userDetailsForm');
  const resetButton = document.getElementById('resetButton');
  const resultModal = document.getElementById('resultModal');
  const modalContent = document.getElementById('modalContent');
  const modalResultText = document.getElementById('modalResultText');
  const playAgainBtn = document.getElementById('playAgainBtn');
  const spinningSound = document.getElementById('spinningSound');
  const winSound = document.getElementById('winSound');
  const loseSound = document.getElementById('loseSound');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const questionModal = document.getElementById('questionModal');
  const questionForm = document.getElementById('questionForm');

  let userDetails = {};
  let userChoice = [];

  // --- Daily Prize & Spin Counter Logic ---
  const getTodayDateString = () => new Date().toISOString().split('T')[0];
  const todayStr = getTodayDateString();
  let dailyCounters = JSON.parse(localStorage.getItem('dailyCounters'));
  if (!dailyCounters || dailyCounters.date !== todayStr) {
    dailyCounters = { date: todayStr, spinCount: 0, starPrizeWon: false };
    localStorage.setItem('dailyCounters', JSON.stringify(dailyCounters));
  }

  // --- Email Logic ---
  const sendPlayerEmail = (segment) => {
    if (segment.type === 'retry') return;
    const serviceID = 'service_2gpnosc';
    const templateID = 'template_6blt3s7';
    const winnerName = userDetails.name;
    let emailSubject = '';
    let emailBody = '';
    const paragonIntro = `We're Paragon - we deliver end-to-end creative, production and fulfilment solutions, powered by in-house manufacturing, proprietary technology and AI innovation.<br><br>With global reach, local delivery and sustainability built in, we help ambitious brands deliver marketing that performs, scales, and lasts.`;
    const paragonTeamSignature = `The Paragon Team`;
    if (segment.isStarPrize) {
      emailSubject = `You’re our Golden Ticket Winner!`;
      const imageUrl = 'https://i.imgur.com/J56jFsa.png';
      emailBody = `<div style="font-family: sans-serif; line-height: 1.6;"><p>Hi ${winnerName},</p><p><strong>Congratulations – you’re our Golden Ticket Winner!</strong></p><p>You’ve won two tickets to a show of your choice at The O₂ in London.</p><p>One of our team will be in touch shortly to arrange your booking and help you choose your perfect night out.</p><p><img src="${imageUrl}" alt="Golden Ticket" style="max-width: 300px; height: auto;"></p><p>While you wait, here’s a little about us: ${paragonIntro}</p><p>Discover how we can help you: <a href="https://uk.paragon.world/contact-us" target="_blank">Speak to our team</a></p><p>Enjoy the show!</p><p>${paragonTeamSignature}</p></div>`;
    } else {
      emailSubject = `Thanks for playing – here’s your result!`;
      let dynamicResult = '';
      if (segment.type === 'winner') {
        dynamicResult = `Winner – Claim your prize  of a Paragon - ${segment.text}`;
      } else if (segment.type === 'lose') {
        dynamicResult = `Consolation Prize – Hard luck this time – claim your consolation prize of a Paragon - ${segment.text}`;
      }
      emailBody = `<div style="font-family: sans-serif; line-height: 1.6;"><p>Hi ${winnerName},</p><p>Thanks for stopping by the Paragon stand at Technology for Marketing and playing our Spin The Wheel game.</p><p><strong>Your result:</strong> ${dynamicResult}</p><p>${paragonIntro}</p><p>Want to find out how? <a href="https://uk.paragon.world/contact-us" target="_blank">Speak to our team</a>.</p><p>Thanks again for playing – enjoy your prize!</p><p>${paragonTeamSignature}</p></div>`;
    }
    const templateParams = {
      name: winnerName,
      email: userDetails.email,
      title: emailSubject,
      email_body: emailBody,
    };
    emailjs
      .send(serviceID, templateID, templateParams)
      .then((res) => console.log('Player email sent.'))
      .catch((err) => console.error('Player email failed.', err));
  };

  const sendAdminNotification = (choice) => {
    const serviceID = 'service_2gpnosc';
    const templateID = 'template_i04qaqr';
    const templateParams = {
      name: userDetails.name,
      email: userDetails.email,
      choice: choice.join('\n'),
    };
    emailjs
      .send(serviceID, templateID, templateParams)
      .then((res) => console.log('Admin notification sent.'))
      .catch((err) => console.error('Admin notification failed.', err));
  };

  // --- Confetti / Fireworks Function ---
  const fireFireworks = () => {
    const duration = 8 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }
    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 80 * (timeLeft / duration);
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
      );
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      );
    }, 200);
  };

  // --- Wheel Setup ---
  const starPrize = {
    text: 'O2 Tickets',
    displayText: 'O2 TICKETS!',
    type: 'winner',
    color: '#FFD700',
    isStarPrize: true,
    textColor: '#000000',
  };
  let segments = [
    { text: 'Pen', displayText: 'LOSE', type: 'lose', color: '#be6a14' },
    { text: 'Notebook', displayText: 'WIN', type: 'winner', color: ' #004f71' },
    { text: 'Pen', displayText: 'LOSE', type: 'lose', color: '#be6a14' },
    { text: 'Notebook', displayText: 'WIN', type: 'winner', color: ' #004f71' },
    { text: 'Pen', displayText: 'LOSE', type: 'lose', color: '#be6a14' },
    { text: 'Retry', displayText: 'RETRY', type: 'retry', color: '#E54F6D' },
    { text: 'Pen', displayText: 'LOSE', type: 'lose', color: '#be6a14' },
    { text: 'Notebook', displayText: 'WIN', type: 'winner', color: ' #004f71' },
    { text: 'Pen', displayText: 'LOSE', type: 'lose', color: '#be6a14' },
    { text: 'Retry', displayText: 'RETRY', type: 'retry', color: '#E54F6D' },
  ];
  segments.splice(4, 0, starPrize);
  const numSegments = segments.length;
  const arcSize = (2 * Math.PI) / numSegments;
  let totalRotation = 0;
  let isSpinning = false;

  const drawWheel = () => {
    const radius = canvas.width / 2;
    if (radius <= 0) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const startAngleOffset = -Math.PI / 2;
    segments.forEach((segment, i) => {
      const startAngle = i * arcSize + startAngleOffset;
      const endAngle = (i + 1) * arcSize + startAngleOffset;
      ctx.beginPath();
      ctx.arc(radius, radius, radius, startAngle, endAngle);
      ctx.lineTo(radius, radius);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();
      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate((startAngle + endAngle) / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = segment.textColor || '#ffffff';
      ctx.font = `bolder ${radius * 0.08}px sans-serif`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.shadowBlur = 3;
      ctx.fillText(segment.displayText, radius * 0.85, radius * 0.03);
      ctx.restore();
    });
  };

  // --- Main Spin Logic ---
  const handleSpin = () => {
    if (isSpinning) return;
    dailyCounters.spinCount += 1;
    localStorage.setItem('dailyCounters', JSON.stringify(dailyCounters));
    isSpinning = true;
    spinButton.disabled = true;
    spinButton.classList.add('hidden');
    messageBox.classList.remove('hidden');
    // KEY CHANGE: Updated the text as requested
    messageBox.textContent = 'Spinning...good luck!';
    spinningSound.loop = true;
    spinningSound.play();

    let winningSegmentIndex;
    const starPrizeIndex = segments.findIndex((s) => s.isStarPrize);
    const canWinStarPrize =
      !dailyCounters.starPrizeWon &&
      dailyCounters.spinCount <= STAR_PRIZE_SPIN_LIMIT;

    if (canWinStarPrize && dailyCounters.spinCount === STAR_PRIZE_SPIN_LIMIT) {
      winningSegmentIndex = starPrizeIndex;
    } else {
      winningSegmentIndex = Math.floor(Math.random() * numSegments);
      if (winningSegmentIndex === starPrizeIndex && !canWinStarPrize) {
        let newIndex = winningSegmentIndex;
        while (newIndex === starPrizeIndex) {
          newIndex = Math.floor(Math.random() * numSegments);
        }
        winningSegmentIndex = newIndex;
      }
    }
    const winningSegment = segments[winningSegmentIndex];

    const targetCenterAngle = winningSegmentIndex * arcSize + arcSize / 2;
    const targetOrientation = -targetCenterAngle;
    const currentOrientation = totalRotation % (2 * Math.PI);
    const rotationNeeded =
      (targetOrientation - currentOrientation + 2 * Math.PI) % (2 * Math.PI);
    const randomFullSpins = Math.floor(Math.random() * 6) + 5;
    totalRotation += rotationNeeded + randomFullSpins * 2 * Math.PI;

    canvas.style.transform = `rotate(${totalRotation}rad)`;
    canvas.addEventListener(
      'transitionend',
      () => {
        spinningSound.pause();
        spinningSound.currentTime = 0;
        if (winningSegment.type === 'retry') {
          messageBox.classList.add('hidden');
          spinButton.classList.remove('hidden');
          spinButton.disabled = false;
          isSpinning = false;
        } else {
          sendAdminNotification(userChoice);
          sendPlayerEmail(winningSegment);
          isSpinning = false;
          if (winningSegment.isStarPrize) {
            modalResultText.textContent = 'GOLDEN TICKET WINNER!';
          } else if (winningSegment.type === 'winner') {
            modalResultText.textContent = `YOU WON A ${winningSegment.text.toUpperCase()}!`;
          } else {
            modalResultText.textContent = `Consolation Prize: ${winningSegment.text}`;
          }
          resultModal.classList.remove('hidden');
          setTimeout(() => modalContent.classList.add('modal-visible'), 50);
          if (winningSegment.type === 'winner') {
            winSound.play();
            modalContent.classList.add('pulsing');
            fireFireworks();
            confetti({
              particleCount: 400,
              angle: 60,
              spread: 100,
              origin: { x: 0 },
              scalar: 0.7,
            });
            confetti({
              particleCount: 400,
              angle: 120,
              spread: 100,
              origin: { x: 1 },
              scalar: 0.7,
            });
          } else if (winningSegment.type === 'lose') {
            loseSound.play();
          }
          if (winningSegment.isStarPrize) {
            dailyCounters.starPrizeWon = true;
            localStorage.setItem(
              'dailyCounters',
              JSON.stringify(dailyCounters)
            );
          }
        }
      },
      { once: true }
    );
  };

  // --- Helper & Event Listener Functions ---
  const fullscreenBtnLogic = () => {
    const elem = document.documentElement;
    function openFullscreen() {
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    }
    function closeFullscreen() {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        openFullscreen();
      } else {
        closeFullscreen();
      }
    });
  };

  const resizeCanvas = () => {
    const size = canvas.parentElement.getBoundingClientRect().width;
    canvas.width = size;
    canvas.height = size;
    drawWheel();
  };

  // Step 1: Details form is submitted
  userDetailsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const isNameValid = nameInput.value.trim() !== '';
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
    if (isNameValid && isEmailValid) {
      // Store user details
      userDetails = { name: nameInput.value, email: emailInput.value };
      // Hide details form and show question form
      formContainer.classList.add('hidden');
      questionModal.classList.remove('hidden');
    } else {
      alert('Please enter a valid name and email address.');
    }
  });

  // Step 2: Question form is submitted
  questionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const selectedOptions = questionForm.querySelectorAll(
      'input[name="challenge"]:checked'
    );
    if (selectedOptions.length > 0) {
      const choices = Array.from(selectedOptions).map((option) => option.value);
      userChoice = choices; // Store as an array
      // Hide question form and enable the main spin button
      questionModal.classList.add('hidden');
      spinButton.disabled = false;
    } else {
      alert('Please select at least one answer.');
    }
  });

  // Step 3: The main spin button is clicked
  spinButton.addEventListener('click', () => {
    if (isSpinning || spinButton.disabled) return;
    handleSpin();
  });

  // LOGIC FOR PLAY AGAIN BUTTON
  playAgainBtn.addEventListener('click', () => {
    modalContent.classList.remove('modal-visible', 'pulsing');
    setTimeout(() => {
      resultModal.classList.add('hidden');
    }, 300);

    // Reset all form fields
    const checkedBoxes = questionForm.querySelectorAll(
      'input[name="challenge"]:checked'
    );
    checkedBoxes.forEach((checkbox) => (checkbox.checked = false));
    nameInput.value = '';
    emailInput.value = '';

    // Reset to the beginning of the flow (the details form)
    formContainer.classList.remove('hidden');

    messageBox.classList.add('hidden');
    spinButton.classList.remove('hidden');
    spinButton.disabled = true;
  });

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      localStorage.removeItem('dailyCounters');
      alert('Daily counters have been reset. The page will now reload.');
      location.reload();
    });
  }

  // --- Initial Setup ---
  spinButton.disabled = true;
  fullscreenBtnLogic();
  drawWheel();
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
});