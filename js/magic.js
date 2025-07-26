// 魔法等级映射（基于最低花费）
const gradeLevels = [
    { min: 0, max: 19, grade: 'D' },
    { min: 20, max: 59, grade: 'C' },
    { min: 60, max: 139, grade: 'B' },
    { min: 140, max: 299, grade: 'A' },
    { min: 300, max: 620, grade: 'S' }
];

// 颜色映射（基于最高和最低花费的差值）
const colorLevels = [
    { min: 0, max: 19, color: '白色' },
    { min: 20, max: 59, color: '绿色' },
    { min: 60, max: 139, color: '蓝色' },
    { min: 140, max: 299, color: '紫色' },
    { min: 300, max: 620, color: '金色' }
];

// 基础价格映射
const basePrices = {
    'D': 500,
    'C': 1000,
    'B': 3000,
    'A': 8000
};

// 颜色倍率映射
const colorMultipliers = {
    '白色': 1,
    '绿色': 2,
    '蓝色': 3,
    '紫色': 4,
    '金色': 5
};

function calculateMagic() {
    const minCost = parseInt(document.getElementById('minCost').value) || 0;
    const maxCost = parseInt(document.getElementById('maxCost').value) || 0;

    // 验证魔力花费范围
    if (maxCost < minCost) {
        alert('最高魔力花费不能小于最低魔力花费');
        return;
    }

    // 判断流体类型
    const fluidType = minCost === maxCost ? '刚体魔法' : '流体魔法';
    document.getElementById('fluidType').value = fluidType;

    // 计算魔法等级（基于最低花费）
    let grade = '';
    for (const level of gradeLevels) {
        if (minCost >= level.min && minCost <= level.max) {
            grade = level.grade;
            break;
        }
    }

    // 计算词条颜色（基于差值）
    const diff = maxCost - minCost;
    let color = '';
    for (const level of colorLevels) {
        if (diff >= level.min && diff <= level.max) {
            color = level.color;
            break;
        }
    }

    // 特殊处理红色词条
    const effect = document.getElementById('effect').value;
    if (effect.includes('红色')) {
        color = '红色';
    }

    document.getElementById('gradeDisplay').value = grade;
    document.getElementById('colorDisplay').value = color;

    // 计算价格
    calculatePrice(grade, color);
}

function calculatePrice(grade, color) {
    let price = '?';
    
    if (color !== '红色' && basePrices[grade]) {
        const basePrice = basePrices[grade];
        const multiplier = colorMultipliers[color] || 1;
        price = basePrice * multiplier;
    }

    document.getElementById('priceDisplay').value = price;
}

function exportMagicToTxt() {
    const minCost = parseInt(document.getElementById('minCost').value) || 0;
    const maxCost = parseInt(document.getElementById('maxCost').value) || 0;

    // 验证魔力花费范围（静默处理）
    if (maxCost < minCost) {
        return; // 不执行导出，也不显示警告
    }

    const name = document.getElementById('name').value;
    const essence = document.getElementById('essence').value;
    const effect = document.getElementById('effect').value;
    const fluidType = document.getElementById('fluidType').value;
    const grade = document.getElementById('gradeDisplay').value;
    const color = document.getElementById('colorDisplay').value;
    const author = document.getElementById('author').value;

    // 保存魔法数据
    const magic = {
        name,
        essence,
        minCost,
        maxCost,
        effect,
        fluidType,
        grade,
        color,
        author
    };

    // 获取现有魔法列表
    const magics = JSON.parse(localStorage.getItem('magics') || '[]');
    
    // 添加新魔法（如果不存在）
    if (!magics.some(m => m.name === name && m.author === author)) {
        magics.push(magic);
        localStorage.setItem('magics', JSON.stringify(magics));
    }

    // 导出文件
    let content = `魔法名称: ${name}\n`;
    content += `魔法本质: ${essence}\n`;
    content += `魔力花费: ${minCost}-${maxCost}\n`;
    content += `魔法流体类型: ${fluidType}\n`;
    content += `魔法等级: ${grade}\n`;
    content += `词条颜色: ${color}\n\n`;
    content += `魔法效果:\n${effect}\n\n`;
    content += `撰写人: ${author}\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}_${grade}_魔法细则.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// 导入当前魔法到魔法书
function importToBook() {
    const minCost = parseInt(document.getElementById('minCost').value) || 0;
    const maxCost = parseInt(document.getElementById('maxCost').value) || 0;

    if (maxCost < minCost) {
        alert('最高魔力花费不能小于最低魔力花费');
        return;
    }

    const name = document.getElementById('name').value;
    const essence = document.getElementById('essence').value;
    const effect = document.getElementById('effect').value;
    const fluidType = document.getElementById('fluidType').value;
    const grade = document.getElementById('gradeDisplay').value;
    const color = document.getElementById('colorDisplay').value;
    const author = document.getElementById('author').value;

    if (!name || !author) {
        alert('请填写魔法名称和撰写人');
        return;
    }

    // 获取魔法书列表
    const books = JSON.parse(localStorage.getItem('magicBooks') || '[]');
    if (books.length === 0) {
        if (confirm('尚未创建任何魔法书，是否现在创建？')) {
            window.location.href = 'magicbook.html';
        }
        return;
    }

    // 创建选择对话框
    const bookName = prompt(`请选择要导入的魔法书:\n${books.map(b => b.name).join('\n')}\n\n输入魔法书名称:`);
    if (!bookName) return;

    const targetBook = books.find(b => b.name === bookName);
    if (!targetBook) {
        alert('未找到指定的魔法书');
        return;
    }

    // 创建魔法对象
    const magic = {
        name,
        essence,
        minCost,
        maxCost,
        effect,
        fluidType,
        grade,
        color,
        author
    };

    // 检查是否已存在
    if (targetBook.magics.some(m => m.name === name && m.author === author)) {
        alert('该魔法已存在于目标魔法书中');
        return;
    }

    // 添加到魔法书
    targetBook.magics.push(magic);
    localStorage.setItem('magicBooks', JSON.stringify(books));
    alert(`成功将"${name}"导入到魔法书"${bookName}"`);
}

// 获取URL参数
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 保存魔法到系列
function saveToSeries(magic) {
    const seriesId = getUrlParam('fromSeries');
    if (!seriesId) return;
    
    const seriesData = JSON.parse(localStorage.getItem('seriesData') || '[]');
    const series = seriesData.find(s => s.id === seriesId);
    if (!series) return;
    
    // 检查是否已存在
    const exists = series.resources.some(r => 
        r.type === 'magic' && r.data.name === magic.name && r.data.author === magic.author
    );
    
    if (!exists) {
        series.resources.push({
            id: `magic_${magic.name}`,
            name: magic.name,
            type: 'magic',
            data: magic
        });
        localStorage.setItem('seriesData', JSON.stringify(seriesData));
    }
}

// 初始化
// 保存魔法数据
function saveItem() {
    console.log('开始执行saveItem函数');
    const urlParams = new URLSearchParams(window.location.search);
    const fromSeries = urlParams.get('fromSeries');
    console.log('fromSeries参数:', fromSeries);

    const minCost = parseInt(document.getElementById('minCost').value) || 0;
    const maxCost = parseInt(document.getElementById('maxCost').value) || 0;

    if (maxCost < minCost) {
        alert('最高魔力花费不能小于最低魔力花费');
        return;
    }

    const magicData = {
        id: Date.now().toString(),
        type: 'magic',
        name: document.getElementById('name').value,
        essence: document.getElementById('essence').value,
        minCost: minCost,
        maxCost: maxCost,
        effect: document.getElementById('effect').value,
        fluidType: document.getElementById('fluidType').value,
        grade: document.getElementById('gradeDisplay').value,
        color: document.getElementById('colorDisplay').value,
        author: document.getElementById('author').value,
        createdAt: new Date().toISOString()
    };
    console.log('准备保存的魔法数据:', magicData);

    try {
        // 保存到魔法列表
        let magics = JSON.parse(localStorage.getItem('magics') || '[]');
        magics.push(magicData);
        localStorage.setItem('magics', JSON.stringify(magics));
        console.log('魔法数据保存成功');

        // 如果是从系列页面跳转，保存到系列
        if (fromSeries) {
            console.log('尝试保存到系列');
            saveToSeries(magicData);
        }

        // 如果不是从系列页面跳转，显示保存成功提示
        if (!fromSeries) {
            alert('魔法保存成功');
        }
    } catch (error) {
        console.error('保存魔法数据时出错:', error);
        alert('保存失败: ' + error.message);
        return;
    }

    // 如果是从系列页面跳转，由saveToSeries处理后续跳转
    alert('魔法保存成功');
    
    if (fromSeries) {
        window.location.href = `xilie.html?id=${fromSeries}`;
        return;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    // 检查是否有来自魔法书或系列的跳转
    const bookId = getUrlParam('bookId');
    const seriesId = getUrlParam('fromSeries');
    
    if (bookId) {
        // 添加返回魔法书按钮
        const backButton = document.createElement('button');
        backButton.textContent = '返回魔法书';
        backButton.style.marginLeft = '10px';
        backButton.style.backgroundColor = '#FF9800';
        backButton.onclick = () => {
            window.location.href = 'magicbook.html';
        };
        document.querySelector('form').appendChild(backButton);
    }
    
    if (seriesId) {
        // 添加保存并返回按钮
        const saveBtn = document.createElement('button');
        saveBtn.textContent = '保存并返回系列';
        saveBtn.style.marginLeft = '10px';
        saveBtn.style.backgroundColor = '#4CAF50';
        saveBtn.onclick = () => {
            saveItem();
            window.location.href = `xilie.html?id=${seriesId}`;
        };
        document.querySelector('form').appendChild(saveBtn);
        
        // 添加取消返回按钮
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消返回';
        cancelBtn.style.marginLeft = '10px';
        cancelBtn.style.backgroundColor = '#FF9800';
        cancelBtn.onclick = () => {
            window.location.href = 'xilie.html';
        };
        document.querySelector('form').appendChild(cancelBtn);
    }
    
    // 初始化计算
    document.getElementById('minCost').addEventListener('change', calculateMagic);
    document.getElementById('maxCost').addEventListener('change', calculateMagic);
});
