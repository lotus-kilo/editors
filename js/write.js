// 颜色等级映射
const COLOR_LEVELS = {
    '白色': 1,
    '绿色': 2,
    '蓝色': 3,
    '紫色': 4,
    '金色': 5,
    '红色': 6
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

// 计算品质（主函数）
function calculateQuality() {
    // 获取所有有效词条（有内容的）
    const effectItems = Array.from(document.querySelectorAll('.effect-item'))
        .filter(item => item.querySelector('.effect-input').value.trim() !== '');
    
    // 如果没有词条，显示默认品质
    if (effectItems.length === 0) {
        updateQualityDisplay('白色');
        return;
    }
    
    // 单词条情况直接使用该词条颜色
    if (effectItems.length === 1) {
        const select = effectItems[0].querySelector('.effect-quality');
        const quality = select.options[select.selectedIndex].text;
        updateQualityDisplay(quality);
        return;
    }
    
    // 多词条执行3合1兑换逻辑
    calculateCombinedQuality(effectItems);
}

// 计算组合品质（多词条时）
function calculateCombinedQuality(items) {
    const colorCounts = {};
    items.forEach(item => {
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

// 获取升级后的颜色
function getUpgradedColor(color) {
    const level = COLOR_LEVELS[color];
    for (const [name, lvl] of Object.entries(COLOR_LEVELS)) {
        if (lvl === level + 1) return name;
    }
    return color;
}

// 更新品质显示
function updateQualityDisplay(quality) {
    document.getElementById('qualityDisplay').value = quality;
    document.getElementById('resultQuality').textContent = quality;
    calculatePrice();
}

// 计算价格
function calculatePrice() {
    const name = document.getElementById('name').value;
    const grade = document.getElementById('grade').value;
    const quality = document.getElementById('qualityDisplay').value;
    const qualityLevel = COLOR_LEVELS[quality] || 1;
    const effectCount = document.querySelectorAll('.effect-item').length;
    
    // 更新基本信息显示
    document.getElementById('resultName').textContent = name || "未命名";
    document.getElementById('resultGrade').textContent = grade;
    document.getElementById('resultEffectCount').textContent = effectCount;
    
    let basePrice = 0;
    let multiplier = 0;
    
    switch(grade) {
        case 'D':
            basePrice = 500;
            break;
        case 'C':
            basePrice = 1000;
            multiplier = 500;
            break;
        case 'B':
            basePrice = 3000;
            multiplier = 1000;
            break;
        case 'A':
            basePrice = 8000;
            multiplier = 2000;
            break;
        case 'S':
            alert('S级物品暂不开放兑换');
            return;
    }
    
    const totalPrice = basePrice + (multiplier * qualityLevel * effectCount);
    
    // 更新价格显示
    document.getElementById('resultPrice').textContent = totalPrice;
    document.getElementById('priceResult').style.display = 'block';
}

