// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
  // Initialize EmailJS
  (function () {
    emailjs.init({
      publicKey: 'P85AHdytGClllwG5i',
    });
  })();

  // Element references
  const canvas = document.getElementById('spinWheelCanvas');
  const ctx = canvas.getContext('2d');
  const spinButton = document.getElementById('spinButton');
  const messageBox = document.getElementById('messageBox');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const formContainer = document.getElementById('formContainer');
  const resetButton = document.getElementById('resetButton');

  // Modal and sound effect references
  const resultModal = document.getElementById('resultModal');
  const modalContent = document.getElementById('modalContent');
  const modalResultText = document.getElementById('modalResultText');
  const playAgainBtn = document.getElementById('playAgainBtn');
  const spinningSound = document.getElementById('spinningSound');
  const winSound = document.getElementById('winSound');
  const loseSound = document.getElementById('loseSound');

  // Form input references
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  let userDetails = {};

  // Daily Prize & Spin Counter Logic
  const starPrize = {
    text: 'O2 TICKETS!',
    color: '#FFD700',
    isStarPrize: true,
  };

  const getTodayDateString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  };

  const todayStr = getTodayDateString();
  let dailyCounters = JSON.parse(localStorage.getItem('dailyCounters'));

  if (!dailyCounters || dailyCounters.date !== todayStr) {
    dailyCounters = {
      date: todayStr,
      spinCount: 0,
      starPrizeWon: false,
    };
    localStorage.setItem('dailyCounters', JSON.stringify(dailyCounters));
  }

  // --- UPDATED sendEmail FUNCTION ---
  const sendEmail = (result) => {
    const serviceID = 'service_2gpnosc';
    const templateID = 'template_6blt3s7'; // Your template ID
    let emailBody = '';
    let emailSubject = 'Spin Wheel Result';
    const winnerName = userDetails.name;
    const sign1 = 'E: marketing@paragon-cc.co.uk';
    const sign2 = 'W: paragon.world/en-gb';
    const sign3 = 'A: Park House, 16-18 Finsbury Circus, London, EC2M 7EB';
    const sign4 = 'Marketing Team,';

    // Build the email body and subject based on the result
    switch (result) {
      case 'WIN':
        emailSubject = `Congratulations, ${winnerName}! You're a Winner!`;
        emailBody = `Hi ${winnerName},\n\nGreat news! You spun the wheel and won!\n\nTo claim your prize, please show this email to a Paragon staff member.\n\nThanks for playing!\n\n\n${sign4}\n\n${sign1}\n${sign2}\n${sign3}`;
        break;
      case 'O2 TICKETS!':
        emailSubject = `HUGE NEWS! You've Won O2 Tickets, ${winnerName}!`;
        emailBody = `Hi ${winnerName},\n\nIncredible! You've won the grand prize: O2 TICKETS!\n\nTo claim your tickets, please choose one of the following options:\n
Visit us in person: Come to the Paragon booth and show this email to a member of our team.
Contact us by email: marketing@paragon-cc.co.uk.\n\nCongratulations!\n\n\n${sign4}\n\n${sign1}\n${sign2}\n${sign3}`;
        break;
      case 'LOSE':
        emailSubject = `Thanks for playing, ${winnerName}!`;
        emailBody = `Hi ${winnerName},\n\nThank you for taking a spin on our wheel today!\n\nUnfortunately, it wasn't a winning spin this time, but we really appreciate you participating.\n\nBetter luck next time!\n\n\n${sign4}\n\n${sign1}\n${sign2}\n${sign3}`;
        break;
    }

    const templateParams = {
      name: winnerName,
      email: userDetails.email,
      title: emailSubject,
      email_body: emailBody, // New simplified variable
    };

    emailjs
      .send(serviceID, templateID, templateParams)
      .then((response) => {
        console.log('SUCCESS! Email sent.', response.status, response.text);
      })
      .catch((err) => {
        console.error('FAILED to send email.', err);
      });
  };

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

  let segments = [
    { text: 'RETRY', color: '#e51937' },
    { text: 'WIN', color: '#006492' },
    { text: 'LOSE', color: '#e51937' },
    { text: 'WIN', color: '#006492' },
    { text: 'LOSE', color: '#e51937' },
    { text: 'RETRY', color: '#006492' },
    { text: 'LOSE', color: '#e51937' },
    { text: 'WIN', color: '#006492' },
    { text: 'LOSE', color: '#e51937' },
    { text: 'WIN', color: '#006492' },
  ];
  segments.splice(4, 0, starPrize);
  const numSegments = segments.length;
  const arcSize = (2 * Math.PI) / numSegments;
  let totalRotation = 0;
  let isSpinning = false;

  const drawWheel = () => {
    const radius = canvas.width / 2;
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
      ctx.fillStyle = '#ffffff';
      ctx.font = `bolder ${radius * 0.08}px sans-serif`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.shadowBlur = 3;
      ctx.fillText(segment.text, radius * 0.85, radius * 0.03);
      ctx.restore();
    });
  };

  const handleSpin = () => {
    if (isSpinning) return;
    if (!formContainer.classList.contains('hidden')) {
      userDetails = {
        name: nameInput.value,
        email: emailInput.value,
      };
      formContainer.classList.add('hidden');
    }
    dailyCounters.spinCount += 1;
    localStorage.setItem('dailyCounters', JSON.stringify(dailyCounters));
    nameInput.disabled = true;
    emailInput.disabled = true;
    isSpinning = true;
    spinButton.disabled = true;
    messageBox.textContent = 'Spinning... Good luck!';
    spinningSound.loop = true;
    spinningSound.play();
    let winningSegmentIndex;
    const starPrizeIndex = segments.findIndex((s) => s.isStarPrize);
    const canWinStarPrize =
      !dailyCounters.starPrizeWon && dailyCounters.spinCount <= 20;
    if (canWinStarPrize && dailyCounters.spinCount === 20) {
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
        const resultText = winningSegment.text;
        if (resultText === 'RETRY') {
          messageBox.textContent = 'RETRY! Spin Again!';
          isSpinning = false;
          spinButton.disabled = false;
        } else {
          sendEmail(resultText);
          isSpinning = false;
          modalResultText.textContent = resultText;
          resultModal.classList.remove('hidden');
          setTimeout(() => modalContent.classList.add('modal-visible'), 50);
          if (resultText === 'WIN' || winningSegment.isStarPrize) {
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
          }
          if (resultText === 'LOSE') {
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

  const checkFormValidity = () => {
    const isNameValid = nameInput.value.trim() !== '';
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
    if (isNameValid && isEmailValid && !isSpinning) {
      spinButton.disabled = false;
    } else {
      spinButton.disabled = true;
    }
  };

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
    function toggleFullScreen() {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        openFullscreen();
      } else {
        closeFullscreen();
      }
    }
    fullscreenBtn.addEventListener('click', toggleFullScreen);
  };

  const resizeCanvas = () => {
    const size = canvas.parentElement.getBoundingClientRect().width;
    canvas.width = size;
    canvas.height = size;
    drawWheel();
  };

  playAgainBtn.addEventListener('click', () => {
    modalContent.classList.remove('modal-visible');
    modalContent.classList.remove('pulsing');
    setTimeout(() => {
      resultModal.classList.add('hidden');
    }, 300);
    nameInput.value = '';
    emailInput.value = '';
    nameInput.disabled = false;
    emailInput.disabled = false;
    checkFormValidity();
    formContainer.classList.remove('hidden');
    messageBox.textContent = 'SPIN ME TO WIN!';
    messageBox.removeAttribute('style');
  });

  spinButton.disabled = true;
  nameInput.addEventListener('input', checkFormValidity);
  emailInput.addEventListener('input', checkFormValidity);
  spinButton.addEventListener('click', handleSpin);
  fullscreenBtnLogic();
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      localStorage.removeItem('dailyCounters');
      location.reload();
    });
  }
});
