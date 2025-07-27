// 初始化 markdown-it（含代码高亮）
const md = window.markdownit({
  highlight: function (str, lang) {
    try {
      return '<pre class="hljs"><code>' +
             hljs.highlightAuto(str).value +
             '</code></pre>';
    } catch (__) {}
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

document.addEventListener('DOMContentLoaded', function () {
  // 初始加载 Markdown
  loadMarkdown('index.md');

  // 链接点击
  document.getElementById('content').addEventListener('click', function (event) {
    const target = event.target;
    if (target.tagName === 'A' && target.getAttribute('href').endsWith('.md')) {
      event.preventDefault();
      const href = target.getAttribute('href');
      loadMarkdown(href);
    }
  });

  // 夜间模式按钮
  const toggleNightModeBtn = document.getElementById('toggle-night-mode');
  if (localStorage.getItem('theme') === 'night') {
    document.body.classList.add('night-mode');
    toggleNightModeBtn.textContent = '🌙';
  }

  toggleNightModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('night-mode');
    const isNight = document.body.classList.contains('night-mode');
    localStorage.setItem('theme', isNight ? 'night' : 'day');
    toggleNightModeBtn.textContent = isNight ? '🌙' : '☀️';
  });

  // 目录功能暂时注释掉，避免报错
  // renderDirectoryNavigation();
});

function loadMarkdown(filePath) {
  fetch(filePath)
    .then(response => {
      if (!response.ok) throw new Error(`无法加载文件: ${filePath}`);
      return response.text();
    })
    .then(markdown => {
      // 如果你没有图片处理逻辑，可以删掉下一行
      // markdown = processMarkdownImages(markdown, filePath);
      document.getElementById('content').innerHTML = md.render(markdown);
    })
    .catch(error => {
      console.error(error);
      document.getElementById('content').innerHTML =
        `<p style="color: red;">加载失败: ${error.message}</p>`;
    });
}
