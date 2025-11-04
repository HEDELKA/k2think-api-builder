/**
 * K2Think API Builder - Библиотека для создания кастомных JSON API
 * @author K2Think API Builder
 * @version 1.0.0
 */

const CustomAPIBuilder = require('./api-builder');
const K2ThinkDialog = require('./k2think-dialog');

module.exports = {
    // Основной класс для создания API
    CustomAPIBuilder,
    
    // Диалог с K2Think
    K2ThinkDialog,
    
    // Удобный фабричный метод
    create: async (options = {}) => {
        const builder = new CustomAPIBuilder(options);
        await builder.init();
        return builder;
    },
    
    // Версия библиотеки
    version: '1.0.0'
};
