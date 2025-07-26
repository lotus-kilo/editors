

// 战技导出功能
function exportFightToTxt() {
    const name = document.getElementById('name').value;
    const condition = document.getElementById('condition').value;
    const description = document.getElementById('description').value;
    const author = document.getElementById('author').value;

    const content = `战技名称: ${name}
使用条件: ${condition}

描述:
${description}

撰写人: ${author}
导出时间: ${new Date().toLocaleString()}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name || '未命名战技'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 战技数据保存
function saveItem() {
    const urlParams = new URLSearchParams(window.location.search);
    const fromSeries = urlParams.get('fromSeries');
    
    const fightData = {
        name: document.getElementById('name').value,
        condition: document.getElementById('condition').value,
        description: document.getElementById('description').value,
        author: document.getElementById('author').value
    };
    
    // 保存到本地存储
    let fights = JSON.parse(localStorage.getItem('fights') || '[]');
    fights.push(fightData);
    localStorage.setItem('fights', JSON.stringify(fights));
    
    // 如果是从系列页面跳转过来的，返回系列页面
    if (fromSeries) {
        window.location.href = `xilie.html?id=${fromSeries}`;
    } else {
        alert('战技保存成功');
    }
}

// 初始化
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromSeries = urlParams.get('fromSeries');
    
    if (fromSeries) {
        // 添加保存并返回系列按钮
        const form = document.getElementById('fightForm');
        const saveBtn = document.createElement('button');
        saveBtn.textContent = '保存并返回系列';
        saveBtn.style.marginLeft = '10px';
        saveBtn.style.backgroundColor = '#4CAF50';
        saveBtn.onclick = saveItem;
        form.appendChild(saveBtn);
        
        // 添加取消返回按钮
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消返回';
        cancelBtn.style.marginLeft = '10px';
        cancelBtn.style.backgroundColor = '#FF9800';
        cancelBtn.onclick = () => {
            window.location.href = 'xilie.html';
        };
        form.appendChild(cancelBtn);
    }
});
