// 武器等级映射
const WEAPON_GRADE_VALUES = {
    'D': 1,
    'C': 2,
    'B': 3,
    'A': 4,
    'S': 5
};

// 计算武器总值
function calculateTotalValue(grade) {
    const x = WEAPON_GRADE_VALUES[grade] || 1;
    return Math.pow(x + 1, 2); // (x+1)²
}

// 计算防御值（基于攻击值）
function calculateDefence() {
    const grade = document.getElementById('grade').value;
    const totalValue = calculateTotalValue(grade);
    const attack = parseInt(document.getElementById('attack').value) || 0;
    
    // 计算防御值
    const defence = Math.max(0, Math.min(totalValue - attack, totalValue));
    document.getElementById('defence').value = defence;
    
    // 检查比例区间
    checkWeaponRatio(attack, defence);
    calculatePrice();
}

// 计算攻击值（基于防御值）
function calculateAttack() {
    const grade = document.getElementById('grade').value;
    const totalValue = calculateTotalValue(grade);
    const defence = parseInt(document.getElementById('defence').value) || 0;
    
    // 计算攻击值
    const attack = Math.max(0, Math.min(totalValue - defence, totalValue));
    document.getElementById('attack').value = attack;
    
    // 检查比例区间
    checkWeaponRatio(attack, defence);
    calculatePrice();
}

// 检查武器比例区间
function checkWeaponRatio(attack, defence) {
    const statsError = document.getElementById('statsError');
    
    if (attack === 0 || defence === 0) {
        statsError.style.display = 'none';
        return;
    }
    
    const ratio = defence / attack;
    
    if (ratio < 1/3) {
        statsError.style.display = 'block';
        statsError.textContent = '脆刃：武器可能被击毁';
    } 
    else if (ratio > 2/3) {
        statsError.style.display = 'block';
        statsError.textContent = '钝刃：攻击效果减弱';
    }
    else {
        statsError.style.display = 'none';
    }
}

// 初始化武器事件监听
function initWeaponEvents() {
    document.getElementById('attack').addEventListener('input', calculateDefence);
    document.getElementById('defence').addEventListener('input', calculateAttack);
    document.getElementById('grade').addEventListener('change', () => {
        calculateDefence();
    });
}

// 获取URL参数
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 保存武器到系列
function saveToSeries(weapon) {
    const seriesId = getUrlParam('fromSeries');
    if (!seriesId) return;
    
    const seriesData = JSON.parse(localStorage.getItem('seriesData') || '[]');
    const series = seriesData.find(s => s.id === seriesId);
    if (!series) return;
    
    // 检查是否已存在
    const exists = series.resources.some(r => 
        r.type === 'weapon' && r.data.name === weapon.name
    );
    
    if (!exists) {
        series.resources.push({
            id: `weapon_${weapon.name}`,
            name: weapon.name,
            type: 'weapon',
            data: weapon
        });
        localStorage.setItem('seriesData', JSON.stringify(seriesData));
    }
}

// 颜色种子映射
const COLOR_SEEDS = {
    '白色': 100,
    '绿色': 200,
    '蓝色': 300,
    '紫色': 400,
    '金色': 500,
    '红色': 600
};

// 保存武器数据
function saveItem() {
    // 收集武器数据
    const weaponData = {
        name: document.getElementById('name').value,
        essence: document.getElementById('essence').value,
        grade: document.getElementById('grade').value,
        quality: document.getElementById('qualityDisplay').value,
        attack: parseInt(document.getElementById('attack').value) || 0,
        defence: parseInt(document.getElementById('defence').value) || 0,
        description: document.getElementById('description').value,
        author: document.getElementById('author').value,
        effects: Array.from(document.querySelectorAll('.effect-item')).map(item => ({
            text: item.querySelector('.effect-input').value,
            color: item.querySelector('.effect-quality').options[item.querySelector('.effect-quality').selectedIndex].text
        }))
    };
    
    // 保存到本地存储
    let weapons = JSON.parse(localStorage.getItem('weapons') || '[]');
    weapons.push(weaponData);
    localStorage.setItem('weapons', JSON.stringify(weapons));
    
    // 调用现有的系列保存功能
    saveToSeries(weaponData);
    
    alert('武器保存成功');
    
    const fromSeries = getUrlParam('fromSeries');
    if (fromSeries) {
        window.location.href = `xilie.html?id=${fromSeries}`;
        return;
    }
}

function exportToTxt() {
    const name = document.getElementById('name').value;
    const essence = document.getElementById('essence').value;
    const grade = document.getElementById('grade').value;
    const quality = document.getElementById('qualityDisplay').value;
    const description = document.getElementById('description').value;
    const author = document.getElementById('author').value;
    const attack = parseInt(document.getElementById('attack').value) || 0;
    const defence = parseInt(document.getElementById('defence').value) || 0;
    const price = document.getElementById('resultPrice').textContent || '0';
    let statsWarning = '';
    
    if (attack > 0 && defence > 0) {
        const ratio = defence / attack;
        if (ratio < 1/3) {
            statsWarning = '脆刃：武器可能被击毁';
        } 
        else if (ratio > 2/3) {
            statsWarning = '钝刃：攻击效果减弱';
        }
    }

    // 收集词条效果
    const effects = Array.from(document.querySelectorAll('.effect-item')).map((item, index) => {
        const text = item.querySelector('.effect-input').value;
        const color = item.querySelector('.effect-quality').options[item.querySelector('.effect-quality').selectedIndex].text;
        const seed = COLOR_SEEDS[color] || 0;
        return `${index + 1}. ${color}词条: ${text} (种子: ${seed})`;
    }).join('\n');

    // 获取品质对应的颜色名称
    const qualityName = Object.entries(COLOR_LEVELS).find(([name, lvl]) => lvl === COLOR_LEVELS[quality])?.[0] || quality;
    const totalSeed = `${document.querySelectorAll('.effect-item').length}x${qualityName}`;

    const content = `武器名称: ${name}
本质: ${essence}
等级: ${grade}
品质: ${quality}
攻击值: ${attack}
防御值: ${defence}
${statsWarning ? '警告: ' + statsWarning + '\n' : ''}
词条效果:
${effects}

描述:
${description}

价格: ${price} 积分
种子: ${totalSeed}

撰写人: ${author}`;

    // 创建下载链接
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name || '未命名武器'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 初始化
window.addEventListener('DOMContentLoaded', () => {
    initWeaponEvents();
    
    // 设置初始值
    const grade = document.getElementById('grade').value;
    const totalValue = calculateTotalValue(grade);
    const defaultAttack = Math.floor(totalValue * 0.6);
    const defaultDefence = totalValue - defaultAttack;
    
    document.getElementById('attack').value = defaultAttack;
    document.getElementById('defence').value = defaultDefence;

    // 检查是否有来自系列的跳转
    const seriesId = getUrlParam('fromSeries');
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
});
