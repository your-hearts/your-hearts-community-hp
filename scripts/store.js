import { defaultData } from "./site-data.js?v=school-name-update";

const STORAGE_KEY = "your-hearts-community-content-v2";

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return normalize(clone(defaultData));

  try {
    return normalize(mergeData(clone(defaultData), JSON.parse(saved)));
  } catch (error) {
    console.warn("Saved content could not be parsed.", error);
    return normalize(clone(defaultData));
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData() {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportData(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "your-hearts-content.json";
  link.click();
  URL.revokeObjectURL(url);
}

export function importFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function mergeData(base, saved) {
  if (Array.isArray(base)) return Array.isArray(saved) ? saved : base;
  if (!isObject(base) || !isObject(saved)) return saved ?? base;

  return Object.entries(base).reduce((next, [key, value]) => {
    next[key] = key in saved ? mergeData(value, saved[key]) : value;
    return next;
  }, { ...saved });
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalize(data) {
  if (data.brand?.logo === "assets/logo-your-hearts.svg") {
    data.brand.logo = "assets/your-hearts-logo.webp";
  }
  if (data.brand && !("xUrl" in data.brand)) {
    data.brand.xUrl = "https://x.com/";
  }
  data.seo = data.seo || clone(defaultData.seo);
  for (const [key, value] of Object.entries(defaultData.seo)) {
    data.seo[key] = data.seo[key] || clone(value);
    data.seo[key].description = data.seo[key].description || value.description;
  }
  return data;
}
