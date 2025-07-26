// 颜色等级映射
const COLOR_LEVELS = {
    '白色': 1,
    '绿色': 2,
    '蓝色': 3,
    '紫色': 4,
    '金色': 5,
    '红色': 6
};

// 颜色种子映射
const COLOR_SEEDS = {
    '白色': 100,
    '绿色': 200,
    '蓝色': 300,
    '紫色': 400,
    '金色': 500,
    '红色': 600
};

// 添加词条
function addEffect() {
    const container = document.getElementById('effectContainer');
    const item = document.createElement('div');
    item.className = 'effect-item';
    item.innerHTML = `
        <textarea class="effect-input" placeholder="输入词条内容" oninput="calculateQuality()" rows="3"></textarea>
        <select class="effect-quality" onchange="calculateQuality()">
            <option value="1">白色</option>
            <option value="2">绿色</option>
            <option value="3">蓝色</option>
            <option value="4">紫色</option>
            <option value="5">金色</option>
            <option value="6">红色</option>
        </select>
        <button type="button" class="btn-danger" onclick="removeEffect(this)">删除</button>
    `;
    container.appendChild(item);
    calculateQuality();
}

// 删除词条
function removeEffect(button) {
    button.parentNode.remove();
    calculateQuality();
}

// 计算品质
function calculateQuality() {
    const effectItems = Array.from(document.querySelectorAll('.effect-item'))
        .filter(item => item.querySelector('.effect-input').value.trim() !== '');

    if (effectItems.length === 0) {
        updateQualityDisplay('白色');
        return;
    }
    
    if (effectItems.length === 1) {
        const select = effectItems[0].querySelector('.effect-quality');
        updateQualityDisplay(select.options[select.selectedIndex].text);
        return;
    }
    
    // 多词条3合1逻辑
    const colorCounts = {};
    effectItems.forEach(item => {
        const color = item.querySelector('.effect-quality').options[item.querySelector('.effect-quality').selectedIndex].text;
        colorCounts[color] = (colorCounts[color] || 0) + 1;
    });
    
    const upgradedColors = [];
    Object.keys(colorCounts).forEach(color => {
        let count = colorCounts[color];
        while (count >= 3 && COLOR_LEVELS[color] < 6) {
            upgradedColors.push(getUpgradedColor(color));
            count -= 3;
        }
        for (let i = 0; i < count; i++) {
            upgradedColors.push(color);
        }
    });
    
    const finalQuality = upgradedColors.reduce((max, color) => 
        COLOR_LEVELS[color] > COLOR_LEVELS[max] ? color : max, '白色');
    
    updateQualityDisplay(finalQuality);
}

function getUpgradedColor(color) {
    const level = COLOR_LEVELS[color];
    for (const [name, lvl] of Object.entries(COLOR_LEVELS)) {
        if (lvl === level + 1) return name;
    }
    return color;
}

function updateQualityDisplay(quality) {
    document.getElementById('qualityDisplay').value = quality;
    document.getElementById('resultQuality').textContent = quality;
    calculatePrice();
}

// 计算价格
function calculatePrice() {
    const grade = document.getElementById('grade').value;
    const quality = document.getElementById('qualityDisplay').value;
    const qualityLevel = COLOR_LEVELS[quality] || 1;
    const effectCount = document.querySelectorAll('.effect-item').length;
    
    let basePrice = 0;
    let multiplier = 0;
    
    switch(grade) {
        case 'D': basePrice = 500; break;
        case 'C': basePrice = 1000; multiplier = 500; break;
        case 'B': basePrice = 3000; multiplier = 1000; break;
        case 'A': basePrice = 8000; multiplier = 2000; break;
        case 'S': alert('S级暂不开放'); return;
    }
    
    const totalPrice = basePrice + (multiplier * qualityLevel * effectCount);
    document.getElementById('resultPrice').textContent = totalPrice;
    document.getElementById('priceResult').style.display = 'block';
}

// 道具特有导出功能
function exportPropToTxt() {
    const name = document.getElementById('name').value;
    const essence = document.getElementById('essence').value;
    const grade = document.getElementById('grade').value;
    const quality = document.getElementById('qualityDisplay').value;
    const description = document.getElementById('description').value;
    const author = document.getElementById('author').value;
    const price = document.getElementById('resultPrice').textContent || '0';

    const effects = Array.from(document.querySelectorAll('.effect-item')).map((item, index) => {
        const text = item.querySelector('.effect-input').value;
        const quality = item.querySelector('.effect-quality').options[item.querySelector('.effect-quality').selectedIndex].text;
        const seed = COLOR_SEEDS[quality] || 0;
        return `${index + 1}. ${quality}词条: ${text} (种子: ${seed})`;
    }).join('\n');

    const effectCount = document.querySelectorAll('.effect-item').length;
    const qualityName = Object.entries(COLOR_LEVELS).find(([name, lvl]) => lvl === COLOR_LEVELS[quality])?.[0] || quality;
    const totalSeed = `${effectCount}x${qualityName}`;

    const content = `道具名称: ${name}
本质: ${essence}
等级: ${grade}
品质: ${quality}

词条效果:
${effects}

描述:
${description}

价格: ${price} 积分
种子: ${totalSeed}
总种子值: ${effectCount * (COLOR_SEEDS[qualityName] || 0)}

撰写人: ${author}
导出时间: ${new Date().toLocaleString()}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name || '未命名血统'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 保存血统数据
function saveItem() {
    const urlParams = new URLSearchParams(window.location.search);
    const fromSeries = urlParams.get('fromSeries');
    
    const propData = {
        name: document.getElementById('name').value,
        essence: document.getElementById('essence').value,
        grade: document.getElementById('grade').value,
        quality: document.getElementById('qualityDisplay').value,
        description: document.getElementById('description').value,
        author: document.getElementById('author').value,
        price: document.getElementById('resultPrice').textContent || '0',
        effects: Array.from(document.querySelectorAll('.effect-item')).map(item => ({
            text: item.querySelector('.effect-input').value,
            quality: item.querySelector('.effect-quality').options[item.querySelector('.effect-quality').selectedIndex].text
        })),
        createdAt: new Date().toISOString()
    };

    let props = JSON.parse(localStorage.getItem('props') || '[]');
    props.push(propData);
    localStorage.setItem('props', JSON.stringify(props));
    
    if (fromSeries) {
        let seriesList = JSON.parse(localStorage.getItem('seriesData') || '[]');
        let series = seriesList.find(s => s.id === fromSeries);
        
        if (series) {
            series.resources.push({
                id: `prop_${Date.now()}`,
                name: propData.name,
                type: 'prop',
                data: propData
            });
            localStorage.setItem('seriesData', JSON.stringify(seriesList));
        }
    }
    
    alert('道具保存成功');
    if (fromSeries) {
        window.location.href = `xilie.html?id=${fromSeries}`;
    }
            text: item.querySelector('.effect-input').value,
            quality;item.querySelector('.effect-quality').options[item.querySelector('.effect-quality').selectedIndex].text
        }
    

    let props = JSON.parse(localStorage.getItem('props') || '[]');
    props.push(propData);
    localStorage.setItem('props', JSON.stringify(props));
    
    if (fromSeries) {
        const seriesList = JSON.parse(localStorage.getItem('seriesData') || '[]');
        const series = seriesList.find(s => s.id === fromSeries);
        
        if (series) {
            series.resources.push({
                id: `prop_${Date.now()}`,
                name: propData.name,
                type: 'prop',
                data: propData
            });
            localStorage.setItem('seriesData', JSON.stringify(seriesList));
        }
    }
    
    alert('道具保存成功');
    if (fromSeries) {
        window.location.href = `xilie.html?id=${fromSeries}`;
    }


// 初始化
window.addEventListener('DOMContentLoaded', () => {
    if (document.querySelectorAll('.effect-item').length === 0) {
        addEffect();
    }
    calculateQuality();
    
    // 替换导出按钮功能
    const exportBtn = document.querySelector('button[onclick="exportToTxt()"]');
    if (exportBtn) {
        exportBtn.onclick = exportPropToTxt;
    }
    
    // 检查是否来自系列
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('fromSeries')) {
        document.getElementById('seriesActions').style.display = 'block';
    }
});
