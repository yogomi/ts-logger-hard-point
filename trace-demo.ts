/**
 * trace レベル対応のデモンストレーション
 * ts-logger-hard-point に新しく追加された trace レベルの利用例
 */
import { logger, PRIORITY } from './index.js';

console.log('=== trace レベル対応デモ ===');
console.log('利用可能なログレベル:', PRIORITY);
console.log('');

// デフォルトレベル (info = 2) での動作確認
console.log('1. デフォルトレベル (info) での出力:');
logger.error('エラーメッセージ');
logger.warn('警告メッセージ');
logger.info('情報メッセージ');
logger.debug('デバッグメッセージ (表示されない)');
logger.trace('トレースメッセージ (表示されない)');

console.log('');
console.log('2. debug レベルに設定:');
logger.setLogLevel(PRIORITY.debug);
logger.debug('デバッグメッセージ (表示される)');
logger.trace('トレースメッセージ (まだ表示されない)');

console.log('');
console.log('3. trace レベルに設定:');
logger.setLogLevel(PRIORITY.trace);
logger.debug('デバッグメッセージ (表示される)');
logger.trace('トレースメッセージ (表示される!)');

console.log('');
console.log('4. 数値でのレベル設定:');
logger.setLogLevel(4); // trace = 4
logger.trace('数値指定でのトレース');

console.log('');
console.log('5. メタデータ付きトレースログ:');
logger.trace('API呼び出しトレース', {
  method: 'GET',
  path: '/api/users',
  elapsedMs: 15,
  userId: 'user123'
});

console.log('');
console.log('6. オブジェクトのトレース:');
const debugObject = { user: 'test', action: 'login', timestamp: new Date() };
logger.trace(debugObject);

console.log('');
console.log('trace レベル対応により、より詳細なデバッグ情報の出力が可能になりました。');