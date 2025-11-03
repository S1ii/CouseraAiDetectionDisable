// Background Service Worker для Coursera AI Instructions Remover
console.log('[Coursera AI Remover Background] Service worker started');

// Обработчик установки расширения
chrome.runtime.onInstalled.addListener((details) => {
    console.log('[Coursera AI Remover Background] Расширение установлено:', details.reason);
    
    // Устанавливаем настройки по умолчанию
    chrome.storage.sync.set({
        isEnabled: true,
        removeOnLoad: true,
        checkInterval: 3000,
        totalRemovedCount: 0,
        lastUpdate: new Date().toISOString()
    });

    // Показываем уведомление о готовности
    if (details.reason === 'install') {
        chrome.action.setBadgeText({text: 'ON'});
        chrome.action.setBadgeBackgroundColor({color: '#4CAF50'});
    } else if (details.reason === 'update') {
        // При обновлении проверяем, нужно ли мигрировать данные
        migrateStorageData();
    }
});

// Миграция данных при обновлении
function migrateStorageData() {
    chrome.storage.sync.get(['removedCount'], (result) => {
        if (chrome.runtime.lastError) {
            console.error('[Coursera AI Remover Background] Ошибка миграции данных:', chrome.runtime.lastError);
            return;
        }
        
        // Если есть старый счетчик, переносим его в новый формат
        if (result.removedCount && result.removedCount > 0) {
            chrome.storage.sync.get(['totalRemovedCount'], (totalResult) => {
                if (!totalResult.totalRemovedCount || totalResult.totalRemovedCount === 0) {
                    chrome.storage.sync.set({
                        totalRemovedCount: result.removedCount,
                        lastUpdate: new Date().toISOString()
                    }, () => {
                        console.log('[Coursera AI Remover Background] Данные успешно мигрированы');
                    });
                }
            });
        }
    });
}

// Обработчик клика на иконку расширения
chrome.action.onClicked.addListener((tab) => {
    if (tab.url && (tab.url.includes('coursera.org') || tab.url.includes('coursera') || tab.url.startsWith('file://'))) {
        // Переключаем состояние расширения
        chrome.storage.sync.get(['isEnabled'], (result) => {
            if (chrome.runtime.lastError) {
                console.error('[Coursera AI Remover Background] Ошибка получения настроек:', chrome.runtime.lastError);
                return;
            }
            
            const newState = !result.isEnabled;
            chrome.storage.sync.set({
                isEnabled: newState,
                lastUpdate: new Date().toISOString()
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error('[Coursera AI Remover Background] Ошибка сохранения настроек:', chrome.runtime.lastError);
                    return;
                }
                
                if (newState) {
                    chrome.action.setBadgeText({text: 'ON'});
                    chrome.action.setBadgeBackgroundColor({color: '#4CAF50'});
                    console.log('[Coursera AI Remover Background] Расширение включено');
                } else {
                    chrome.action.setBadgeText({text: 'OFF'});
                    chrome.action.setBadgeBackgroundColor({color: '#F44336'});
                    console.log('[Coursera AI Remover Background] Расширение отключено');
                }
            });
        });
    }
});

// Обработчик изменений настроек
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        if (changes.isEnabled) {
            const enabled = changes.isEnabled.newValue;
            if (enabled) {
                chrome.action.setBadgeText({text: 'ON'});
                chrome.action.setBadgeBackgroundColor({color: '#4CAF50'});
            } else {
                chrome.action.setBadgeText({text: 'OFF'});
                chrome.action.setBadgeBackgroundColor({color: '#F44336'});
            }
        }
        
        // Обновляем бейдж с количеством удаленных элементов
        if (changes.totalRemovedCount) {
            const count = changes.totalRemovedCount.newValue;
            if (count > 0) {
                // Показываем количество удаленных элементов, если оно не слишком большое
                if (count < 1000) {
                    chrome.action.setBadgeText({text: count.toString()});
                } else {
                    chrome.action.setBadgeText({text: '999+'});
                }
                chrome.action.setBadgeBackgroundColor({color: '#2196F3'});
            } else {
                // Если счетчик пуст, показываем статус расширения
                chrome.storage.sync.get(['isEnabled'], (result) => {
                    if (result.isEnabled) {
                        chrome.action.setBadgeText({text: 'ON'});
                        chrome.action.setBadgeBackgroundColor({color: '#4CAF50'});
                    } else {
                        chrome.action.setBadgeText({text: 'OFF'});
                        chrome.action.setBadgeBackgroundColor({color: '#F44336'});
                    }
                });
            }
        }
    }
});

// Обработчик сообщений от content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'getSettings') {
        chrome.storage.sync.get(['isEnabled', 'totalRemovedCount'], (result) => {
            if (chrome.runtime.lastError) {
                sendResponse({error: chrome.runtime.lastError.message});
                return;
            }
            sendResponse({
                isEnabled: result.isEnabled !== false,
                totalRemovedCount: result.totalRemovedCount || 0
            });
        });
        return true; // Асинхронный ответ
    }
    
    if (message.type === 'reportRemovedElements') {
        console.log(`[Coursera AI Remover Background] Удалено элементов: ${message.count}`);
        
        // Обновляем общий счетчик
        chrome.storage.sync.get(['totalRemovedCount'], (result) => {
            if (chrome.runtime.lastError) {
                sendResponse({error: chrome.runtime.lastError.message});
                return;
            }
            
            const currentCount = result.totalRemovedCount || 0;
            const newCount = currentCount + message.count;
            
            chrome.storage.sync.set({
                totalRemovedCount: newCount,
                lastUpdate: new Date().toISOString()
            }, () => {
                if (chrome.runtime.lastError) {
                    sendResponse({error: chrome.runtime.lastError.message});
                    return;
                }
                
                sendResponse({status: 'success', totalCount: newCount});
            });
        });
        
        return true; // Асинхронный ответ
    }
    
    if (message.type === 'countUpdated') {
        // Просто логируем обновление счетчика
        console.log(`[Coursera AI Remover Background] Счетчик обновлен: ${message.count}`);
        sendResponse({status: 'received'});
        return true;
    }
    
    if (message.type === 'resetCounter') {
        chrome.storage.sync.set({
            totalRemovedCount: 0,
            lastUpdate: new Date().toISOString()
        }, () => {
            if (chrome.runtime.lastError) {
                sendResponse({error: chrome.runtime.lastError.message});
                return;
            }
            
            console.log('[Coursera AI Remover Background] Счетчик сброшен');
            sendResponse({status: 'success'});
        });
        
        return true; // Асинхронный ответ
    }
});

// Периодическая проверка для активации на Coursera
setInterval(() => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0] && tabs[0].url &&
            (tabs[0].url.includes('coursera.org') || tabs[0].url.includes('coursera') || tabs[0].url.startsWith('file://'))) {
            
            chrome.storage.sync.get(['isEnabled', 'totalRemovedCount'], (result) => {
                if (chrome.runtime.lastError) {
                    console.error('[Coursera AI Remover Background] Ошибка получения настроек:', chrome.runtime.lastError);
                    return;
                }
                
                if (result.isEnabled) {
                    const count = result.totalRemovedCount || 0;
                    if (count > 0) {
                        if (count < 1000) {
                            chrome.action.setBadgeText({text: count.toString()});
                        } else {
                            chrome.action.setBadgeText({text: '999+'});
                        }
                        chrome.action.setBadgeBackgroundColor({color: '#2196F3'});
                    } else {
                        chrome.action.setBadgeText({text: 'ON'});
                        chrome.action.setBadgeBackgroundColor({color: '#4CAF50'});
                    }
                } else {
                    chrome.action.setBadgeText({text: 'OFF'});
                    chrome.action.setBadgeBackgroundColor({color: '#F44336'});
                }
            });
        }
    });
}, 1000);

// Обработчик запуска браузера
chrome.runtime.onStartup.addListener(() => {
    console.log('[Coursera AI Remover Background] Браузер запущен');
    
    // Проверяем целостность данных при запуске
    chrome.storage.sync.get(['totalRemovedCount'], (result) => {
        if (chrome.runtime.lastError) {
            console.error('[Coursera AI Remover Background] Ошибка при запуске:', chrome.runtime.lastError);
            return;
        }
        
        const count = result.totalRemovedCount || 0;
        console.log(`[Coursera AI Remover Background] Текущий счетчик: ${count}`);
    });
});

console.log('[Coursera AI Remover Background] Service worker инициализирован');