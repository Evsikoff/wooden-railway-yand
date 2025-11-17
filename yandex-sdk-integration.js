// Интеграция с Yandex Games SDK
(function() {
    'use strict';

    let ysdk = null;

    // Инициализация SDK
    async function initYandexSDK() {
        try {
            // Проверяем, доступен ли YaGames
            if (typeof YaGames === 'undefined') {
                console.warn('YaGames SDK не загружен');
                return;
            }

            // Инициализируем SDK
            ysdk = await YaGames.init();
            console.log('Yandex Games SDK успешно инициализирован');

            // Проверяем язык
            if (ysdk.environment && ysdk.environment.i18n) {
                const lang = ysdk.environment.i18n.lang;
                console.log('Язык игры:', lang);

                if (lang === 'ru') {
                    console.log('Игра запущена на русском языке');
                } else {
                    console.warn('Игра запущена не на русском языке:', lang);
                }
            }

            // Устанавливаем наблюдатель за кнопкой "Начать строительство"
            setupStartButtonObserver();

            // Устанавливаем наблюдатели за модальными окнами
            setupModalObservers();

        } catch (error) {
            console.error('Ошибка инициализации Yandex Games SDK:', error);
        }
    }

    // Наблюдатель за появлением кнопки "Начать строительство"
    function setupStartButtonObserver() {
        const startButton = document.getElementById('preloader-start--btn');

        if (!startButton) {
            console.warn('Кнопка "Начать строительство" не найдена');
            return;
        }

        // Наблюдаем за родительским контейнером, чтобы отследить, когда кнопка становится видимой
        const preloaderStart = document.getElementById('preloader-start');

        if (!preloaderStart) {
            console.warn('Контейнер preloader-start не найден');
            return;
        }

        // Используем MutationObserver для отслеживания изменений класса
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    const isActive = preloaderStart.classList.contains('is-active');

                    if (isActive && ysdk) {
                        console.log('Кнопка "Начать строительство" стала видимой');

                        // Вызываем LoadingAPI.ready()
                        if (ysdk.features && ysdk.features.LoadingAPI) {
                            ysdk.features.LoadingAPI.ready();
                            console.log('✓ Вызван ysdk.features.LoadingAPI.ready()');
                        } else {
                            console.warn('LoadingAPI недоступен');
                        }

                        // Отключаем наблюдатель, так как событие произошло
                        observer.disconnect();
                    }
                }
            });
        });

        // Начинаем наблюдение
        observer.observe(preloaderStart, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Добавляем слушатель на клик по кнопке для вызова GameplayAPI.start()
        startButton.addEventListener('click', function() {
            console.log('Нажата кнопка "Начать строительство"');
            callGameplayStart();
        });
    }

    // Настройка наблюдателей за модальными окнами
    function setupModalObservers() {
        // Модальное окно с настройками
        setupModalObserver('component--settings', 'Настройки');

        // Модальное окно с обучением (tooltips)
        setupModalObserver('component--toolTip', 'Обучение');

        // Модальное окно с фотографией (snapshot)
        setupModalObserver('component--snapshot', 'Фотография');

        // Также наблюдаем за кнопками закрытия
        setupCloseButtonListeners();
    }

    // Универсальная функция для наблюдения за модальным окном
    function setupModalObserver(modalId, modalName) {
        const modal = document.getElementById(modalId);

        if (!modal) {
            console.warn(`Модальное окно "${modalName}" (${modalId}) не найдено`);
            return;
        }

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    const isActive = modal.classList.contains('is-active');

                    if (isActive) {
                        console.log(`Открыто модальное окно: ${modalName}`);
                        callGameplayStop();
                    }
                }
            });
        });

        observer.observe(modal, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    // Настройка слушателей для кнопок закрытия модальных окон
    function setupCloseButtonListeners() {
        // Кнопка закрытия настроек
        const settingsCloseBtn = document.getElementById('settings-close-btn');
        if (settingsCloseBtn) {
            settingsCloseBtn.addEventListener('click', function() {
                console.log('Закрыто модальное окно: Настройки');
                callGameplayStart();
            });
        }

        // Кнопка закрытия snapshot (фотография)
        // Snapshot закрывается при клике на любую область вне изображения
        const snapshotComponent = document.getElementById('component--snapshot');
        if (snapshotComponent) {
            snapshotComponent.addEventListener('click', function(e) {
                // Проверяем, был ли клик по фону
                if (e.target === snapshotComponent || e.target.classList.contains('snapshot-background')) {
                    console.log('Закрыто модальное окно: Фотография');
                    callGameplayStart();
                }
            });
        }

        // Кнопка "Начать" в обучении (tooltips)
        const tooltipBtns = document.querySelectorAll('#component--toolTip .btn');
        tooltipBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                // Проверяем, завершено ли обучение
                setTimeout(function() {
                    const tooltipComponent = document.getElementById('component--toolTip');
                    if (tooltipComponent && !tooltipComponent.classList.contains('is-active')) {
                        console.log('Закрыто модальное окно: Обучение');
                        callGameplayStart();
                    }
                }, 300);
            });
        });

        // Кнопка "Пропустить" в обучении
        const skipBtn = document.querySelector('.toolTips-skip');
        if (skipBtn) {
            skipBtn.addEventListener('click', function() {
                console.log('Закрыто модальное окно: Обучение (пропущено)');
                callGameplayStart();
            });
        }
    }

    // Вызов GameplayAPI.start()
    function callGameplayStart() {
        if (ysdk && ysdk.features && ysdk.features.GameplayAPI) {
            ysdk.features.GameplayAPI.start();
            console.log('✓ Вызван ysdk.features.GameplayAPI.start()');
        } else {
            console.warn('GameplayAPI недоступен');
        }
    }

    // Вызов GameplayAPI.stop()
    function callGameplayStop() {
        if (ysdk && ysdk.features && ysdk.features.GameplayAPI) {
            ysdk.features.GameplayAPI.stop();
            console.log('✓ Вызван ysdk.features.GameplayAPI.stop()');
        } else {
            console.warn('GameplayAPI недоступен');
        }
    }

    // Инициализация при загрузке страницы
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initYandexSDK);
    } else {
        initYandexSDK();
    }
})();
