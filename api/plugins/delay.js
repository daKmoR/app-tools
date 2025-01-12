/** 
 * @param {number} ms 
 * @returns {import('../index').Plugin}
 */
export const delayPlugin = (ms) => ({ 
  name: 'delay',
  afterFetch: async () => {
    await new Promise(r => setTimeout(r,ms))
  }
});

export const delay = delayPlugin(1000);