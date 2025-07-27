marked.setOptions({
    highlight: function(code, lang) {
        return hljs.highlightAuto(code).value;
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // 初始加载首页的 Markdown 文件
    loadMarkdown('index.md');

    // 监听页面上所有的链接点击事件
    document.getElementById('content').addEventListener('click', function (event) {
        const target = event.target;

        if (target.tagName === 'A' && target.getAttribute('href').endsWith('.md')) {
            event.preventDefault();
            const href = target.getAttribute('href');
            loadMarkdown(href);
        }
    });

    // 渲染目录结构
    renderDirectoryNavigation();

    // 夜间模式切换
    const toggleNightModeBtn = document.getElementById('toggle-night-mode');
    if (localStorage.getItem('theme') === 'night') {
        document.body.classList.add('night-mode');
    }

    if (toggleNightModeBtn) {
        toggleNightModeBtn.addEventListener('click', () => {
            document.body.classList.toggle('night-mode');
            const isNight = document.body.classList.contains('night-mode');
            localStorage.setItem('theme', isNight ? 'night' : 'day');
            toggleNightModeBtn.textContent = isNight ? '🌙' : '☀️';
        });
    }
});

function loadMarkdown(filePath) {
    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`无法加载文件: ${filePath}`);
            }
            return response.text();
        })
        .then(markdown => {
            markdown = processMarkdownImages(markdown, filePath);
            document.getElementById('content').innerHTML = marked.parse(markdown);

            // ✅ 让 highlight.js 扫描并高亮代码块
            hljs.highlightAll();
        })
        .catch(error => {
            console.error(error);
            document.getElementById('content').innerHTML = `<p style="color: red;">加载失败: ${error.message}</p>`;
        });
}

function processMarkdownImages(markdown, filePath) {
    const basePath = filePath.substring(0, filePath.lastIndexOf('/') + 1);
    return markdown.replace(/!\[(.*?)\]\((?!http)(.*?)\)/g, (match, alt, relativePath) => {
        return `![${alt}](${basePath}${relativePath})`;
    });
}

function renderDirectoryNavigation() {
    fetch('./')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const links = Array.from(doc.querySelectorAll('a'));
            const mdLinks = links.filter(link =>
                link.getAttribute('href').endsWith('.md') &&
                link.getAttribute('href') !== 'index.md'
            );

            const nav = document.getElementById('navigation');
            nav.innerHTML = '<h2>目录</h2><ul>' +
                mdLinks.map(link => {
                    const href = link.getAttribute('href');
                    return `<li><a href="${href}">${href}</a></li>`;
                }).join('') +
                '</ul>';
        });
}
