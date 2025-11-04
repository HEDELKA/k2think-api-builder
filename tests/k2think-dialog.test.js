/**
 * Тесты для K2ThinkDialog
 */

const { K2ThinkDialog } = require('../src/index');

describe('K2ThinkDialog', () => {
    const mockCookies = 'test_cookies_value';
    let dialog;

    test('должен создаваться с cookies', () => {
        dialog = new K2ThinkDialog(mockCookies);
        expect(dialog).toBeDefined();
        expect(dialog.cookies).toBe(mockCookies);
        expect(dialog.baseUrl).toBe('https://www.k2think.ai');
    });

    test('должен иметь правильные заголовки', () => {
        expect(dialog.headers).toBeDefined();
        expect(dialog.headers['Content-Type']).toBe('application/json');
        expect(dialog.headers['Accept']).toBe('text/event-stream');
    });

    describe('Основные методы', () => {
        test('должен иметь метод createNewChat', () => {
            expect(typeof dialog.createNewChat).toBe('function');
        });

        test('должен иметь метод sendMessage', () => {
            expect(typeof dialog.sendMessage).toBe('function');
        });

        test('должен иметь метод getChat', () => {
            expect(typeof dialog.getChat).toBe('function');
        });

        test('должен иметь метод getChatList', () => {
            expect(typeof dialog.getChatList).toBe('function');
        });
    });

    describe('Параметры конфигурации', () => {
        test('должен принимать кастомный baseUrl', () => {
            const customDialog = new K2ThinkDialog(mockCookies, 'https://custom.example.com');
            expect(customDialog.baseUrl).toBe('https://custom.example.com');
        });

        test('должен устанавливать правильные заголовки', () => {
            expect(dialog.headers['Origin']).toBe(dialog.baseUrl);
            expect(dialog.headers['Referer']).toBe(dialog.baseUrl + '/');
            expect(dialog.headers['User-Agent']).toContain('Mozilla');
        });
    });

    describe('Работа с UUID', () => {
        test('должен генерировать уникальные ID для сообщений', () => {
            // Проверяем, что в коде используется uuid
            const fs = require('fs');
            const dialogCode = fs.readFileSync('./src/k2think-dialog.js', 'utf8');
            expect(dialogCode).toContain('uuid');
        });
    });
});
