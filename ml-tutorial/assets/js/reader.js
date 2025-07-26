// 阅读器功能控制器
document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const content = document.querySelector('.reader-content');
  const fontIncrease = document.getElementById('font-increase');
  const fontDecrease = document.getElementById('font-decrease');
  const fontReset = document.getElementById('font-reset');
  const themeToggle = document.getElementById('theme-toggle');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  
  // 初始化设置
  let baseFontSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--base-font-size') || 18;
  
  // 字体大小控制
  function updateFontSize(newSize) {
    baseFontSize = Math.max(14, Math.min(24, newSize));
    document.documentElement.style.setProperty('--base-font-size', `${baseFontSize}px`);
    localStorage.setItem('reader-font-size', `${baseFontSize}px`);
  }
  
  fontIncrease.addEventListener('click', () => updateFontSize(baseFontSize + 1));
  fontDecrease.addEventListener('click', () => updateFontSize(baseFontSize - 1));
  fontReset.addEventListener('click', () => updateFontSize(18));
  
  // 夜间模式切换
  function toggleTheme() {
    const isDark = document.body.classList.contains('reader-dark');
    const newTheme = isDark ? 'light' : 'dark';
    
    document.body.classList.toggle('reader-dark');
    themeToggle.textContent = isDark ? '🌙' : '☀️';
    localStorage.setItem('reader-theme', newTheme);
  }
  
  themeToggle.addEventListener('click', toggleTheme);
  
  // 侧边栏目录
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    document.body.classList.toggle('sidebar-open');
  });
  
  // 目录项点击后自动关闭侧边栏
  document.querySelectorAll('#toc a').forEach(link => {
    link.addEventListener('click', () => {
      sidebar.classList.remove('active');
      document.body.classList.remove('sidebar-open');
    });
  });
  
  // 章节进度跟踪
  function updateActiveToc() {
    const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let currentHeader = null;
    let closestDistance = Infinity;
    
    headers.forEach(header => {
      const rect = header.getBoundingClientRect();
      if (rect.top <= 100 && rect.top > -100) {
        const distance = Math.abs(rect.top - 100);
        if (distance < closestDistance) {
          closestDistance = distance;
          currentHeader = header;
        }
      }
    });
    
    if (currentHeader) {
      document.querySelectorAll('#toc a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentHeader.id}`) {
          link.classList.add('active');
          
          // 滚动到活动目录项
          const tocContainer = link.closest('#toc');
          if (tocContainer) {
            tocContainer.scrollTop = link.offsetTop - tocContainer.offsetTop - 100;
          }
        }
      });
    }
  }
  
  window.addEventListener('scroll', updateActiveToc);
  window.addEventListener('resize', updateActiveToc);
  updateActiveToc(); // 初始更新
  
  // 点击外部关闭侧边栏
  document.addEventListener('click', function(event) {
    if (sidebar.classList.contains('active') && 
        !sidebar.contains(event.target) && 
        !sidebarToggle.contains(event.target)) {
      sidebar.classList.remove('active');
      document.body.classList.remove('sidebar-open');
    }
  });
  
  // 数学公式渲染支持
  if (typeof MathJax !== 'undefined') {
    MathJax.typesetPromise();
  }
});