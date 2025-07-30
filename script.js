
document.addEventListener('DOMContentLoaded', function() {
    marked.setOptions({
        highlight: function(code, lang) {
            return hljs.highlightAuto(code).value;
        }
    });
    // 初始加载首页的 Markdown 文件
    loadMarkdown('index.md');

    // 监听页面上所有的链接点击事件
    document.getElementById('content').addEventListener('click', function(event) {
        const target = event.target;

        // 如果点击的是 <a> 标签，且链接是指向 Markdown 文件
        if (target.tagName === 'A' && target.getAttribute('href').endsWith('.md')) {
            event.preventDefault();  // 阻止默认的跳转行为
            const href = target.getAttribute('href');
            loadMarkdown(href);  // 加载对应的 Markdown 文件
        }
    });

    // 获取并渲染目录结构
    renderDirectoryNavigation();

    // 夜间模式切换按钮事件
    const toggleNightModeBtn = document.getElementById('toggle-night-mode');

    // 检查本地存储中的设置
    if (localStorage.getItem('theme') === 'night') {
        document.body.classList.add('night-mode');
    }

    toggleNightModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('night-mode');

        // 保存用户的主题选择到本地存储
        if (document.body.classList.contains('night-mode')) {
            localStorage.setItem('theme', 'night');
        } else {
            localStorage.setItem('theme', 'day');
        }

        // 更新按钮显示的 emoji
        if (document.body.classList.contains('night-mode')) {
            toggleNightModeBtn.textContent = '🌙'; // 切换到夜间模式时显示🌙
        } else {
            toggleNightModeBtn.textContent = '☀️'; // 切换到白天模式时显示☀️
        }
    });
});


// 加载并渲染 Markdown 文件的函数
function loadMarkdown(filePath) {
    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error('无法加载文件');
            }
            return response.text();
        })
        .then(markdown => {
            // 处理 Markdown 中的路径
            markdown = processMarkdownImages(markdown, filePath);
            //markdown = processMarkdownLinks(markdown, filePath);

            // 使用 marked.js 渲染 Markdown 内容
            document.getElementById('content').innerHTML = marked.parse(markdown);

            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block);
            });
        })
        .catch(error => {
            document.getElementById('content').innerHTML = `<p>加载文件时出错：${error.message}</p>`;
        });
}


// 加载并渲染目录文件
async function renderDirectoryNavigation() {
    try {
        const response = await fetch('directory.json');
        if (!response.ok) {
            throw new Error('无法加载目录内容');
        }
        const data = await response.json();

        // 生成目录 HTML
        const navHtml = await generateNavFromGitHubData(data);
        // 渲染到页面中的目录区域
        document.getElementById('directory-list').innerHTML = navHtml;
    } catch (error) {
        console.error('加载目录时出错:', error);
        document.getElementById('directory-list').innerHTML = '<p>无法加载目录内容</p>';
    }
}



// 获取 GitHub 仓库内容
function fetchGitHubRepoContents(owner, repo, path, branch = 'gh-pages') {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    console.log("请求的 API URL:", apiUrl);  // 打印请求 URL，帮助调试

    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('无法加载 GitHub 仓库内容');
            }
            return response.json();
        })
        .then(data => {
            console.log("GitHub API 返回的数据:", data);  // 打印返回的数据，帮助调试
            return data;
        })
        .catch(error => {
            console.error('GitHub API 请求失败:', error);
        });
}



// 递归渲染目录和文件
async function generateNavFromGitHubData(data) {
    if (!Array.isArray(data)) {
        console.error('返回的数据不是数组', data);
        return '<p>无法加载目录内容。</p>';
    }

    const navHtml = await Promise.all(data.map(async (item) => {
        if (item.type === 'dir') {  // 如果是目录
            const subNavHtml = await generateNavFromGitHubData(item.content);  // 递归生成子目录
            return `
                <li class="directory-item">
                    <div class="directory-name" onclick="toggleSubDirectory('${item.path}')">${item.name}</div>
                    <ul id="sub-${item.path}" class="subdirectory" style="display: none;">
                        ${subNavHtml}
                    </ul>
                </li>
            `;
        } else if (item.type === 'file' && item.name.endsWith('.md')) {  // 如果是 Markdown 文件
            return `
                <li class="file-item">
                    <a href="#" onclick="loadMarkdown('${item.download_url}')">${item.name}</a>
                </li>
            `;
        }
    }));

    return navHtml.join('');
}



// 切换子目录显示
function toggleSubDirectory(path) {
    const subDirectory = document.getElementById(`sub-${path}`);
    if (subDirectory) {
        subDirectory.style.display = subDirectory.style.display === 'none' ? 'block' : 'none';
    }
}


function processMarkdownImages(markdownContent, currentFilePath) {
    // 打印调试信息，确认函数是否被调用
    console.log("processMarkdownImages 被触发");
    console.log("当前文件路径:", currentFilePath);

    // 获取当前文件所在目录的路径（去掉文件名部分）
    const basePath = currentFilePath.substring(0, currentFilePath.lastIndexOf('/')); // 获取当前文件的目录路径
    console.log("当前文件的基路径:", basePath);

    // 使用正则表达式匹配 Markdown 中的图片路径
    const imageRegex = /!\[([^\]]+)\]\(([^)]+)\)/g;

    // 替换图片路径
    return markdownContent.replace(imageRegex, function(match, altText, imagePath) {
        // 如果图片路径是相对路径，拼接当前文件的目录路径
        let fullImagePath = imagePath;

        // 检查图片路径是否是相对路径（没有 `http` 或 `https` 开头）
        if (!imagePath.startsWith('http') && !imagePath.startsWith('https')) {
            // 拼接当前 Markdown 文件所在目录的路径和图片路径
            fullImagePath = basePath + '/' + imagePath;

            // 打印拼接的图片路径，帮助调试
            console.log(`拼接的图片路径: ${fullImagePath}`);
        }

        // 返回修改后的 HTML
        return `![${altText}](${fullImagePath})`;
    });
}


const resizer = document.getElementById('sidebar-resizer');
const navigation = document.getElementById('navigation');
const contentContainer = document.querySelector('.content-container');
let isResizing = false;

// 鼠标按下开始拖动
resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
    e.preventDefault();
});

// 调整宽度
function resize(e) {
    if (!isResizing) return;
    const containerRect = contentContainer.getBoundingClientRect();
    const newWidth = e.clientX - containerRect.left;
    // 限制最小宽度150px，最大宽度600px
    if (newWidth >= 150 && newWidth <= 600) {
        navigation.style.width = `${newWidth}px`;
    }
}

// 停止拖动
function stopResize() {
    isResizing = false;
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
}

// 触摸设备支持
resizer.addEventListener('touchstart', (e) => {
    isResizing = true;
    e.preventDefault();
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    if (!isResizing) return;
    const containerRect = contentContainer.getBoundingClientRect();
    const newWidth = e.touches[0].clientX - containerRect.left;
    if (newWidth >= 150 && newWidth <= 600) {
        navigation.style.width = `${newWidth}px`;
    }
    e.preventDefault();
}, { passive: false });

document.addEventListener('touchend', () => {
    isResizing = false;
});
