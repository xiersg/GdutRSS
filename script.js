// 获取元素
const resizer = document.getElementById('resizer');
const navigation = document.getElementById('navigation');
const content = document.getElementById('content');

// 监听鼠标拖动事件
let isResizing = false;
let lastDownX = 0;

resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    lastDownX = e.clientX;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
    });
});

function handleMouseMove(e) {
    if (!isResizing) return;

    const offsetLeft = e.clientX;  // 当前鼠标位置
    const newWidth = offsetLeft;   // 新的宽度是鼠标点击的位置

    // 限制目录栏宽度的范围
    if (newWidth > 100 && newWidth < document.documentElement.clientWidth - 100) {
        navigation.style.width = `${newWidth}px`;  // 设置目录栏宽度
        content.style.marginLeft = `${newWidth + 10}px`;  // 为内容区留出空间
    }
}





document.addEventListener('DOMContentLoaded', function() {
    // 加载并渲染 Markdown 文件
    fetch('index.md')
        .then(response => {
            if (!response.ok) {
                throw new Error('无法加载 index.md 文件');
            }
            return response.text();
        })
        .then(markdown => {
            // 使用 marked.js 渲染 Markdown 内容
            document.getElementById('content').innerHTML = marked.parse(markdown);
        })
        .catch(error => {
            document.getElementById('content').innerHTML = `<p>加载文件时出错：${error.message}</p>`;
        });
});

document.addEventListener('DOMContentLoaded', function() {
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
            markdown = processMarkdownLinks(markdown, filePath);

            // 使用 marked.js 渲染 Markdown 内容
            document.getElementById('content').innerHTML = marked.parse(markdown);
        })
        .catch(error => {
            document.getElementById('content').innerHTML = `<p>加载文件时出错：${error.message}</p>`;
        });
}


// 获取并渲染目录
function renderDirectoryNavigation() {
    const owner = 'xiersg';  // 你的 GitHub 用户名
    const repo = 'ml_temp';  // 仓库名
    const path = 'topics';  // 目录路径
    
    fetchGitHubRepoContents(owner, repo, path)
        .then(data => {
            // 生成目录 HTML
            const navHtml = generateNavFromGitHubData(data);
            // 渲染到页面中的目录区域
            document.getElementById('directory-list').innerHTML = navHtml;
        });
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



function generateNavFromGitHubData(data) {
    // 确保返回的是数组
    if (!Array.isArray(data)) {
        console.error('返回的数据不是数组', data);
        return '<p>无法加载目录内容。</p>';
    }

    // 递归生成导航
    return data.map(item => {
        if (item.type === 'dir') {  // 如果是目录
            const encodedPath = encodeURIComponent(item.name); // 对目录名称进行 URL 编码
            const subDirPath = `topics/${encodedPath}`;  // 拼接目录路径
            return `
                <li>
                    <div class="directory-item" onclick="toggleSubDirectory('${encodedPath}')">${item.name}</div>
                    <ul id="sub-${encodedPath}" class="subdirectory" style="display: none;">
                        ${generateNavFromGitHubData(item._embedded?.contents || [])}  <!-- 递归加载子目录 -->
                    </ul>
                </li>
            `;
        } else if (item.type === 'file') {  // 如果是文件
            return `<li><a href="${item.download_url}" target="_blank">${item.name}</a></li>`;
        }
    }).join('');
}

// 切换子目录显示
function toggleSubDirectory(path) {
    const subDirectory = document.getElementById(`sub-${path}`);
    if (subDirectory) {
        subDirectory.style.display = subDirectory.style.display === 'none' ? 'block' : 'none';
    }
}





// 暂时废弃
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

//md路径也要改
function processMarkdownLinks(markdownContent, currentFilePath) {
    // 获取当前文件路径的目录部分
    const basePath = currentFilePath.substring(0, currentFilePath.lastIndexOf('/'));

    // 使用正则表达式匹配 Markdown 中的链接路径
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    return markdownContent.replace(linkRegex, function(match, linkText, linkPath) {
        let fullLinkPath = linkPath;

        // 检查链接路径是否是相对路径（没有 `http` 或 `https` 开头）
        if (!linkPath.startsWith('http') && !linkPath.startsWith('https')) {
            // 拼接当前文件的基路径和链接路径
            fullLinkPath = basePath + '/' + linkPath;
        }

        // 返回修改后的链接
        return `[${linkText}](${fullLinkPath})`;
    });
}

