// 注册Service Worker
function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('SW注册成功:', reg.scope))
        .catch(err => console.log('SW注册失败:', err));
    });
  }
}

// 检查更新
function checkUpdate() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg) reg.update();
    });
  }
}

// 初始化
registerSW();
setInterval(checkUpdate, 60 * 60 * 1000); // 每小时检查更新