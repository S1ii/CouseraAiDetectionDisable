// Content Script для удаления AI-инструкций на Coursera
(function() {
    'use strict';

    // Селекторы для поиска целевых элементов
    const selectors = [
        '[data-ai-instructions="true"]',
        '[data-testid="content-integrity-instructions"]',
        '.css-ow46ga',
        '[class*="ai-instruction"]',
        '[class*="content-integrity"]'
    ];

    // Глобальные переменные для счетчика и синхронизации
    let totalRemovedCount = 0;
    let isEnabled = true;
    let broadcastChannel = null;
    let toastContainer = null;

    // Инициализация BroadcastChannel для синхронизации между окнами
    function initializeBroadcastChannel() {
        try {
            broadcastChannel = new BroadcastChannel('coursera-ai-remover-sync');
            
            broadcastChannel.onmessage = (event) => {
                if (event.data.type === 'countUpdated') {
                    updateTotalCount(event.data.count);
                }
            };
        } catch (error) {
            console.warn('[Coursera AI Remover] BroadcastChannel не поддерживается:', error);
        }
    }

    // Загрузка счетчика из хранилища
    function loadCounterFromStorage() {
        try {
            chrome.storage.sync.get(['totalRemovedCount', 'isEnabled'], (result) => {
                if (chrome.runtime.lastError) {
                    console.error('[Coursera AI Remover] Ошибка загрузки из хранилища:', chrome.runtime.lastError);
                    return;
                }
                
                totalRemovedCount = result.totalRemovedCount || 0;
                isEnabled = result.isEnabled !== false; // По умолчанию включено
                
                console.log(`[Coursera AI Remover] Загружен счетчик: ${totalRemovedCount}, статус: ${isEnabled ? 'включено' : 'отключено'}`);
            });
        } catch (error) {
            console.error('[Coursera AI Remover] Критическая ошибка при загрузке счетчика:', error);
        }
    }

    // Сохранение счетчика в хранилище
    function saveCounterToStorage(count) {
        try {
            chrome.storage.sync.set({
                totalRemovedCount: count,
                lastUpdate: new Date().toISOString()
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error('[Coursera AI Remover] Ошибка сохранения в хранилище:', chrome.runtime.lastError);
                    return;
                }
                
                // Рассылаем обновление в другие окна
                if (broadcastChannel) {
                    broadcastChannel.postMessage({
                        type: 'countUpdated',
                        count: count
                    });
                }
                
                console.log(`[Coursera AI Remover] Счетчик сохранен: ${count}`);
            });
        } catch (error) {
            console.error('[Coursera AI Remover] Критическая ошибка при сохранении счетчика:', error);
        }
    }

    // Обновление общего счетчика
    function updateTotalCount(newCount) {
        if (typeof newCount !== 'number' || newCount < 0) {
            console.warn('[Coursera AI Remover] Некорректное значение счетчика:', newCount);
            return;
        }
        
        totalRemovedCount = newCount;
        
        // Обновляем отображение в popup, если он открыт
        try {
            chrome.runtime.sendMessage({
                type: 'countUpdated',
                count: totalRemovedCount
            });
        } catch (error) {
            // Игнорируем ошибки, если popup не открыт
        }
    }

    // Создание контейнера для toast уведомлений
    function createToastContainer() {
        if (toastContainer) return;
        
        toastContainer = document.createElement('div');
        toastContainer.id = 'coursera-ai-remover-toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 999999;
            pointer-events: none;
        `;
        document.body.appendChild(toastContainer);
    }

    // Показать toast уведомление
    function showToast(message, type = 'success') {
        if (!toastContainer) {
            createToastContainer();
        }

        const toast = document.createElement('div');
        toast.className = `coursera-ai-remover-toast coursera-ai-remover-toast-${type}`;
        
        // Определяем иконку в зависимости от типа
        let icon = '✓';
        if (type === 'info') icon = 'ℹ';
        if (type === 'warning') icon = '⚠';
        if (type === 'error') icon = '✕';
        
        toast.innerHTML = `
            <div class="coursera-ai-remover-toast-icon">${icon}</div>
            <div class="coursera-ai-remover-toast-message">${message}</div>
            <button class="coursera-ai-remover-toast-close" aria-label="Закрыть">×</button>
        `;

        // Стили для toast
        toast.style.cssText = `
            display: flex;
            align-items: center;
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 10px;
            min-width: 300px;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            pointer-events: auto;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;

        // Стили для внутренних элементов
        const iconElement = toast.querySelector('.coursera-ai-remover-toast-icon');
        const messageElement = toast.querySelector('.coursera-ai-remover-toast-message');
        const closeBtn = toast.querySelector('.coursera-ai-remover-toast-close');

        if (iconElement) {
            iconElement.style.cssText = `
                margin-right: 10px;
                font-size: 16px;
                font-weight: bold;
                flex-shrink: 0;
            `;
        }

        if (messageElement) {
            messageElement.style.cssText = `
                flex-grow: 1;
            `;
        }

        if (closeBtn) {
            closeBtn.style.cssText = `
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                margin-left: 10px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s;
                flex-shrink: 0;
            `;
            
            closeBtn.addEventListener('mouseenter', () => {
                closeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            });
            
            closeBtn.addEventListener('mouseleave', () => {
                closeBtn.style.backgroundColor = 'transparent';
            });
        }

        // Добавляем toast в контейнер
        toastContainer.appendChild(toast);

        // Анимация появления
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);

        // Автоматическое скрытие через 5 секунд
        const autoHideTimeout = setTimeout(() => {
            hideToast(toast);
        }, 5000);

        // Обработчик закрытия
        const closeHandler = () => {
            clearTimeout(autoHideTimeout);
            hideToast(toast);
        };

        closeBtn.addEventListener('click', closeHandler);

        // Функция скрытия toast
        function hideToast(toastElement) {
            toastElement.style.opacity = '0';
            toastElement.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                if (toastElement.parentNode) {
                    toastElement.parentNode.removeChild(toastElement);
                }
            }, 300);
        }
    }

    // Функция удаления элементов с обновленным счетчиком
    function removeAITargets() {
        if (!isEnabled) {
            return 0;
        }

        let removedCount = 0;
        
        try {
            selectors.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        // Проверяем, что элемент действительно содержит AI-инструкции
                        if (element.hasAttribute('data-ai-instructions') || 
                            element.getAttribute('data-testid') === 'content-integrity-instructions' ||
                            element.textContent.toLowerCase().includes('ai instruction') ||
                            element.textContent.toLowerCase().includes('content integrity')) {
                            
                            // Удаляем элемент из DOM
                            element.remove();
                            removedCount++;
                            console.log(`[Coursera AI Remover] Удален элемент: ${selector}`);
                        }
                    });
                } catch (error) {
                    console.error(`[Coursera AI Remover] Ошибка при поиске ${selector}:`, error);
                }
            });

            // Дополнительный поиск по текстовому содержимому
            const allElements = document.querySelectorAll('*');
            allElements.forEach(element => {
                if (element.children.length === 0) { // Только текстовые узлы
                    const text = element.textContent.toLowerCase();
                    if ((text.includes('ai instruction') && text.includes('academic integrity')) ||
                        (text.includes('content integrity instruction'))) {
                        element.remove();
                        removedCount++;
                        console.log(`[Coursera AI Remover] Удален текстовый элемент с AI-инструкциями`);
                    }
                }
            });

            // Обновляем общий счетчик и показываем уведомление
            if (removedCount > 0) {
                const newTotal = totalRemovedCount + removedCount;
                updateTotalCount(newTotal);
                saveCounterToStorage(newTotal);
                
                // Показываем toast уведомление
                if (removedCount === 1) {
                    showToast(`Удален 1 элемент с AI-инструкциями`, 'success');
                } else if (removedCount <= 4) {
                    showToast(`Удалено ${removedCount} элемента с AI-инструкциями`, 'success');
                } else {
                    showToast(`Удалено ${removedCount} элементов с AI-инструкциями`, 'success');
                }
                
                console.log(`[Coursera AI Remover] Всего удалено элементов: ${removedCount}, общий счетчик: ${newTotal}`);
            }
        } catch (error) {
            console.error('[Coursera AI Remover] Ошибка при удалении элементов:', error);
            showToast('Произошла ошибка при удалении элементов', 'error');
        }
        
        return removedCount;
    }

    // Функция для наблюдения за изменениями DOM
    function setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            let shouldCheck = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Проверяем только новые узлы
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            shouldCheck = true;
                        }
                    });
                }
            });

            // Выполняем удаление, если есть изменения
            if (shouldCheck) {
                // Небольшая задержка для стабилизации DOM
                setTimeout(removeAITargets, 100);
            }
        });

        // Начинаем наблюдение
        observer.observe(document.body || document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-ai-instructions', 'data-testid']
        });

        console.log('[Coursera AI Remover] MutationObserver запущен');
    }

    // Обработчик сообщений от popup
    function setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'toggleExtension') {
                isEnabled = message.enabled;
                console.log(`[Coursera AI Remover] Расширение ${isEnabled ? 'включено' : 'отключено'}`);
                
                if (isEnabled) {
                    showToast('Расширение включено', 'info');
                    // Запускаем проверку при включении
                    setTimeout(removeAITargets, 500);
                } else {
                    showToast('Расширение отключено', 'warning');
                }
                
                sendResponse({status: 'success'});
                return true;
            }
            
            if (message.type === 'getStats') {
                sendResponse({
                    removedCount: totalRemovedCount,
                    isEnabled: isEnabled
                });
                return true;
            }
            
            if (message.type === 'resetCounter') {
                totalRemovedCount = 0;
                saveCounterToStorage(0);
                showToast('Счетчик сброшен', 'info');
                sendResponse({status: 'success'});
                return true;
            }
        });
    }

    // Функция инициализации
    function initialize() {
        console.log('[Coursera AI Remover] Инициализация...');
        
        // Инициализируем компоненты
        initializeBroadcastChannel();
        loadCounterFromStorage();
        setupMessageListener();
        createToastContainer();
        
        // Удаляем элементы при загрузке страницы
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(removeAITargets, 1000); // Задержка для полной загрузки страницы
            });
        } else {
            setTimeout(removeAITargets, 1000); // Задержка для полной загрузки страницы
        }

        // Настраиваем наблюдение за изменениями
        setupMutationObserver();

        // Периодическая проверка (резервный метод)
        setInterval(removeAITargets, 3000);

        // Показываем уведомление об активации
        setTimeout(() => {
            showToast('Расширение Coursera AI Remover активировано', 'info');
        }, 1500);

        console.log('[Coursera AI Remover] Расширение активировано');
    }

    // Запускаем инициализацию
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();