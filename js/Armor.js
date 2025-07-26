// 护甲类型定义
const ARMOR_TYPES = {
    HEAVY: 'heavy',
    MEDIUM: 'medium',
    LIGHT: 'light'
};

// 护甲等级映射
const ARMOR_GRADE_VALUES = {
    'D': 1,
    'C': 2,
    'B': 4,
    'A': 8,
    'S': 16
};

// 当前护甲类型
let currentArmorType = ARMOR_TYPES.HEAVY;

// 初始化护甲类型选择
function initArmorType() {
    const armorTypeSelect = document.createElement('select');
    armorTypeSelect.id = 'armorType';
    armorTypeSelect.innerHTML = `
        <option value="${ARMOR_TYPES.HEAVY}">重甲</option>
        <option value="${ARMOR_TYPES.MEDIUM}">中甲</option>
        <option value="${ARMOR_TYPES.LIGHT}">轻甲</option>
    `;
    armorTypeSelect.addEventListener('change', (e) => {
        currentArmorType = e.target.value;
        updateArmorValues();
    });

    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    formGroup.innerHTML = '<label for="armorType">护甲类型</label>';
    formGroup.appendChild(armorTypeSelect);

    const form = document.getElementById('itemForm');
    form.insertBefore(formGroup, document.querySelector('.form-group label[for="qualityDisplay"]').parentNode.nextSibling);
}

// 计算基础护甲值
function calculateBaseArmor() {
    const grade = document.getElementById('grade').value;
    const x = ARMOR_GRADE_VALUES[grade] || 1;
    
    switch(currentArmorType) {
        case ARMOR_TYPES.HEAVY: return 2 * (x + 3);
        case ARMOR_TYPES.MEDIUM: return 2 * (x + 2);
        case ARMOR_TYPES.LIGHT: return 2 * (x + 1);
        default: return 0;
    }
}

// 更新护甲显示
function updateArmorDisplay() {
    const baseArmor = calculateBaseArmor();
    const totalArmorValue = baseArmor * 10;
    
    // 获取当前输入值并确保为整数
    let physicalArmorValue = Math.max(0, Math.floor(parseInt(document.getElementById('physicalArmorValue').value) || 0));
    let magicArmorValue = Math.max(0, Math.floor(parseInt(document.getElementById('magicArmorValue').value) || 0));
    
    // 调整分配以保持总和不变
    const sum = physicalArmorValue + magicArmorValue;
    if (sum !== totalArmorValue) {
        physicalArmorValue = Math.floor(totalArmorValue * 0.7);
        magicArmorValue = totalArmorValue - physicalArmorValue;
    }
    
    // 更新显示
    document.getElementById('physicalArmorValue').value = physicalArmorValue;
    document.getElementById('magicArmorValue').value = magicArmorValue;
    document.getElementById('physicalArmor').value = physicalArmorValue / 10;
    document.getElementById('magicArmor').value = magicArmorValue / 10;
    document.getElementById('totalArmorValue').value = totalArmorValue;
    
    // 更新装备要求
    let requirement = '';
    switch(currentArmorType) {
        case ARMOR_TYPES.HEAVY:
            requirement = `力量必须大于${baseArmor}`;
            break;
        case ARMOR_TYPES.MEDIUM:
            requirement = `体质+力量+敏捷必须大于${baseArmor * 2}`;
            break;
    }
    
    // 添加重甲的特殊debuff
    if (currentArmorType === ARMOR_TYPES.HEAVY) {
        const x = ARMOR_GRADE_VALUES[document.getElementById('grade').value] || 1;
        requirement += ` | 所有敏捷判定以及闪避判定点数都减去${2 * x}`;
    }
    
    document.getElementById('armorRequirement').value = requirement || '无要求';
}

// 从护甲值反向计算
function updateArmorFromValue(type) {
    const totalArmorValue = calculateBaseArmor() * 10;
    const value = Math.max(0, Math.min(totalArmorValue, 
                      Math.floor(parseInt(document.getElementById(`${type}ArmorValue`).value) || 0)));
    
    // 更新当前类型值
    document.getElementById(`${type}ArmorValue`).value = value;
    document.getElementById(`${type}Armor`).value = value / 10;
    
    // 计算并更新另一类型值
    const otherType = type === 'physical' ? 'magic' : 'physical';
    const otherValue = totalArmorValue - value;
    
    document.getElementById(`${otherType}ArmorValue`).value = otherValue;
    document.getElementById(`${otherType}Armor`).value = otherValue / 10;
}

// 处理护甲输入变化
function handleArmorChange(sourceType) {
    const totalArmorValue = calculateBaseArmor() * 10;
    
    // 根据输入源类型确定计算方式
    let physicalArmor, magicArmor, physicalValue, magicValue;
    
    if (sourceType === 'physicalValue') {
        // 从物理护甲值计算
        physicalValue = Math.max(0, Math.min(totalArmorValue, 
                          Math.floor(parseInt(document.getElementById('physicalArmorValue').value) || 0)));
        magicValue = totalArmorValue - physicalValue;
        physicalArmor = physicalValue / 10;
        magicArmor = magicValue / 10;
    } 
    else if (sourceType === 'magicValue') {
        // 从法术护甲值计算
        magicValue = Math.max(0, Math.min(totalArmorValue, 
                         Math.floor(parseInt(document.getElementById('magicArmorValue').value) || 0)));
        physicalValue = totalArmorValue - magicValue;
        physicalArmor = physicalValue / 10;
        magicArmor = magicValue / 10;
    }
    else if (sourceType === 'physical') {
        // 从物理护甲计算
        physicalArmor = Math.max(0, parseFloat(document.getElementById('physicalArmor').value) || 0);
        physicalValue = Math.floor(physicalArmor * 10);
        magicValue = Math.max(0, totalArmorValue - physicalValue);
        magicArmor = magicValue / 10;
    }
    else if (sourceType === 'magic') {
        // 从法术护甲计算
        magicArmor = Math.max(0, parseFloat(document.getElementById('magicArmor').value) || 0);
        magicValue = Math.floor(magicArmor * 10);
        physicalValue = Math.max(0, totalArmorValue - magicValue);
        physicalArmor = physicalValue / 10;
    }
    
    // 确保所有值为整数
    physicalValue = Math.floor(physicalValue);
    magicValue = Math.floor(magicValue);
    physicalArmor = physicalValue / 10;
    magicArmor = magicValue / 10;
    
    // 更新所有字段
    document.getElementById('physicalArmor').value = physicalArmor;
    document.getElementById('magicArmor').value = magicArmor;
    document.getElementById('physicalArmorValue').value = physicalValue;
    document.getElementById('magicArmorValue').value = magicValue;
    document.getElementById('totalArmorValue').value = totalArmorValue;
    
    // 更新装备要求
    updateRequirements();
}

// 更新装备要求
function updateRequirements() {
    const baseArmor = calculateBaseArmor();
    let requirement = '';
    
    switch(currentArmorType) {
        case ARMOR_TYPES.HEAVY:
            requirement = `力量必须大于${baseArmor}`;
            break;
        case ARMOR_TYPES.MEDIUM:
            requirement = `体质+力量+敏捷必须大于${baseArmor * 2}`;
            break;
    }
    
    if (currentArmorType === ARMOR_TYPES.HEAVY) {
        const x = ARMOR_GRADE_VALUES[document.getElementById('grade').value] || 1;
        requirement += ` | 所有敏捷判定以及闪避判定点数都减去${2 * x}`;
    }
    
    document.getElementById('armorRequirement').value = requirement || '无要求';
}

// 获取URL参数
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 保存护甲到系列
function saveToSeries(armor) {
    const seriesId = getUrlParam('fromSeries');
    if (!seriesId) return;
    
    const seriesData = JSON.parse(localStorage.getItem('seriesData') || '[]');
    const series = seriesData.find(s => s.id === seriesId);
    if (!series) return;
    
    // 检查是否已存在
    const exists = series.resources.some(r => 
        r.type === 'armor' && r.data.name === armor.name
    );
    
    if (!exists) {
        series.resources.push({
            id: `armor_${armor.name}`,
            name: armor.name,
            type: 'armor',
            data: armor
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

function exportToTxt() {
    const name = document.getElementById('name').value;
    const essence = document.getElementById('essence').value;
    const grade = document.getElementById('grade').value;
    const quality = document.getElementById('qualityDisplay').value;
    const description = document.getElementById('description').value;
    const author = document.getElementById('author').value;
    const armorType = document.getElementById('armorType').value;
    const physicalArmor = document.getElementById('physicalArmor').value;
    const magicArmor = document.getElementById('magicArmor').value;
    const requirement = document.getElementById('armorRequirement').value;
    const price = document.getElementById('resultPrice').textContent || '0';

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

    const armorTypeName = {
        [ARMOR_TYPES.HEAVY]: '重甲',
        [ARMOR_TYPES.MEDIUM]: '中甲',
        [ARMOR_TYPES.LIGHT]: '轻甲'
    }[armorType] || armorType;

    const content = `物品名称: ${name}
本质: ${essence}
等级: ${grade}
品质: ${quality}
护甲类型: ${armorTypeName}
物理护甲: ${physicalArmor}
魔法护甲: ${magicArmor}
要求: ${requirement}

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
    a.download = `${name || '未命名护甲'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 初始化
// 保存护甲数据
function saveItem() {
    const fromSeries = getUrlParam('fromSeries');
    // 收集护甲数据
    const armorData = {
        name: document.getElementById('name').value,
        essence: document.getElementById('essence').value,
        grade: document.getElementById('grade').value,
        quality: document.getElementById('qualityDisplay').value,
        type: document.getElementById('armorType').value,
        physicalArmor: document.getElementById('physicalArmor').value,
        magicArmor: document.getElementById('magicArmor').value,
        requirement: document.getElementById('armorRequirement').value,
        description: document.getElementById('description').value,
        author: document.getElementById('author').value,
        effects: Array.from(document.querySelectorAll('.effect-item')).map(item => ({
            text: item.querySelector('.effect-input').value,
            color: item.querySelector('.effect-quality').options[item.querySelector('.effect-quality').selectedIndex].text
        }))
    };
    
    // 保存到本地存储
    let armors = JSON.parse(localStorage.getItem('armors') || '[]');
    armors.push(armorData);
    localStorage.setItem('armors', JSON.stringify(armors));
    
    // 调用现有的系列保存功能
    saveToSeries(armorData);
    
    alert('护甲保存成功');
    
    if (fromSeries) {
        window.location.href = `xilie.html?id=${fromSeries}`;
        return;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    initArmorType();
    
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
    
    // 初始化事件监听
    document.getElementById('grade').addEventListener('change', () => {
        handleArmorChange('physicalValue'); // 任意类型触发重新计算
    });
    document.getElementById('armorType').addEventListener('change', () => {
        handleArmorChange('physicalValue'); // 任意类型触发重新计算
    });
    
    // 设置所有护甲字段的输入监听
    document.getElementById('physicalArmor').addEventListener('input', () => handleArmorChange('physical'));
    document.getElementById('magicArmor').addEventListener('input', () => handleArmorChange('magic'));
    document.getElementById('physicalArmorValue').addEventListener('input', () => handleArmorChange('physicalValue'));
    document.getElementById('magicArmorValue').addEventListener('input', () => handleArmorChange('magicValue'));
    
    // 初始更新
    handleArmorChange('physicalValue');
});
