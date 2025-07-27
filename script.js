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
