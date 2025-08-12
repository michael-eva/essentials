const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    // Run health check test first, then others
    const healthTests = tests.filter(test => test.path.includes('health') || test.path.includes('api'));
    const otherTests = tests.filter(test => !test.path.includes('health') && !test.path.includes('api'));
    
    return [...healthTests, ...otherTests];
  }
}

module.exports = CustomSequencer;