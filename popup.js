// Popup JavaScript для Coursera AI Remover
document.addEventListener('DOMContentLoaded', function() {
    const statusDiv = document.getElementById('status');
    const statusText = document.getElementById('status-text');
    const toggleButton = document.getElementById('toggle');
    const removeOnLoadCheckbox = document.getElementById('removeOnLoad');
    const removedCountSpan = document.getElementById('removed-count');
    const resetButton = document.getElementById('reset-counter');
    const langOptions = document.querySelectorAll('.lang-option');
    
    let isEnabled = true;
    let removedCount = 0;
    let currentLanguage = 'ru';
    let isInitialized = false;

    // Функция для обновления текста на странице в соответствии с текущим языком
    function updateLanguage() {
        if (!window.getText) return; // Проверяем, что locales.js загружен
        
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = getText(key);
        });
        
        // Обновляем формат числа в соответствии с языком
        if (removedCountSpan) {
            removedCountSpan.textContent = removedCount.toLocaleString(currentLanguage === 'ru' ? 'ru-RU' : 'en-US');
        }
    }

    // Загрузка настроек
    function loadSettings() {
        chrome.storage.sync.get(['isEnabled', 'removeOnLoad', 'totalRemovedCount', 'language'], (result) => {
            if (chrome.runtime.lastError) {
                // Устанавливаем значения по умолчанию при ошибке
                isEnabled = true;
                removeOnLoadCheckbox.checked = false;
                removedCount = 0;
                currentLanguage = 'ru';
            } else {
                isEnabled = result.isEnabled !== false; // По умолчанию включено
                removeOnLoadCheckbox.checked = result.removeOnLoad !== false;
                removedCount = result.totalRemovedCount || 0;
                currentLanguage = result.language || 'ru';
                
                // Устанавливаем язык через функцию из locales.js
                if (window.setLanguage) {
                    window.setLanguage(currentLanguage);
                }
            }
            
            // Применяем язык
            updateLanguage();
            
            // Обновляем активный язык в переключателе
            langOptions.forEach(option => {
                option.classList.remove('active');
                if (option.getAttribute('data-lang') === currentLanguage) {
                    option.classList.add('active');
                }
            });
            
            // Помечаем, что инициализация завершена
            isInitialized = true;
            
            // Обновляем интерфейс
            updateUI();
            
            // Получаем статистику от content script после инициализации
            setTimeout(getStatsFromContentScript, 300);
        });
    }

    // Показать ошибку
    function showError(message) {
        if (statusDiv && statusText) {
            statusDiv.className = 'status error';
            statusText.textContent = message;
        }
    }

    // Обновление интерфейса
    function updateUI() {
        if (!isInitialized) return; // Не обновляем интерфейс до полной инициализации
        
        if (statusDiv && statusText) {
            if (isEnabled) {
                statusDiv.className = 'status enabled';
                statusText.textContent = window.getText ? getText('active') : 'Активно';
                if (toggleButton) toggleButton.textContent = window.getText ? getText('disableRemoval') : 'Отключить удаление';
            } else {
                statusDiv.className = 'status disabled';
                statusText.textContent = window.getText ? getText('disabled') : 'Отключено';
                if (toggleButton) toggleButton.textContent = window.getText ? getText('enableRemoval') : 'Включить удаление';
            }
        }
        
        // Форматируем число с разделителями
        if (removedCountSpan) {
            removedCountSpan.textContent = removedCount.toLocaleString(currentLanguage === 'ru' ? 'ru-RU' : 'en-US');
        }
    }

    // Переключение состояния
    function toggleExtension() {
        isEnabled = !isEnabled;
        
        chrome.storage.sync.set({
            isEnabled: isEnabled
        }, () => {
            if (chrome.runtime.lastError) {
                showError(window.getText ? getText('errorSavingSettings') : 'Ошибка сохранения настроек');
                return;
            }
        });
        
        // Отправляем сообщение в content script
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0] && (tabs[0].url.includes('coursera.org') || tabs[0].url.includes('coursera') || tabs[0].url.startsWith('file://'))) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'toggleExtension',
                    enabled: isEnabled
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.log('[Coursera AI Remover Popup] Content script не отвечает:', chrome.runtime.lastError.message);
                    }
                });
            }
        });
        
        updateUI();
    }

    // Сброс счетчика
    function resetCounter() {
        const confirmMessage = window.getText ? getText('resetConfirm') : 'Вы уверены, что хотите сбросить счетчик удаленных элементов?';
        if (confirm(confirmMessage)) {
            chrome.storage.sync.set({
                totalRemovedCount: 0
            }, () => {
                if (chrome.runtime.lastError) {
                    showError(window.getText ? getText('errorResetCounter') : 'Ошибка сброса счетчика');
                    return;
                }
                
                removedCount = 0;
                updateUI();
                
                // Отправляем сообщение в content script
                chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                    if (tabs[0] && (tabs[0].url.includes('coursera.org') || tabs[0].url.includes('coursera') || tabs[0].url.startsWith('file://'))) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            type: 'resetCounter'
                        }, (response) => {
                            if (chrome.runtime.lastError) {
                                console.log('[Coursera AI Remover Popup] Content script не отвечает:', chrome.runtime.lastError.message);
                            }
                        });
                    }
                });
            });
        }
    }

    // Обновление настроек удаления при загрузке
    function updateRemoveOnLoad() {
        chrome.storage.sync.set({
            removeOnLoad: removeOnLoadCheckbox.checked
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('[Coursera AI Remover Popup] Ошибка сохранения настроек:', chrome.runtime.lastError);
            }
        });
    }

    // Переключение языка
    function switchLanguage(lang) {
        if (lang === currentLanguage) return;
        
        // Устанавливаем язык через функцию из locales.js
        if (window.setLanguage) {
            window.setLanguage(lang);
        }
        
        currentLanguage = lang;
        
        // Обновляем активный язык в переключателе
        langOptions.forEach(option => {
            option.classList.remove('active');
            if (option.getAttribute('data-lang') === lang) {
                option.classList.add('active');
            }
        });
        
        // Обновляем текст на странице
        updateLanguage();
        
        // Сохраняем выбранный язык
        chrome.storage.sync.set({
            language: lang
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('[Coursera AI Remover Popup] Ошибка сохранения языка:', chrome.runtime.lastError);
            }
        });
    }

    // Получение статистики от content script
    function getStatsFromContentScript() {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0] && (tabs[0].url.includes('coursera.org') || tabs[0].url.includes('coursera') || tabs[0].url.startsWith('file://'))) {
                chrome.tabs.sendMessage(tabs[0].id, {type: 'getStats'}, (response) => {
                    if (chrome.runtime.lastError) {
                        console.log('[Coursera AI Remover Popup] Content script не отвечает:', chrome.runtime.lastError.message);
                        return;
                    }
                    
                    if (response) {
                        if (response.removedCount !== undefined) {
                            removedCount = response.removedCount;
                            updateUI();
                        }
                        
                        if (response.isEnabled !== undefined) {
                            isEnabled = response.isEnabled;
                            updateUI();
                        }
                    }
                });
            }
        });
    }

    // Обработчики событий
    if (toggleButton) toggleButton.addEventListener('click', toggleExtension);
    if (removeOnLoadCheckbox) removeOnLoadCheckbox.addEventListener('change', updateRemoveOnLoad);
    
    if (resetButton) {
        resetButton.addEventListener('click', resetCounter);
    }
    
    // Обработчики для переключения языка
    langOptions.forEach(option => {
        option.addEventListener('click', () => {
            switchLanguage(option.getAttribute('data-lang'));
        });
    });

    // Слушатель изменений в хранилище
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync') {
            let needsUpdate = false;
            
            if (changes.totalRemovedCount) {
                removedCount = changes.totalRemovedCount.newValue || 0;
                needsUpdate = true;
            }
            
            if (changes.isEnabled) {
                isEnabled = changes.isEnabled.newValue;
                needsUpdate = true;
            }
            
            if (changes.language) {
                currentLanguage = changes.language.newValue || 'ru';
                
                // Устанавливаем язык через функцию из locales.js
                if (window.setLanguage) {
                    window.setLanguage(currentLanguage);
                }
                
                updateLanguage();
                
                // Обновляем активный язык в переключателе
                langOptions.forEach(option => {
                    option.classList.remove('active');
                    if (option.getAttribute('data-lang') === currentLanguage) {
                        option.classList.add('active');
                    }
                });
            }
            
            if (needsUpdate) {
                updateUI();
            }
        }
    });

    // Слушатель сообщений от content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'countUpdated') {
            removedCount = message.count;
            updateUI();
        }
    });

    // Загружаем настройки при инициализации
    loadSettings();
});