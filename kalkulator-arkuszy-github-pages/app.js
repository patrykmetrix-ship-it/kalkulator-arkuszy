const MATERIALS = {
  czarna: { label: "Blacha czarna", factor: 8 },
  nierdzewka: { label: "Nierdzewka", factor: 8 },
  "ocynk-alucynk": { label: "Ocynk / alucynk", factor: 8 },
  miedz: { label: "Miedź", factor: 9 },
  aluminium: { label: "Aluminium", factor: 2.7 },
};

const FORMATS = {
  small: { label: "Mały", widthMm: 1000, lengthMm: 2000 },
  medium: { label: "Średni", widthMm: 1250, lengthMm: 2500 },
  xlarge: { label: "Xduży", widthMm: 1500, lengthMm: 3000 },
};

const state = {
  mode: "kg-to-sheets",
};

const elements = {
  modeButtons: [...document.querySelectorAll(".mode-button")],
  weightField: document.querySelector("#weight-field"),
  sheetCountField: document.querySelector("#sheet-count-field"),
  weight: document.querySelector("#weight"),
  sheetCount: document.querySelector("#sheet-count"),
  material: document.querySelector("#material"),
  thickness: document.querySelector("#thickness"),
  formatInputs: [...document.querySelectorAll('input[name="format"]')],
  customSize: document.querySelector("#custom-size"),
  customWidth: document.querySelector("#custom-width"),
  customLength: document.querySelector("#custom-length"),
  resultPanel: document.querySelector(".result-panel"),
  resultLabel: document.querySelector("#result-label"),
  resultMain: document.querySelector("#result-main"),
  resultSecondary: document.querySelector("#result-secondary"),
};

function parsePositiveNumber(value) {
  const normalized = String(value).trim().replace(",", ".");
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function formatNumber(value, digits = 2) {
  return new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function getSelectedFormat() {
  const selected = elements.formatInputs.find((input) => input.checked)?.value ?? "medium";

  if (selected !== "custom") {
    return {
      ...FORMATS[selected],
      isCustom: false,
    };
  }

  const widthMm = parsePositiveNumber(elements.customWidth.value);
  const lengthMm = parsePositiveNumber(elements.customLength.value);

  if (!widthMm || !lengthMm) {
    return {
      isCustom: true,
      error: "Wpisz szerokość i długość własnego formatu.",
    };
  }

  return {
    label: "Własny",
    widthMm,
    lengthMm,
    isCustom: true,
  };
}

function getInputs() {
  const material = MATERIALS[elements.material.value];
  const thickness = parsePositiveNumber(elements.thickness.value);
  const format = getSelectedFormat();

  if (!thickness) {
    return { error: "Wpisz grubość blachy większą od zera." };
  }

  if (format.error) {
    return { error: format.error };
  }

  return {
    material,
    thickness,
    format,
  };
}

function calculateSheetWeightKg({ material, thickness, format }) {
  const widthM = format.widthMm / 1000;
  const lengthM = format.lengthMm / 1000;
  return thickness * widthM * lengthM * material.factor;
}

function showMessage(message, secondary = "Uzupełnij pola, a wynik pojawi się automatycznie.") {
  elements.resultPanel.classList.add("has-warning");
  elements.resultLabel.textContent = "Brakuje danych";
  elements.resultMain.textContent = message;
  elements.resultSecondary.textContent = secondary;
}

function showEmpty() {
  elements.resultPanel.classList.remove("has-warning");
  elements.resultLabel.textContent = "Wynik";
  elements.resultMain.textContent = "Wpisz dane";
  elements.resultSecondary.textContent = "Przykład: 2 mm, blacha czarna, 1250 x 2500 mm = 50 kg / ark.";
}

function showResult(main, secondary) {
  elements.resultPanel.classList.remove("has-warning");
  elements.resultLabel.textContent = "Wynik";
  elements.resultMain.textContent = main;
  elements.resultSecondary.textContent = secondary;
}

function calculate() {
  const selectedFormat = elements.formatInputs.find((input) => input.checked)?.value ?? "medium";
  const primaryValue = state.mode === "kg-to-sheets" ? elements.weight.value : elements.sheetCount.value;
  const hasCustomSizeInput =
    selectedFormat === "custom" && (elements.customWidth.value.trim() || elements.customLength.value.trim());
  const hasAnyInput = Boolean(primaryValue.trim() || elements.thickness.value.trim() || hasCustomSizeInput);

  if (!hasAnyInput) {
    showEmpty();
    return;
  }

  const inputs = getInputs();

  if (inputs.error) {
    showMessage(inputs.error);
    return;
  }

  const sheetWeightKg = calculateSheetWeightKg(inputs);
  const sizeText = `${formatNumber(inputs.format.widthMm, 0)} x ${formatNumber(inputs.format.lengthMm, 0)} mm`;
  const detailText = `${inputs.material.label}, ${formatNumber(inputs.thickness)} mm, ${sizeText}: ${formatNumber(sheetWeightKg)} kg / ark.`;

  if (state.mode === "kg-to-sheets") {
    const weight = parsePositiveNumber(elements.weight.value);

    if (!weight) {
      showMessage("Wpisz wagę do przeliczenia.");
      return;
    }

    const exactSheets = weight / sheetWeightKg;
    const fullSheets = Math.ceil(exactSheets);

    showResult(
      `${formatNumber(exactSheets)} ark. (${fullSheets} pełne)`,
      `${formatNumber(weight)} kg / ${formatNumber(sheetWeightKg)} kg na arkusz. ${detailText}`
    );
    return;
  }

  const sheetCount = parsePositiveNumber(elements.sheetCount.value);

  if (!sheetCount) {
    showMessage("Wpisz liczbę arkuszy.");
    return;
  }

  const totalWeight = sheetCount * sheetWeightKg;

  showResult(
    `${formatNumber(totalWeight)} kg`,
    `${formatNumber(sheetCount)} ark. x ${formatNumber(sheetWeightKg)} kg na arkusz. ${detailText}`
  );
}

function setMode(nextMode) {
  state.mode = nextMode;

  elements.modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === nextMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const isKgToSheets = nextMode === "kg-to-sheets";
  elements.weightField.classList.toggle("is-hidden", !isKgToSheets);
  elements.sheetCountField.classList.toggle("is-hidden", isKgToSheets);
  calculate();
}

function syncCustomSizeVisibility() {
  const selected = elements.formatInputs.find((input) => input.checked)?.value;
  elements.customSize.hidden = selected !== "custom";
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {
      // Aplikacja nadal działa online, nawet jeśli przeglądarka blokuje service worker.
    });
  });
}

elements.modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

[
  elements.weight,
  elements.sheetCount,
  elements.material,
  elements.thickness,
  elements.customWidth,
  elements.customLength,
  ...elements.formatInputs,
].forEach((control) => {
  control.addEventListener("input", () => {
    syncCustomSizeVisibility();
    calculate();
  });
  control.addEventListener("change", () => {
    syncCustomSizeVisibility();
    calculate();
  });
});

syncCustomSizeVisibility();
setMode(state.mode);
registerServiceWorker();
