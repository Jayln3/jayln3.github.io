import Hexo from 'hexo';

const hexo = new Hexo(process.argv[2], { silent: false });
try {
  await hexo.init();
  // Some plugins log a fatal render error but do not reject generate().
  // Treat any error event as a failed build.
  let loggedError = false;
  const originalError = hexo.log.error.bind(hexo.log);
  hexo.log.error = (...args) => { loggedError = true; originalError(...args); };
  await hexo.call('generate');
  if (loggedError) throw new Error('Hexo logged a rendering error');
  await hexo.exit();
} catch (error) {
  console.error(error);
  await hexo.exit(error);
  process.exitCode = 1;
}
