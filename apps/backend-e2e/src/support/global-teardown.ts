/* eslint-disable */
module.exports = async function () {
  // Kill the server process
  if (global.__SERVER__) {
    const result = global.__SERVER__.kill();
    console.log('Backend server stopped', result);
  }
};
