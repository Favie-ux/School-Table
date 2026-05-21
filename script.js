// ========================================================
// 🎒 Your Pristine Math Table Logic (Ready to Present!)
// ========================================================

// for (let i = 1; i <= 10; i++) {
//     for (j=1; j<=24; j++) {
//      for (k=1; k<=4; k++){
//          console.log(`carton: ${i}, biscuit: ${j}, Has ${k} number of biscuit`) 
//      }  
//     }
// }   


// for (i=1; i <= 12; i++) {
//     for (j=1; j<=12; j++) {
//         console.log(`${i} X ${j} = ${i*j}`)
//     }
// }



function createTable() {
    const rowsInput = document.getElementById("firstNumber");
    const columnsInput = document.getElementById("secondNumber");
    const selectOption = document.getElementById("selectOption");
    const rows = parseInt(rowsInput?.value) || 0;
    const columns = parseInt(columnsInput?.value) || 0;
    const selectOne = selectOption?.value;
    const result = document.getElementById("result");
    let htmlBuffer = ""; // Build the garden in memory first for better performance

    for (let i = 1; i <= rows; i++){
        htmlBuffer += `<div class="math-table-group">`;
        htmlBuffer += `<h3 class="table-title">Table of ${i}</h3>`;
        htmlBuffer += `<div class="table-group-content">`;
        for(let j = 1; j <= columns; j++) {
            if(selectOne == "add") {
                htmlBuffer += `<p>${i} + ${j} = ${i+j}</p>`
            }
            else if(selectOne == "subtract") {
                 htmlBuffer += `<p>${i} - ${j} = ${i-j}</p>`
            }
            else if(selectOne == "multiply") {
                  htmlBuffer += `<p>${i} x ${j} = ${i*j}</p>`
            }
            else if(selectOne == "divide") {
                htmlBuffer += `<p>${i} ÷ ${j} = ${(i/j).toFixed(1)}</p>`
            }
        }
        htmlBuffer += `</div></div>`;
    }
    result.innerHTML = htmlBuffer;
}


// ========================================================
// 🌸 Magic Math Garden - Design, Audio, and Vocal Engine
// ========================================================

window.addEventListener("load", () => {
    // Hide the loading screen with a tiny delay to ensure a magical entrance!
    setTimeout(() => {
        const loader = document.getElementById("loadingScreen");
        if (loader) loader.classList.add("hidden");
        document.body.classList.add("loaded");
    }, 1200);
});

document.addEventListener("DOMContentLoaded", () => {
    const btnGrow = document.getElementById("btnGrow");
    const resultsBox = document.getElementById("resultsBox");
    const resultDiv = document.getElementById("result");
    const secondNumberInput = document.getElementById("secondNumber");
    const soundStatus = document.getElementById("soundStatus");
    const musicWave = document.getElementById("musicWave");
    const congratsPopup = document.getElementById("congratsPopup");
    const musicToggleBtn = document.getElementById("musicToggleBtn");
    
    // New feature elements
    const quizModeToggle = document.getElementById("quizModeToggle");
    const btnClear = document.getElementById("btnClear");
    const btnPrint = document.getElementById("btnPrint");
    const presetBtns = document.querySelectorAll(".preset-btn");
    const starCountEl = document.getElementById("starCount");
    const starJarContainer = document.getElementById("starJarContainer");
    
    // --- Gamification State ---
    let starsCollected = parseInt(localStorage.getItem('magicStars')) || 0;
    if (starCountEl) starCountEl.textContent = starsCollected;
    
    let unlockedPets = JSON.parse(localStorage.getItem('unlockedPets')) || ['🐼'];
    let activePet = localStorage.getItem('activePet') || '🐼';
    const meadowPanda = document.querySelector(".panda-bounce");
    if (meadowPanda) meadowPanda.textContent = activePet;

    let harvestSeq = 0; // Sequence ID to manage automated speech
    let isReading = false; // Flag to prevent music from overriding speech
    let musicShouldBePaused = false; // Bulletproof flag for play/pause races
    let musicExplicitlyMuted = false; // Flag for user-toggled mute
    // The bulletproof Local Voice Automator (Uses the 39 pre-downloaded audio files)
    const localAudio = new Audio();
    if ('preservesPitch' in localAudio) {
        localAudio.preservesPitch = false;
    }

    // --- Guide Modal Logic ---
    const guideBtn = document.getElementById("guideBtn");
    const guideModal = document.getElementById("guideModal");
    const closeGuideBtn = document.getElementById("closeGuideBtn");

    if (guideBtn && guideModal) {
        guideBtn.addEventListener("click", () => guideModal.classList.remove("hidden"));
        closeGuideBtn.addEventListener("click", () => guideModal.classList.add("hidden"));
    }

    // --- Pet Shop Modal Logic ---
    const petShopBtn = document.getElementById("petShopBtn");
    const petShopModal = document.getElementById("petShopModal");
    const closeShopBtn = document.getElementById("closeShopBtn");

    if (petShopBtn && petShopModal) {
        petShopBtn.addEventListener("click", () => {
            updateShopUI();
            petShopModal.classList.remove("hidden");
        });
        closeShopBtn.addEventListener("click", () => petShopModal.classList.add("hidden"));
    }

    function updateShopUI() {
        document.querySelectorAll(".shop-item").forEach(item => {
            const cost = parseInt(item.getAttribute("data-cost"));
            const pet = item.getAttribute("data-pet");
            const btn = item.querySelector(".buy-pet-btn");
            
            if (unlockedPets.includes(pet)) {
                item.classList.add("unlocked");
                btn.textContent = (activePet === pet) ? "Equipped" : "Equip";
                btn.disabled = false;
            } else {
                if (starsCollected >= cost) {
                    btn.disabled = false;
                    btn.textContent = `Buy (${cost} ⭐)`;
                } else {
                    btn.disabled = true;
                    btn.textContent = `Need ${cost} ⭐`;
                }
            }
            
            // Remove old listeners to avoid stacking
            const newBtn = btn.cloneNode(true);
            btn.replaceWith(newBtn);
            
            newBtn.addEventListener("click", () => {
                if (unlockedPets.includes(pet)) {
                    activePet = pet;
                    localStorage.setItem('activePet', pet);
                    if (meadowPanda) meadowPanda.textContent = pet;
                    updateShopUI();
                } else if (starsCollected >= cost) {
                    starsCollected -= cost;
                    localStorage.setItem('magicStars', starsCollected);
                    if (starCountEl) starCountEl.textContent = starsCollected;
                    unlockedPets.push(pet);
                    localStorage.setItem('unlockedPets', JSON.stringify(unlockedPets));
                    
                    activePet = pet;
                    localStorage.setItem('activePet', pet);
                    if (meadowPanda) meadowPanda.textContent = pet;
                    updateShopUI();
                }
            });
        });
    }

    // --- Easter Eggs ---
    const sunEl = document.querySelector(".animated-sun");
    if (sunEl) {
        sunEl.addEventListener("click", () => {
            if (sunEl.textContent === "🌞") {
                sunEl.textContent = "😎";
            } else {
                sunEl.textContent = "🌞";
            }
        });
    }

    const logoEl = document.querySelector(".school-logo");
    let logoClicks = 0;
    if (logoEl) {
        logoEl.addEventListener("click", () => {
            logoClicks++;
            if (logoClicks >= 5) {
                logoEl.classList.remove("flip-animation");
                void logoEl.offsetWidth; // trigger reflow
                logoEl.classList.add("flip-animation");
                logoClicks = 0;
            }
        });
    }

    // --- Magic Paintbrush Initialization ---
    window.activePaintColor = null;
    document.querySelectorAll(".color-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const color = btn.getAttribute("data-color");
            
            // Toggle off if already active
            if (btn.classList.contains("active")) {
                btn.classList.remove("active");
                window.activePaintColor = null;
            } else {
                document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                window.activePaintColor = color;
            }
        });
    });

    // --- Teacher Presets ---
    if (presetBtns) {
        presetBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const r = btn.getAttribute("data-rows");
                const c = btn.getAttribute("data-cols");
                const firstNumberInput = document.getElementById("firstNumber");
                if (firstNumberInput) firstNumberInput.value = r;
                if (secondNumberInput) secondNumberInput.value = c;
                // Auto-generate
                if (btnGrow) btnGrow.click();
            });
        });
    }

    // --- Clear Garden Button ---
    if (btnClear) {
        btnClear.addEventListener("click", () => {
            resultDiv.innerHTML = "";
            resultsBox.classList.remove("active");
            stopSpeech();
            harvestSeq++; // Interrupt auto-read
            isReading = false;
            safePlayMusic();
            const colorPickerUI = document.getElementById("colorPickerUI");
            if (colorPickerUI) colorPickerUI.classList.add("hidden");
        });
    }

    // --- Print Worksheet Button ---
    if (btnPrint) {
        btnPrint.addEventListener("click", () => {
            window.print();
        });
    }

    // --- Orchestrate Grow button (Clears results first, runs your createTable second, grids columns third) ---
    if (btnGrow) {
        btnGrow.addEventListener("click", (e) => {
            // Prevent this click from triggering document-level listeners that instantly unpause music
            e.stopPropagation();
            
            // Unlock audio for sequential playback
            if (!localAudio.src) {
                localAudio.src = 'data:audio/mp3;base64,//OQxAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
                localAudio.play().then(() => localAudio.pause()).catch(() => {});
            }

            // Mark greeting as spoken so we don't interrupt with a welcome message
            greetingSpoken = true;

            // 1. Clear previous math results first so old tables don't stack
            resultDiv.innerHTML = "";
            
            // 2. Call your untouched, pristine createTable function from above!
            if (typeof createTable === "function") {
                createTable();
            }
            
            // --- QUIZ MODE: True Test Input Mode ---
            const isQuizMode = quizModeToggle && quizModeToggle.checked;
            const paragraphs = Array.from(resultDiv.querySelectorAll("p"));
            
            if (isQuizMode) {
                paragraphs.forEach(p => {
                    const fullText = p.textContent;
                    const parts = fullText.split("=");
                    if (parts.length === 2) {
                        const equation = parts[0] + "=";
                        const answer = parseFloat(parts[1].trim());
                        
                        // Generate wrong answers
                        let wrong1 = answer + Math.floor(Math.random() * 5) + 1;
                        let wrong2 = answer - Math.floor(Math.random() * 5) - 1;
                        if (wrong2 < 0 && answer > 0) wrong2 = answer + 2; // Keep positive if answer > 0
                        if (wrong1 === wrong2) wrong1 += 1;
                        
                        const options = [
                            { val: answer, correct: true },
                            { val: wrong1, correct: false },
                            { val: wrong2, correct: false }
                        ];
                        
                        // Shuffle options
                        options.sort(() => Math.random() - 0.5);
                        
                        const labels = ['A', 'B', 'C'];
                        let buttonsHtml = '<span class="quiz-options">';
                        options.forEach((opt, idx) => {
                            buttonsHtml += `<button class="quiz-btn" data-correct="${opt.correct}">${labels[idx]}) ${opt.val}</button>`;
                        });
                        buttonsHtml += '</span>';
                        
                        p.innerHTML = `${equation} ${buttonsHtml}`;
                    }
                });
                
                // Add event listeners to the new buttons
                document.querySelectorAll(".quiz-btn").forEach(btn => {
                    btn.addEventListener("click", function(e) {
                        e.stopPropagation(); // Prevent block read when picking answer
                        checkQuizAnswer(this);
                    });
                });
            } else {
                paragraphs.forEach(p => p.classList.remove("quiz-hidden"));
            }
            
            // 4. Reveal math results container and scroll into view smoothly
            resultsBox.classList.add("active");
            
            const colorPickerUI = document.getElementById("colorPickerUI");
            if (colorPickerUI) colorPickerUI.classList.remove("hidden");

            // 5. Show congratulations popup + emoji spray!
            if (paragraphs.length > 0) {
                showCongratsPopup();
                launchEmojiSpray();
                
                isReading = true; // Block music from playing
                
                // Stop any current speech immediately
                stopSpeech();
                
                // Pause background music safely and bulletproof
                safePauseMusic();

                harvestSeq++;
                const currentSeqId = harvestSeq;
                let currentIndex = 0;

                // Wait for the popup to finish showing before starting voice
                setTimeout(() => {
                    resultsBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    
                    if (isQuizMode) {
                        // In quiz mode, let the kid click to reveal. Don't auto-read the whole board.
                        isReading = false;
                        safePlayMusic();
                        return;
                    }
                    
                    // Sequential speaker ensures every equation is processed one after the other
                    const speakNext = () => {
                        if (currentSeqId !== harvestSeq) return;

                        if (currentIndex < paragraphs.length) {
                            const text = paragraphs[currentIndex].innerText;
                            currentIndex++;
                            const isLast = currentIndex === paragraphs.length;
                            
                            speakEquation(text, isLast ? () => {
                                if (currentSeqId !== harvestSeq) return;
                                isReading = false; // Allow music again
                                
                                // Entertaining Feature: Confetti Explosion for kids! 🎉
                                launchConfetti();
                                
                                // Resume background music after the very last equation
                                safePlayMusic();
                            } : speakNext);
                        }
                    };
                    // Start the reading sequence after popup closes
                    speakNext();
                }, 2800);
            } else { // If there's no math to read, ensure music is playing
                startAmbientMusic();
            }
        });
    }

    // --- Ultimate Local Voice Automation Engine ---
    function stopSpeech() {
        if (!localAudio.paused) {
            localAudio.pause();
            localAudio.currentTime = 0;
        }
    }

    // Convert number strings like "342" or "2.4" into local audio file names
    function numberToAudioFiles(numStr) {
        if (numStr === "") return [];
        let num = parseFloat(numStr);
        if (isNaN(num)) return [];
        
        let words = [];
        let numInt = Math.floor(num);
        
        if (numInt === 0) {
            words.push("0");
        } else if (numInt <= 20) {
            words.push(numInt.toString());
        } else if (numInt < 100) {
            let tens = Math.floor(numInt / 10) * 10;
            let ones = numInt % 10;
            words.push(tens.toString());
            if (ones > 0) words.push(ones.toString());
        } else {
            let hundreds = Math.floor(numInt / 100) * 100;
            let remainder = numInt % 100;
            words.push(hundreds.toString());
            if (remainder > 0) {
                if (remainder <= 20) {
                    words.push(remainder.toString());
                } else {
                    let tens = Math.floor(remainder / 10) * 10;
                    let ones = remainder % 10;
                    words.push(tens.toString());
                    if (ones > 0) words.push(ones.toString());
                }
            }
        }
        
        // Handle decimals like 2.5
        if (numStr.includes(".")) {
            words.push("point");
            let decimalPart = numStr.split(".")[1];
            for (let i = 0; i < decimalPart.length; i++) {
                words.push(decimalPart[i]);
            }
        }
        return words;
    }

    // Recursively plays an array of local audio file names seamlessly
    function playAudioSequence(audioFiles, callback) {
        if (audioFiles.length === 0) {
            if (callback) callback();
            return;
        }
        
        let currentFile = audioFiles.shift(); // remove first element
        localAudio.src = "voice/" + currentFile + ".mp3";
        localAudio.playbackRate = 1.25; 
        
        localAudio.onended = () => {
            playAudioSequence(audioFiles, callback);
        };
        
        localAudio.onerror = (e) => {
            console.warn("Missing audio file:", currentFile);
            playAudioSequence(audioFiles, callback);
        };
        
        localAudio.play().catch(e => {
            console.warn("Audio Play Blocked:", e);
            setTimeout(() => playAudioSequence(audioFiles, callback), 200);
        });
    }

    function speakEquation(rawFormula, callback) {
        stopSpeech();
        
        // Parse formula into tokens (e.g. "12 + 4 = 16" -> ["12", "+", "4", "=", "16"])
        const tokens = rawFormula.split(" ");
        let audioFiles = [];
        
        for (let token of tokens) {
            if (token === "+") audioFiles.push("plus");
            else if (token === "-") audioFiles.push("minus");
            else if (token === "x" || token === "×" || token === "*") audioFiles.push("times");
            else if (token === "/" || token === "÷") audioFiles.push("divided_by");
            else if (token === "=") audioFiles.push("equals");
            else {
                audioFiles = audioFiles.concat(numberToAudioFiles(token));
            }
        }
        
        playAudioSequence(audioFiles, callback);
    }

    // --- Entertaining Confetti Feature ---
    function launchConfetti() {
        for (let i = 0; i < 40; i++) {
            const confetti = document.createElement("div");
            confetti.classList.add("confetti");
            confetti.style.left = Math.random() * 100 + "vw";
            confetti.style.animationDuration = (Math.random() * 2 + 2) + "s";
            
            // Randomize confetti colors
            const colors = ["#ff547d", "#4ecdc4", "#f2d74e", "#8b5a2b", "#ffffff"];
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Randomize shapes (squares vs circles)
            if (Math.random() > 0.5) {
                confetti.style.borderRadius = "50%";
            }
            
            document.body.appendChild(confetti);
            
            // Cleanup confetti after animation finishes
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }

    // --- Congratulations Popup ---
    function showCongratsPopup() {
        if (!congratsPopup) return;
        congratsPopup.classList.remove("hidden");
        
        // Auto-close popup after 2.5 seconds
        setTimeout(() => {
            congratsPopup.classList.add("hidden");
        }, 2500);
    }

    // --- Emoji Spray Explosion ---
    function launchEmojiSpray() {
        const emojis = ["🎉", "🎊", "🌟", "🎈", "✨", "🎇", "💫", "🏆", "🥳", "🎆"];
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const emoji = document.createElement("span");
                emoji.classList.add("emoji-spray");
                emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                
                // Random direction spread from center
                const angle = Math.random() * Math.PI * 2;
                const distance = 150 + Math.random() * 250;
                const sprayX = Math.cos(angle) * distance;
                const sprayY = Math.sin(angle) * distance;
                
                emoji.style.left = centerX + "px";
                emoji.style.top = centerY + "px";
                emoji.style.setProperty("--spray-x", sprayX + "px");
                emoji.style.setProperty("--spray-y", sprayY + "px");
                
                document.body.appendChild(emoji);
                
                setTimeout(() => emoji.remove(), 1800);
            }, i * 60); // Stagger each emoji slightly
        }
    }

    // Pre-cache removed since we are using Cloud TTS

    // --- Gamification Logic ---
    function checkGroupCompletion(pBlock) {
        const group = pBlock.closest(".math-table-group");
        if (group) {
            const allBlocks = Array.from(group.querySelectorAll("p"));
            const allSolved = allBlocks.every(p => p.hasAttribute("data-quiz-solved") || p.hasAttribute("data-read"));
            
            if (allSolved && !group.hasAttribute("data-completed")) {
                group.setAttribute("data-completed", "true");
                document.body.classList.remove("shake-animation");
                void document.body.offsetWidth;
                document.body.classList.add("shake-animation");
                setTimeout(() => document.body.classList.remove("shake-animation"), 600);
                
                const medal = document.createElement("div");
                medal.className = "gold-medal";
                medal.textContent = "🏅";
                group.appendChild(medal);
            }
        }
    }

    function checkQuizAnswer(btnEl) {
        const pBlock = btnEl.closest("p");
        
        // If already answered, show toast warning
        if (pBlock.hasAttribute("data-locked")) {
            showToast("You can't go back! You've picked your answer already.");
            return;
        }
        
        // Lock it
        pBlock.setAttribute("data-locked", "true");
        const isCorrect = btnEl.getAttribute("data-correct") === "true";
        const allBtns = pBlock.querySelectorAll(".quiz-btn");
        
        // Disable all buttons in this block visually
        allBtns.forEach(b => b.disabled = true);
        
        if (isCorrect) {
            btnEl.classList.add("correct");
            pBlock.style.setProperty("background", "#86efac", "important"); // green
            pBlock.style.setProperty("color", "#14532d", "important");
            pBlock.setAttribute("data-quiz-solved", "true");
            
            starsCollected++;
            localStorage.setItem('magicStars', starsCollected);
            if (starCountEl) starCountEl.textContent = starsCollected;
            
            const rect = btnEl.getBoundingClientRect();
            animateStarToJar(rect.left, rect.top);
        } else {
            btnEl.classList.add("wrong");
            pBlock.style.setProperty("background", "#fca5a5", "important"); // red
            pBlock.style.setProperty("color", "#7f1d1d", "important");
            pBlock.setAttribute("data-quiz-solved", "true");
            
            // Highlight the correct one
            allBtns.forEach(b => {
                if (b.getAttribute("data-correct") === "true") {
                    b.classList.add("correct-reveal");
                }
            });
        }
        
        checkGroupCompletion(pBlock);
    }

    // --- Toast Notification ---
    function showToast(message) {
        const toast = document.getElementById("toastNotification");
        if (!toast) return;
        toast.textContent = message;
        toast.classList.remove("hidden");
        toast.classList.add("show");
        
        if (window.toastTimeout) clearTimeout(window.toastTimeout);
        window.toastTimeout = setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    function animateStarToJar(clientX, clientY) {
        if (!starJarContainer) return;
        const star = document.createElement("div");
        star.className = "flying-star";
        star.textContent = "⭐";
        star.style.left = clientX + "px";
        star.style.top = clientY + "px";
        
        const jarRect = starJarContainer.getBoundingClientRect();
        const targetX = (jarRect.left + jarRect.width/2) - clientX + "px";
        const targetY = (jarRect.top + jarRect.height/2) - clientY + "px";
        
        star.style.setProperty("--target-x", targetX);
        star.style.setProperty("--target-y", targetY);
        document.body.appendChild(star);
        setTimeout(() => star.remove(), 800);
    }

    // --- Playful Sparks on Block Click ---
    if (resultDiv) {
        resultDiv.addEventListener("click", (e) => {
            const pBlock = e.target.closest("p");
            if (!pBlock) return;
            
            if (e.target.tagName.toLowerCase() === 'input') return; // Don't read if typing
            
            e.stopPropagation();
            
            const hasInput = pBlock.querySelector("input");
            
            if (!hasInput && !pBlock.hasAttribute("data-read")) {
                starsCollected++;
                localStorage.setItem('magicStars', starsCollected);
                if (starCountEl) starCountEl.textContent = starsCollected;
                animateStarToJar(e.clientX, e.clientY);
            }
            
            pBlock.setAttribute("data-read", "true");
            
            if (window.activePaintColor) {
                pBlock.style.setProperty("background", window.activePaintColor, "important");
            }

            if (!hasInput) {
                checkGroupCompletion(pBlock);
            }
            
            // Stop any current reading and speak this specific block
            stopSpeech();
            harvestSeq++; // Interrupt any ongoing auto-reading sequence
            
            if (bgMusic) bgMusic.volume = 0.3;
            isReading = true;
            
            speakEquation(pBlock.innerText, () => {
                isReading = false;
                // Restore music volume after the voice is done
                if (bgMusic) bgMusic.volume = 1.0;
            });
            
            // Spawn floaty spark emojis inside block
            const sparks = ["⭐", "✨", "🌸", "🎈", "🍬", "🍀"];
            const chosenSpark = sparks[Math.floor(Math.random() * sparks.length)];
            
            const particle = document.createElement("span");
            particle.className = "click-particle";
            particle.textContent = chosenSpark;
            
            const rect = pBlock.getBoundingClientRect();
            particle.style.left = `${e.clientX - rect.left}px`;
            particle.style.top = `${e.clientY - rect.top}px`;
            
            pBlock.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 600);
        });
    }

    // --- Radio Playlist Audio Engine (Local Files) ---
    let ambientStarted = false;
    let greetingSpoken = false;
    
    // Background Music Playlist
    const playlist = [
        { file: 'cocomelon.mp3', name: 'Cocomelon' },
        { file: 'kids_music.mp3', name: 'Kids Tunes' },
        { file: 'llo.mp3', name: 'Llo Lullaby' }
    ];
    // Shuffle playlist on load
    playlist.sort(() => Math.random() - 0.5);
    
    let currentTrackIndex = 0;
    const bgMusic = new Audio(playlist[currentTrackIndex].file);
    bgMusic.volume = 1.0;
    bgMusic.preload = "auto";
    
    // Shuffle logic: play next song when one finishes
    bgMusic.onended = () => {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        bgMusic.src = playlist[currentTrackIndex].file;
        safePlayMusic();
    };

    // Bulletproof pause/play wrapper
    function safePlayMusic() {
        if (!bgMusic) return;
        if (musicExplicitlyMuted) return;
        musicShouldBePaused = false;
        bgMusic.play().then(() => {
            if (musicShouldBePaused) {
                // If a pause was requested while play() was still resolving, pause it immediately!
                bgMusic.pause();
            } else {
                ambientStarted = true;
                removeTriggerListeners();
                if (musicToggleBtn) musicToggleBtn.checked = true;
            }
        }).catch(e => {
            console.warn("Music play blocked:", e);
        });
    }

    function safePauseMusic(explicit = false) {
        if (!bgMusic) return;
        musicShouldBePaused = true;
        if (explicit) musicExplicitlyMuted = true;
        bgMusic.pause();
        if (explicit && musicToggleBtn) {
            musicToggleBtn.checked = false;
        }
    }

    if (musicToggleBtn) {
        musicToggleBtn.addEventListener("change", (e) => {
            if (musicToggleBtn.checked) {
                musicExplicitlyMuted = false;
                if (!isReading) {
                    safePlayMusic();
                }
            } else {
                safePauseMusic(true);
            }
        });
    }

    function startAmbientMusic() {
        // Ensure greeting is spoken on the very first user interaction
        if (!greetingSpoken && !isReading) {
            playAudioSequence(["Here_is_your_math_harvest"], () => {});
            greetingSpoken = true;
        }

        // Attempt to play background music only if it hasn't started yet
        if (!ambientStarted) { // Check ambientStarted here to prevent multiple play attempts
            if (isReading) return; // Prevent starting music if child voice is currently reading
            
            safePlayMusic();
        } else {
            // If ambientStarted is true, but music might have been paused by visibilitychange, try to resume.
            // This handles cases where user returns to tab but music didn't auto-resume.
            if (!isReading && bgMusic.paused) {
                safePlayMusic();
            }
        }
    }

    // --- Tab Visibility Logic (Off immediately when you leave) ---
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            bgMusic.pause();
            musicShouldBePaused = true;
            stopSpeech();
        } else if (ambientStarted && !isReading) {
            safePlayMusic();
        }
    });

    // --- Full Page Leave: Stop everything when user navigates away or closes tab ---
    window.addEventListener("beforeunload", () => {
        bgMusic.pause();
        bgMusic.src = "";
        stopSpeech();
    });

    window.addEventListener("pagehide", () => {
        bgMusic.pause();
        bgMusic.src = "";
        stopSpeech();
    });

    // --- Autoplay Policy Bypass Orchestrator ---
    // Browsers require a gesture to enable audio. To play sound "instantly", we trigger it 
    // on load AND immediately on the very first tiny movement (mousemove, touch, keydown, scroll).
    // This makes it feel completely automatic because the sound begins before the user even tries to click!
    
    let canStartMusic = false;

    function removeTriggerListeners() {
        document.removeEventListener("mousemove", handleInteractionStart);
        document.removeEventListener("keydown", handleInteractionStart);
        document.removeEventListener("scroll", handleInteractionStart);
        document.removeEventListener("touchstart", handleInteractionStart);
        document.removeEventListener("click", handleInteractionStart);
        document.removeEventListener("mousedown", handleInteractionStart);
    }

    function handleInteractionStart() {
        if (canStartMusic) {
            startAmbientMusic();
        }
    }

    // Wait exactly 2 seconds after page load before attempting to play music
    window.addEventListener("load", () => {
        setTimeout(() => {
            canStartMusic = true;
            startAmbientMusic();
        }, 2000);
    });

    // Setup early interaction bypass triggers for full autoplay effect
    document.addEventListener("mousemove", handleInteractionStart);
    document.addEventListener("keydown", handleInteractionStart);
    document.addEventListener("scroll", handleInteractionStart);
    document.addEventListener("touchstart", handleInteractionStart);
    document.addEventListener("click", handleInteractionStart);
    document.addEventListener("mousedown", handleInteractionStart);
});
