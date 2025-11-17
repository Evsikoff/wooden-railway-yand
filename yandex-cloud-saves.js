// Модуль для работы с сохранениями игрового прогресса в Yandex Cloud и localStorage
(function() {
    'use strict';

    // Ключ для localStorage
    const STORAGE_KEY = 'gameProgress';

    // Глобальный объект для управления сохранениями
    window.GameProgressManager = {
        ysdk: null,
        player: null,

        // Инициализация менеджера прогресса
        async init(ysdkInstance) {
            this.ysdk = ysdkInstance;

            if (this.ysdk) {
                try {
                    // Получаем объект игрока
                    this.player = await this.ysdk.getPlayer();
                    console.log('✓ GameProgressManager: Игрок успешно инициализирован');
                } catch (error) {
                    console.error('✗ GameProgressManager: Ошибка получения игрока:', error);
                }
            } else {
                console.warn('⚠ GameProgressManager: Yandex SDK недоступен, будет использоваться только localStorage');
            }
        },

        // Загрузка прогресса игры
        async loadGameProgress() {
            console.log('→ Начинаем загрузку прогресса игрока...');

            let cloudData = null;
            let localData = null;

            // Шаг 1: Попытка загрузки из Яндекс Облака
            if (this.player) {
                try {
                    console.log('→ Попытка загрузить данные из Яндекс Облака...');
                    cloudData = await this.player.getData();

                    if (cloudData && Object.keys(cloudData).length > 0) {
                        console.log('✓ Данные успешно загружены из Яндекс Облака:', cloudData);

                        // Если данные из облака получены, используем их
                        if (cloudData[STORAGE_KEY]) {
                            console.log('✓ Прогресс игрока найден в Яндекс Облаке');
                            return cloudData[STORAGE_KEY];
                        } else {
                            console.log('ℹ Яндекс Облако не содержит сохраненного прогресса');
                        }
                    } else {
                        console.log('ℹ Яндекс Облако пусто, данных нет');
                    }
                } catch (error) {
                    console.error('✗ Ошибка при загрузке данных из Яндекс Облака:', error);
                }
            } else {
                console.warn('⚠ Player API недоступен, пропускаем загрузку из Яндекс Облака');
            }

            // Шаг 2: Попытка загрузки из localStorage
            try {
                console.log('→ Попытка загрузить данные из localStorage...');
                const localStorageData = localStorage.getItem(STORAGE_KEY);

                if (localStorageData) {
                    localData = JSON.parse(localStorageData);
                    console.log('✓ Данные успешно загружены из localStorage:', localData);
                    return localData;
                } else {
                    console.log('ℹ localStorage не содержит сохраненного прогресса');
                }
            } catch (error) {
                console.error('✗ Ошибка при загрузке данных из localStorage:', error);
            }

            // Шаг 3: Если ничего не найдено
            console.log('ℹ Прогресс игрока не найден ни в облаке, ни в localStorage');
            console.log('ℹ Считаем, что игрок запустил приложение впервые');
            return null;
        },

        // Сохранение прогресса игры
        async saveGameProgress(progressData) {
            console.log('→ Начинаем сохранение прогресса игрока...', progressData);

            const results = {
                cloud: false,
                localStorage: false
            };

            // Сохранение в Яндекс Облако
            if (this.player) {
                try {
                    console.log('→ Попытка сохранить данные в Яндекс Облако...');

                    const dataToSave = {};
                    dataToSave[STORAGE_KEY] = progressData;

                    await this.player.setData(dataToSave, true); // flush=true для немедленной записи
                    console.log('✓ Данные успешно сохранены в Яндекс Облако');
                    results.cloud = true;
                } catch (error) {
                    console.error('✗ Ошибка при сохранении данных в Яндекс Облако:', error);
                    results.cloud = false;
                }
            } else {
                console.warn('⚠ Player API недоступен, пропускаем сохранение в Яндекс Облако');
            }

            // Сохранение в localStorage
            try {
                console.log('→ Попытка сохранить данные в localStorage...');
                localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
                console.log('✓ Данные успешно сохранены в localStorage');
                results.localStorage = true;
            } catch (error) {
                console.error('✗ Ошибка при сохранении данных в localStorage:', error);
                results.localStorage = false;
            }

            // Итоговый отчет
            if (results.cloud && results.localStorage) {
                console.log('✓ Прогресс успешно сохранен в оба хранилища');
            } else if (results.cloud || results.localStorage) {
                console.warn('⚠ Прогресс частично сохранен:', results);
            } else {
                console.error('✗ Не удалось сохранить прогресс ни в одно хранилище');
            }

            return results;
        },

        // Очистка прогресса (для отладки)
        async clearGameProgress() {
            console.log('→ Очистка прогресса игрока...');

            // Очистка из Яндекс Облака
            if (this.player) {
                try {
                    const dataToSave = {};
                    dataToSave[STORAGE_KEY] = null;
                    await this.player.setData(dataToSave, true);
                    console.log('✓ Прогресс очищен в Яндекс Облаке');
                } catch (error) {
                    console.error('✗ Ошибка при очистке данных в Яндекс Облаке:', error);
                }
            }

            // Очистка из localStorage
            try {
                localStorage.removeItem(STORAGE_KEY);
                console.log('✓ Прогресс очищен в localStorage');
            } catch (error) {
                console.error('✗ Ошибка при очистке данных в localStorage:', error);
            }
        }
    };

    console.log('✓ GameProgressManager загружен и готов к использованию');
})();
