// Заглушка для cordova.js при запуске в браузере
// В настоящем Cordova приложении этот файл будет заменен платформой
console.log('[CORDOVA] Stub cordova.js loaded (web version)');

// Проверяем, не загружен ли уже настоящий Cordova
if (typeof window.cordova === 'undefined') {
    console.log('[CORDOVA] No native Cordova detected, using stub');
    // Создаем пустой объект cordova для совместимости
    window.cordova = {
        version: 'stub'
    };
}
