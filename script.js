// ========================================================
// 🎒 Magic Math Garden Logic
// ========================================================

(() => {
    const OPERATION_NAMES = {
        add: "Add",
        subtract: "Take Away",
        multiply: "Times",
        divide: "Share"
    };

    const QUIZ_LABELS = ["A", "B", "C"];
    const STAR_KEY = "magicStars";
    const UNLOCKED_PETS_KEY = "unlockedPets";
    const ACTIVE_PET_KEY = "activePet";

    const PLAYLIST = [
        { file: "cocomelon.mp3", name: "Cocomelon" },
        { file: "kids_music.mp3", name: "Kids Tunes" },
        { file: "llo.mp3", name: "Llo Lullaby" }
    ];

    const state = {
        starsCollected: 0,
        unlockedPets: ["🐼"],
        activePet: "🐼",
        currentTrackIndex: 0,
        harvestSeq: 0,
        isReading: false,
        musicShouldBePaused: false,
        musicExplicitlyMuted: false,
        ambientStarted: false,
        canStartMusic: false,
        quizMode: false,
        toastTimeoutId: null,
        loaderTimeoutId: null
    };

    const dom = {};

    const audio = {
        speech: new Audio(),
        music: null
    };

    function $(selector, root = document) {
        return root.querySelector(selector);
    }

    function $all(selector, root = document) {
        return Array.from(root.querySelectorAll(selector));
    }

    function parseStoredJson(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch {
            return fallback;
        }
    }

    function loadState() {
        const stars = Number.parseInt(localStorage.getItem(STAR_KEY) || "0", 10);
        state.starsCollected = Number.isFinite(stars) ? stars : 0;
        state.unlockedPets = parseStoredJson(UNLOCKED_PETS_KEY, ["🐼"]);
        if (!Array.isArray(state.unlockedPets) || state.unlockedPets.length === 0) {
            state.unlockedPets = ["🐼"];
        }
        state.activePet = localStorage.getItem(ACTIVE_PET_KEY) || "🐼";
        if (!state.unlockedPets.includes(state.activePet)) {
            state.activePet = state.unlockedPets[0];
        }
    }

    function saveStars() {
        localStorage.setItem(STAR_KEY, String(state.starsCollected));
        if (dom.starCountEl) dom.starCountEl.textContent = String(state.starsCollected);
    }

    function savePets() {
        localStorage.setItem(UNLOCKED_PETS_KEY, JSON.stringify(state.unlockedPets));
        localStorage.setItem(ACTIVE_PET_KEY, state.activePet);
    }

    function operationLabel(operation) {
        return OPERATION_NAMES[operation] || "Times";
    }

    function syncMusicIcon() {
        if (!dom.musicToggleIcon || !dom.musicToggleBtn) return;
        dom.musicToggleIcon.classList.toggle("active", dom.musicToggleBtn.checked);
    }

    function syncPreviews() {
        if (dom.firstNumberPreview && dom.firstNumberInput) {
            dom.firstNumberPreview.textContent = dom.firstNumberInput.value;
        }

        if (dom.secondNumberPreview && dom.secondNumberInput) {
            dom.secondNumberPreview.textContent = dom.secondNumberInput.value;
        }

        if (dom.operationPreview && dom.selectOption) {
            dom.operationPreview.textContent = operationLabel(dom.selectOption.value);
        }

        if (dom.selectionSummary && dom.firstNumberInput && dom.secondNumberInput && dom.selectOption) {
            dom.selectionSummary.textContent =
                `Ready: ${dom.firstNumberInput.value} ${operationLabel(dom.selectOption.value)} up to ${dom.secondNumberInput.value}.`;
        }
    }

    function setStepDone(stepId, isDone) {
        const step = document.getElementById(stepId);
        if (!step) return;
        step.classList.toggle("step-done", isDone);
    }

    function setSelectedState(buttons, selectedValue, keyAttr) {
        buttons.forEach(button => {
            const value = button.getAttribute(keyAttr);
            const isSelected = value === String(selectedValue);
            button.classList.toggle("selected", isSelected);
            button.setAttribute("aria-pressed", isSelected ? "true" : "false");
        });
    }

    function setFirstNumber(value) {
        if (!dom.firstNumberInput) return;
        dom.firstNumberInput.value = String(value);
        setSelectedState($all("#numberGrid1 .number-bubble"), value, "data-value");
        setStepDone("step1", true);
        syncPreviews();
    }

    function setSecondNumber(value) {
        if (!dom.secondNumberInput) return;
        dom.secondNumberInput.value = String(value);
        setSelectedState($all("#numberGrid2 .number-bubble"), value, "data-value");
        setStepDone("step3", true);
        syncPreviews();
    }

    function setOperation(value) {
        if (!dom.selectOption) return;
        dom.selectOption.value = value;
        setSelectedState($all(".operation-card"), value, "data-op");
        setStepDone("step2", true);
        syncPreviews();
    }

    function stopSpeech() {
        if (!audio.speech.paused) {
            audio.speech.pause();
            audio.speech.currentTime = 0;
        }
    }

    function numberToAudioFiles(numStr) {
        if (numStr === "") return [];
        const num = Number.parseFloat(numStr);
        if (Number.isNaN(num)) return [];

        const words = [];
        const numInt = Math.floor(num);

        if (numInt === 0) {
            words.push("0");
        } else if (numInt <= 20) {
            words.push(numInt.toString());
        } else if (numInt < 100) {
            const tens = Math.floor(numInt / 10) * 10;
            const ones = numInt % 10;
            words.push(tens.toString());
            if (ones > 0) words.push(ones.toString());
        } else {
            const hundreds = Math.floor(numInt / 100) * 100;
            const remainder = numInt % 100;
            words.push(hundreds.toString());

            if (remainder > 0) {
                if (remainder <= 20) {
                    words.push(remainder.toString());
                } else {
                    const tens = Math.floor(remainder / 10) * 10;
                    const ones = remainder % 10;
                    words.push(tens.toString());
                    if (ones > 0) words.push(ones.toString());
                }
            }
        }

        if (numStr.includes(".")) {
            words.push("point");
            const decimalPart = numStr.split(".")[1];
            for (const digit of decimalPart) words.push(digit);
        }

        return words;
    }

    function playAudioSequence(audioFiles, callback) {
        if (audioFiles.length === 0) {
            if (callback) callback();
            return;
        }

        const currentFile = audioFiles.shift();
        audio.speech.src = `voice/${currentFile}.mp3`;
        audio.speech.playbackRate = 1.2;

        audio.speech.onended = () => playAudioSequence(audioFiles, callback);
        audio.speech.onerror = () => {
            console.warn("Missing audio file:", currentFile);
            playAudioSequence(audioFiles, callback);
        };

        audio.speech.play().catch(err => {
            console.warn("Audio play blocked:", err);
            setTimeout(() => playAudioSequence(audioFiles, callback), 180);
        });
    }

    function speakEquation(rawFormula, callback) {
        stopSpeech();

        const tokens = rawFormula.split(" ");
        let audioFiles = [];

        for (const token of tokens) {
            if (token === "+") audioFiles.push("plus");
            else if (token === "-") audioFiles.push("minus");
            else if (token === "x" || token === "×" || token === "*") audioFiles.push("times");
            else if (token === "/" || token === "÷") audioFiles.push("divide");
            else if (token === "=") audioFiles.push("equals");
            else audioFiles = audioFiles.concat(numberToAudioFiles(token));
        }

        playAudioSequence(audioFiles, callback);
    }

    function renderTable() {
        const rows = Number.parseInt(dom.firstNumberInput?.value ?? "0", 10);
        const columns = Number.parseInt(dom.secondNumberInput?.value ?? "0", 10);
        const operation = dom.selectOption?.value ?? "multiply";

        if (!dom.resultDiv || !Number.isFinite(rows) || !Number.isFinite(columns)) return;

        const htmlBuffer = [];

        for (let row = 1; row <= rows; row += 1) {
            const lines = [];

            for (let column = 1; column <= columns; column += 1) {
                const equation = buildEquation(row, column, operation);
                lines.push(`<p data-equation="${equation.text}">${equation.display}</p>`);
            }

            htmlBuffer.push(
                `<div class="math-table-group">
                    <h3 class="table-title">Table of ${row}</h3>
                    <div class="table-group-content">${lines.join("")}</div>
                </div>`
            );
        }

        dom.resultDiv.innerHTML = htmlBuffer.join("");
    }

    function buildEquation(row, column, operation) {
        if (operation === "add") {
            return {
                text: `${row} + ${column} = ${row + column}`,
                display: `${row} + ${column} = ${row + column}`
            };
        }

        if (operation === "subtract") {
            const left = Math.max(row, column);
            const right = Math.min(row, column);
            return {
                text: `${left} - ${right} = ${left - right}`,
                display: `${left} - ${right} = ${left - right}`
            };
        }

        if (operation === "divide") {
            return {
                text: `${row} ÷ ${column} = ${(row / column).toFixed(1)}`,
                display: `${row} ÷ ${column} = ${(row / column).toFixed(1)}`
            };
        }

        return {
            text: `${row} × ${column} = ${row * column}`,
            display: `${row} × ${column} = ${row * column}`
        };
    }

    function launchConfetti() {
        const colors = ["#ff547d", "#4ecdc4", "#f2d74e", "#8b5a2b", "#ffffff"];
        for (let i = 0; i < 40; i += 1) {
            const confetti = document.createElement("div");
            confetti.classList.add("confetti");
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.animationDuration = `${Math.random() * 2 + 2}s`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            if (Math.random() > 0.5) confetti.style.borderRadius = "50%";
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 5000);
        }
    }

    function launchEmojiSpray() {
        const emojis = ["🎉", "🎊", "🌟", "🎈", "✨", "🎇", "💫", "🏆", "🥳", "🎆"];
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        for (let i = 0; i < 20; i += 1) {
            setTimeout(() => {
                const emoji = document.createElement("span");
                emoji.classList.add("emoji-spray");
                emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];

                const angle = Math.random() * Math.PI * 2;
                const distance = 150 + Math.random() * 250;

                emoji.style.left = `${centerX}px`;
                emoji.style.top = `${centerY}px`;
                emoji.style.setProperty("--spray-x", `${Math.cos(angle) * distance}px`);
                emoji.style.setProperty("--spray-y", `${Math.sin(angle) * distance}px`);

                document.body.appendChild(emoji);
                setTimeout(() => emoji.remove(), 1800);
            }, i * 60);
        }
    }

    function showCongratsPopup() {
        if (!dom.congratsPopup) return;
        dom.congratsPopup.classList.remove("hidden");
        setTimeout(() => dom.congratsPopup.classList.add("hidden"), 2500);
    }

    function showToast(message) {
        if (!dom.toastNotification) return;

        dom.toastNotification.textContent = message;
        dom.toastNotification.classList.remove("hidden");
        requestAnimationFrame(() => dom.toastNotification.classList.add("show"));

        if (state.toastTimeoutId) clearTimeout(state.toastTimeoutId);
        state.toastTimeoutId = setTimeout(() => {
            dom.toastNotification.classList.remove("show");
            setTimeout(() => dom.toastNotification.classList.add("hidden"), 240);
        }, 2600);
    }

    function animateStarToJar(clientX, clientY) {
        if (!dom.starJarContainer) return;

        const star = document.createElement("div");
        star.className = "flying-star";
        star.textContent = "⭐";
        star.style.left = `${clientX}px`;
        star.style.top = `${clientY}px`;

        const jarRect = dom.starJarContainer.getBoundingClientRect();
        const targetX = jarRect.left + jarRect.width / 2 - clientX;
        const targetY = jarRect.top + jarRect.height / 2 - clientY;

        star.style.setProperty("--target-x", `${targetX}px`);
        star.style.setProperty("--target-y", `${targetY}px`);

        document.body.appendChild(star);
        setTimeout(() => star.remove(), 800);
    }

    function checkGroupCompletion(pBlock) {
        const group = pBlock.closest(".math-table-group");
        if (!group) return;

        const allBlocks = $all("p", group);
        const allSolved = allBlocks.every(p => p.hasAttribute("data-quiz-solved") || p.hasAttribute("data-read"));

        if (!allSolved || group.hasAttribute("data-completed")) return;

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

    function updateShopUI() {
        $all(".shop-item").forEach(item => {
            const cost = Number.parseInt(item.getAttribute("data-cost") || "0", 10);
            const pet = item.getAttribute("data-pet") || "";
            const btn = $(".buy-pet-btn", item);

            if (!btn) return;

            item.classList.toggle("unlocked", state.unlockedPets.includes(pet));

            if (state.unlockedPets.includes(pet)) {
                btn.textContent = state.activePet === pet ? "Equipped" : "Equip";
                btn.disabled = false;
            } else if (state.starsCollected >= cost) {
                btn.disabled = false;
                btn.textContent = `Buy (${cost} ⭐)`;
            } else {
                btn.disabled = true;
                btn.textContent = `Need ${cost} ⭐`;
            }

            if (btn.dataset.bound === "true") return;
            btn.dataset.bound = "true";

            btn.addEventListener("click", () => {
                if (state.unlockedPets.includes(pet)) {
                    state.activePet = pet;
                    savePets();
                    if (dom.meadowPanda) dom.meadowPanda.textContent = pet;
                    updateShopUI();
                    return;
                }

                if (state.starsCollected < cost) {
                    showToast(`You need ${cost} stars to unlock ${pet}.`);
                    return;
                }

                state.starsCollected -= cost;
                state.unlockedPets.push(pet);
                state.activePet = pet;
                saveStars();
                savePets();

                if (dom.meadowPanda) dom.meadowPanda.textContent = pet;
                showToast(`${pet} unlocked!`);
                updateShopUI();
            });
        });
    }

    function updateSelectionSummary() {
        syncPreviews();
    }

    function setQuizMode(isEnabled) {
        state.quizMode = Boolean(isEnabled);
        if (dom.quizToggleIcon) {
            dom.quizToggleIcon.classList.toggle("active", state.quizMode);
        }
        if (dom.quizModeToggle) {
            dom.quizModeToggle.checked = state.quizMode;
        }
    }

    function createQuizChoices(pBlock) {
        const rawText = pBlock.getAttribute("data-equation") || pBlock.textContent || "";
        const parts = rawText.split("=");
        if (parts.length !== 2) return;

        const equation = `${parts[0].trim()} =`;
        const answer = Number.parseFloat(parts[1].trim());
        if (!Number.isFinite(answer)) return;

        const wrongAnswers = new Set();

        while (wrongAnswers.size < 2) {
            const offset = Math.floor(Math.random() * 8) + 1;
            const candidate = Math.max(0, answer + (Math.random() > 0.5 ? offset : -offset));
            if (candidate !== answer) wrongAnswers.add(candidate);
        }

        const options = [{ val: answer, correct: true }, ...Array.from(wrongAnswers).map(val => ({ val, correct: false }))];
        options.sort(() => Math.random() - 0.5);

        const buttonsHtml = `<span class="quiz-options">${
            options.map((opt, idx) => `<button class="quiz-btn" type="button" data-correct="${opt.correct}">${QUIZ_LABELS[idx]}) ${opt.val}</button>`).join("")
        }</span>`;

        pBlock.innerHTML = `${equation} ${buttonsHtml}`;
        pBlock.setAttribute("data-equation", rawText);
    }

    function checkQuizAnswer(button) {
        const pBlock = button.closest("p");
        if (!pBlock) return;

        if (pBlock.hasAttribute("data-locked")) {
            showToast("You already picked an answer.");
            return;
        }

        pBlock.setAttribute("data-locked", "true");

        const isCorrect = button.getAttribute("data-correct") === "true";
        const allBtns = $all(".quiz-btn", pBlock);

        allBtns.forEach(btn => {
            btn.disabled = true;
        });

        if (isCorrect) {
            button.classList.add("correct");
            pBlock.style.setProperty("background", "#86efac", "important");
            pBlock.style.setProperty("color", "#14532d", "important");
            pBlock.setAttribute("data-quiz-solved", "true");

            state.starsCollected += 1;
            saveStars();

            const rect = button.getBoundingClientRect();
            animateStarToJar(rect.left, rect.top);
        } else {
            button.classList.add("wrong");
            pBlock.style.setProperty("background", "#fca5a5", "important");
            pBlock.style.setProperty("color", "#7f1d1d", "important");
            pBlock.setAttribute("data-quiz-solved", "true");

            allBtns.forEach(btn => {
                if (btn.getAttribute("data-correct") === "true") {
                    btn.classList.add("correct-reveal");
                }
            });
        }

        checkGroupCompletion(pBlock);
    }

    function safePlayMusic() {
        if (!audio.music || state.musicExplicitlyMuted) return;

        state.musicShouldBePaused = false;
        audio.music.play().then(() => {
            if (state.musicShouldBePaused) {
                audio.music.pause();
                return;
            }

            state.ambientStarted = true;
            removeTriggerListeners();
            if (dom.musicToggleBtn) dom.musicToggleBtn.checked = true;
            syncMusicIcon();
        }).catch(err => {
            console.warn("Music play blocked:", err);
        });
    }

    function safePauseMusic(explicit = false) {
        if (!audio.music) return;
        state.musicShouldBePaused = true;
        if (explicit) state.musicExplicitlyMuted = true;
        audio.music.pause();

        if (explicit && dom.musicToggleBtn) {
            dom.musicToggleBtn.checked = false;
        }

        syncMusicIcon();
    }

    function removeTriggerListeners() {
        document.removeEventListener("mousemove", handleInteractionStart);
        document.removeEventListener("keydown", handleInteractionStart);
        document.removeEventListener("scroll", handleInteractionStart);
        document.removeEventListener("touchstart", handleInteractionStart);
        document.removeEventListener("click", handleInteractionStart);
        document.removeEventListener("mousedown", handleInteractionStart);
    }

    function startAmbientMusic() {
        if (!state.canStartMusic) return;
        if (state.isReading) return;

        if (!state.ambientStarted || audio.music.paused) {
            safePlayMusic();
        }
    }

    function handleInteractionStart() {
        if (state.canStartMusic) {
            startAmbientMusic();
        }
    }

    function setupMusic() {
        PLAYLIST.sort(() => Math.random() - 0.5);
        audio.music = new Audio(PLAYLIST[state.currentTrackIndex].file);
        audio.music.volume = 1.0;
        audio.music.preload = "auto";

        audio.music.onended = () => {
            state.currentTrackIndex = (state.currentTrackIndex + 1) % PLAYLIST.length;
            audio.music.src = PLAYLIST[state.currentTrackIndex].file;
            safePlayMusic();
        };
    }

    function openModal(modal) {
        if (!modal) return;
        modal.classList.remove("hidden");
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.add("hidden");
    }

    function togglePaintColor(btn) {
        const color = btn.getAttribute("data-color");
        if (btn.classList.contains("active")) {
            btn.classList.remove("active");
            window.activePaintColor = null;
            return;
        }

        $all(".color-btn").forEach(button => button.classList.remove("active"));
        btn.classList.add("active");
        window.activePaintColor = color;
    }

    function bindEvents() {
        if (dom.numberGrid1) {
            dom.numberGrid1.addEventListener("click", e => {
                const button = e.target.closest(".number-bubble");
                if (!button) return;
                setFirstNumber(button.getAttribute("data-value"));
            });
        }

        if (dom.numberGrid2) {
            dom.numberGrid2.addEventListener("click", e => {
                const button = e.target.closest(".number-bubble");
                if (!button) return;
                setSecondNumber(button.getAttribute("data-value"));
            });
        }

        $all(".operation-card").forEach(card => {
            card.addEventListener("click", () => {
                setOperation(card.getAttribute("data-op"));
            });
        });

        $all(".quick-access-btn").forEach(button => {
            button.addEventListener("click", () => {
                const firstValue = button.getAttribute("data-first") || "1";
                const secondValue = button.getAttribute("data-second") || "6";
                setFirstNumber(firstValue);
                setSecondNumber(secondValue);
                if (dom.mainContent) {
                    dom.mainContent.focus({ preventScroll: true });
                    dom.mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        });

        if (dom.guideBtn && dom.guideModal && dom.closeGuideBtn) {
            dom.guideBtn.addEventListener("click", () => openModal(dom.guideModal));
            dom.closeGuideBtn.addEventListener("click", () => closeModal(dom.guideModal));
        }

        if (dom.petShopBtn && dom.petShopModal && dom.closeShopBtn) {
            dom.petShopBtn.addEventListener("click", () => {
                updateShopUI();
                openModal(dom.petShopModal);
            });
            dom.closeShopBtn.addEventListener("click", () => closeModal(dom.petShopModal));
        }

        if (dom.quizToggleIcon && dom.quizModeToggle) {
            dom.quizToggleIcon.addEventListener("click", () => {
                setQuizMode(!dom.quizModeToggle.checked);
            });
        }

        if (dom.musicToggleIcon && dom.musicToggleBtn) {
            dom.musicToggleIcon.addEventListener("click", () => {
                dom.musicToggleBtn.checked = !dom.musicToggleBtn.checked;
                dom.musicToggleBtn.dispatchEvent(new Event("change"));
            });
        }

        if (dom.musicToggleBtn) {
            dom.musicToggleBtn.addEventListener("change", () => {
                if (dom.musicToggleBtn.checked) {
                    state.musicExplicitlyMuted = false;
                    if (!state.isReading) safePlayMusic();
                } else {
                    safePauseMusic(true);
                }
                syncMusicIcon();
            });
        }

        if (dom.guideModal) {
            dom.guideModal.addEventListener("click", e => {
                if (e.target === dom.guideModal) closeModal(dom.guideModal);
            });
        }

        if (dom.petShopModal) {
            dom.petShopModal.addEventListener("click", e => {
                if (e.target === dom.petShopModal) closeModal(dom.petShopModal);
            });
        }

        if (dom.congratsPopup) {
            dom.congratsPopup.addEventListener("click", e => {
                if (e.target === dom.congratsPopup) closeModal(dom.congratsPopup);
            });
        }

        const sunEl = $(".animated-sun");
        if (sunEl) {
            sunEl.addEventListener("click", () => {
                sunEl.textContent = sunEl.textContent === "🌞" ? "😎" : "🌞";
            });
        }

        const logoEl = $(".school-logo");
        let logoClicks = 0;
        if (logoEl) {
            logoEl.addEventListener("click", () => {
                logoClicks += 1;
                if (logoClicks >= 5) {
                    logoEl.classList.remove("flip-animation");
                    void logoEl.offsetWidth;
                    logoEl.classList.add("flip-animation");
                    logoClicks = 0;
                }
            });
        }

        window.activePaintColor = null;
        $all(".color-btn").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                togglePaintColor(btn);
            });
        });

        if (dom.btnClear) {
            dom.btnClear.addEventListener("click", () => {
                if (dom.resultDiv) dom.resultDiv.innerHTML = "";
                if (dom.resultsBox) dom.resultsBox.classList.remove("active");
                stopSpeech();
                state.harvestSeq += 1;
                state.isReading = false;
                safePlayMusic();
                const colorPickerUI = $("#colorPickerUI");
                if (colorPickerUI) colorPickerUI.classList.add("hidden");
            });
        }

        if (dom.btnPrint) {
            dom.btnPrint.addEventListener("click", () => {
                window.print();
            });
        }

        if (dom.btnGrow) {
            dom.btnGrow.addEventListener("click", e => {
                e.stopPropagation();

                state.quizMode = dom.quizModeToggle?.checked ?? state.quizMode;

                if (!audio.speech.src) {
                    audio.speech.src = "data:audio/mp3;base64,//OQxAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";
                    audio.speech.play().then(() => audio.speech.pause()).catch(() => {});
                }

                if (dom.resultDiv) dom.resultDiv.innerHTML = "";
                renderTable();

                const paragraphs = dom.resultDiv ? $all("p", dom.resultDiv) : [];

                if (state.quizMode) {
                    paragraphs.forEach(pBlock => createQuizChoices(pBlock));
                    $all(".quiz-btn", dom.resultDiv).forEach(btn => {
                        btn.addEventListener("click", event => {
                            event.stopPropagation();
                            checkQuizAnswer(btn);
                        });
                    });
                } else {
                    paragraphs.forEach(pBlock => {
                        pBlock.classList.remove("quiz-hidden");
                        pBlock.removeAttribute("data-locked");
                        pBlock.removeAttribute("data-quiz-solved");
                    });
                }

                if (dom.resultsBox) dom.resultsBox.classList.add("active");
                const colorPickerUI = $("#colorPickerUI");
                if (colorPickerUI) colorPickerUI.classList.remove("hidden");

                if (paragraphs.length === 0) {
                    startAmbientMusic();
                    return;
                }

                showCongratsPopup();
                launchEmojiSpray();

                state.isReading = true;
                stopSpeech();
                safePauseMusic();

                state.harvestSeq += 1;
                const currentSeqId = state.harvestSeq;
                let currentIndex = 0;

                setTimeout(() => {
                    dom.resultsBox?.scrollIntoView({ behavior: "smooth", block: "start" });

                    if (state.quizMode) {
                        state.isReading = false;
                        safePlayMusic();
                        return;
                    }

                    const speakNext = () => {
                        if (currentSeqId !== state.harvestSeq) return;
                        if (currentIndex >= paragraphs.length) return;

                        const pBlock = paragraphs[currentIndex];
                        currentIndex += 1;

                        const equation = pBlock.getAttribute("data-equation") || pBlock.innerText;
                        const isLast = currentIndex === paragraphs.length;

                        speakEquation(
                            equation,
                            isLast
                                ? () => {
                                    if (currentSeqId !== state.harvestSeq) return;
                                    state.isReading = false;
                                    launchConfetti();
                                    safePlayMusic();
                                }
                                : speakNext
                        );
                    };

                    speakNext();
                }, 1800);
            });
        }

        if (dom.resultDiv) {
            dom.resultDiv.addEventListener("click", e => {
                const pBlock = e.target.closest("p");
                if (!pBlock) return;
                if (e.target.closest(".quiz-btn")) return;

                e.stopPropagation();

                const hasInput = pBlock.querySelector("input");

                if (!hasInput && !pBlock.hasAttribute("data-read")) {
                    state.starsCollected += 1;
                    saveStars();
                    animateStarToJar(e.clientX, e.clientY);
                }

                pBlock.setAttribute("data-read", "true");

                if (window.activePaintColor) {
                    pBlock.style.setProperty("background", window.activePaintColor, "important");
                }

                if (!hasInput) checkGroupCompletion(pBlock);

                stopSpeech();
                state.harvestSeq += 1;

                audio.music.volume = 0.3;
                state.isReading = true;

                const equation = pBlock.getAttribute("data-equation") || pBlock.innerText;
                speakEquation(equation, () => {
                    state.isReading = false;
                    audio.music.volume = 1.0;
                });

                const sparks = ["⭐", "✨", "🌸", "🎈", "🍬", "🍀"];
                const particle = document.createElement("span");
                particle.className = "click-particle";
                particle.textContent = sparks[Math.floor(Math.random() * sparks.length)];

                const rect = pBlock.getBoundingClientRect();
                particle.style.left = `${e.clientX - rect.left}px`;
                particle.style.top = `${e.clientY - rect.top}px`;

                pBlock.appendChild(particle);
                setTimeout(() => particle.remove(), 600);
            });
        }

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                audio.music.pause();
                state.musicShouldBePaused = true;
                stopSpeech();
            } else if (state.ambientStarted && !state.isReading) {
                safePlayMusic();
            }
        });

        window.addEventListener("beforeunload", () => {
            audio.music.pause();
            audio.music.src = "";
            stopSpeech();
        });

        window.addEventListener("pagehide", () => {
            audio.music.pause();
            audio.music.src = "";
            stopSpeech();
        });

        document.addEventListener("mousemove", handleInteractionStart);
        document.addEventListener("keydown", handleInteractionStart);
        document.addEventListener("scroll", handleInteractionStart);
        document.addEventListener("touchstart", handleInteractionStart);
        document.addEventListener("click", handleInteractionStart);
        document.addEventListener("mousedown", handleInteractionStart);
    }

    function boot() {
        loadState();

        dom.loadingScreen = $("#loadingScreen");
        dom.btnGrow = $("#btnGrow");
        dom.resultsBox = $("#resultsBox");
        dom.resultDiv = $("#result");
        dom.firstNumberInput = $("#firstNumber");
        dom.secondNumberInput = $("#secondNumber");
        dom.selectOption = $("#selectOption");
        dom.selectionSummary = $("#selectionSummary");
        dom.firstNumberPreview = $("#firstNumberPreview");
        dom.operationPreview = $("#operationPreview");
        dom.secondNumberPreview = $("#secondNumberPreview");
        dom.numberGrid1 = $("#numberGrid1");
        dom.numberGrid2 = $("#numberGrid2");
        dom.mainContent = $("#mainContent");
        dom.congratsPopup = $("#congratsPopup");
        dom.musicToggleBtn = $("#musicToggleBtn");
        dom.quizModeToggle = $("#quizModeToggle");
        dom.quizToggleIcon = $("#quizToggleIcon");
        dom.musicToggleIcon = $("#musicToggleIcon");
        dom.btnClear = $("#btnClear");
        dom.btnPrint = $("#btnPrint");
        dom.starCountEl = $("#starCount");
        dom.starJarContainer = $("#starJarContainer");
        dom.guideBtn = $("#guideBtn");
        dom.guideModal = $("#guideModal");
        dom.closeGuideBtn = $("#closeGuideBtn");
        dom.petShopBtn = $("#petShopBtn");
        dom.petShopModal = $("#petShopModal");
        dom.closeShopBtn = $("#closeShopBtn");
        dom.toastNotification = $("#toastNotification");
        dom.meadowPanda = $(".panda-bounce");

        if (dom.meadowPanda) dom.meadowPanda.textContent = state.activePet;
        if (dom.starCountEl) dom.starCountEl.textContent = String(state.starsCollected);
        if (dom.musicToggleBtn) dom.musicToggleBtn.checked = true;

        setupMusic();
        bindEvents();
        syncMusicIcon();
        updateShopUI();
        setQuizMode(dom.quizModeToggle?.checked ?? false);

        setFirstNumber(dom.firstNumberInput?.value || "1");
        setSecondNumber(dom.secondNumberInput?.value || "6");
        setOperation(dom.selectOption?.value || "multiply");
        updateSelectionSummary();

        window.addEventListener("load", () => {
            state.loaderTimeoutId = setTimeout(() => {
                if (dom.loadingScreen) dom.loadingScreen.classList.add("hidden");
                document.body.classList.add("loaded");
            }, 1200);

            setTimeout(() => {
                state.canStartMusic = true;
                startAmbientMusic();
            }, 2000);
        });
    }

    document.addEventListener("DOMContentLoaded", boot);
})();
