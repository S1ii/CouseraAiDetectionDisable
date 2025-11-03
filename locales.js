// Локализация для Coursera AI Remover
const i18n = {
    ru: {
        title: "Coursera AI Remover",
        loading: "Загрузка...",
        active: "Активно",
        disabled: "Отключено",
        disableRemoval: "Отключить удаление",
        enableRemoval: "Включить удаление",
        elementsRemoved: "элементов удалено",
        removeOnLoad: "Удаление при загрузке",
        statistics: "Статистика",
        reset: "Сбросить",
        resetConfirm: "Вы уверены, что хотите сбросить счетчик удаленных элементов?",
        language: "Язык",
        theme: "Тема",
        errorLoadingSettings: "Ошибка загрузки настроек",
        errorSavingSettings: "Ошибка сохранения настроек",
        errorResetCounter: "Ошибка сброса счетчика",
        version: "v2.0.0 - Coursera AI Instructions Remover"
    },
    en: {
        title: "Coursera AI Remover",
        loading: "Loading...",
        active: "Active",
        disabled: "Disabled",
        disableRemoval: "Disable Removal",
        enableRemoval: "Enable Removal",
        elementsRemoved: "elements removed",
        removeOnLoad: "Remove on Load",
        statistics: "Statistics",
        reset: "Reset",
        resetConfirm: "Are you sure you want to reset the removed elements counter?",
        language: "Language",
        theme: "Theme",
        errorLoadingSettings: "Error loading settings",
        errorSavingSettings: "Error saving settings",
        errorResetCounter: "Error resetting counter",
        version: "v2.0.0 - Coursera AI Instructions Remover"
    }
};

// Глобальная переменная для текущего языка
let currentLanguage = 'ru';

// Функция для получения текста на текущем языке
function getText(key) {
    // Проверяем, что язык установлен, иначе используем русский по умолчанию
    const lang = currentLanguage || 'ru';
    
    // Пытаемся получить перевод для текущего языка
    if (i18n[lang] && i18n[lang][key]) {
        return i18n[lang][key];
    }
    
    // Если перевод не найден, пробуем русский язык как fallback
    if (i18n.ru && i18n.ru[key]) {
        return i18n.ru[key];
    }
    
    // Если ничего не найдено, возвращаем ключ
    return key;
}

// Функция для установки текущего языка
function setLanguage(lang) {
    if (i18n[lang]) {
        currentLanguage = lang;
        return true;
    }
    return false;
}

// Функция для получения текущего языка
function getCurrentLanguage() {
    return currentLanguage;
}

// Делаем функции доступными глобально
window.getText = getText;
window.setLanguage = setLanguage;
window.getCurrentLanguage = getCurrentLanguage;
window.i18n = i18n;