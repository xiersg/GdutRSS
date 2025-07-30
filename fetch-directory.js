import fetch from 'node-fetch';  // 使用 import 导入 node-fetch
import fs from 'fs';             // 使用 import 导入 fs 模块

const owner = 'xiersg';  // GitHub 用户名
const repo = 'GdutRSS';  // 仓库名
const branch = 'gh-pages';  // 仓库分支
const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents/topics`;

// 递归获取 GitHub 仓库目录
async function fetchGitHubRepoContents(path = '') {
    const apiUrl = `${baseUrl}/${path}?ref=${branch}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error('GitHub API 返回的数据不是目录数组');
    }

    const result = [];

    for (const item of data) {
        if (item.type === 'file' && item.name.endsWith('.md')) {
            result.push({
                type: 'file',
                name: item.name,
                download_url: item.download_url
            });
        } else if (item.type === 'dir') {
            const subDirContents = await fetchGitHubRepoContents(item.path);  // 递归获取子目录
            result.push({
                type: 'dir',
                name: item.name,
                path: item.path,
                content: subDirContents  // 包含子目录内容
            });
        }
    }

    return result;
}

// 主执行函数，生成目录 JSON 文件
async function generateDirectoryJson() {
    try {
        const data = await fetchGitHubRepoContents('');
        fs.writeFileSync('directory.json', JSON.stringify(data, null, 2), 'utf8');
        console.log('directory.json 文件已生成！');
    } catch (error) {
        console.error('获取目录数据时出错:', error);
    }
}

// 执行生成目录 JSON 的函数
generateDirectoryJson();
