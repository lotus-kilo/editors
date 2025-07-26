// 魔法书数据
let books = [];
let currentBookId = null;

// 初始化
window.addEventListener('DOMContentLoaded', () => {
    loadBooks();
    loadMagics();
    setupEventListeners();
});

// 加载所有魔法书
function loadBooks() {
    books = JSON.parse(localStorage.getItem('magicBooks') || '[]');
    const bookList = document.getElementById('bookList');
    
    bookList.innerHTML = '';
    
    if (books.length === 0) {
        createNewBook();
        return;
    }
    
    books.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';
        bookItem.textContent = book.name;
        bookItem.addEventListener('click', () => switchBook(book.id));
        bookList.appendChild(bookItem);
    });
    
    // 默认选中第一本
    if (books.length > 0 && !currentBookId) {
        switchBook(books[0].id);
    }
}

// 创建新魔法书
function createNewBook() {
    const newBook = {
        id: Date.now().toString(),
        name: '新魔法书',
        author: '',
        description: '',
        magics: []
    };
    
    books.push(newBook);
    saveBooks();
    
    const bookList = document.getElementById('bookList');
    const bookItem = document.createElement('div');
    bookItem.className = 'book-item';
    bookItem.textContent = newBook.name;
    bookItem.addEventListener('click', () => switchBook(newBook.id));
    bookList.appendChild(bookItem);
    
    switchBook(newBook.id);
}

// 切换当前魔法书
function switchBook(bookId) {
    currentBookId = bookId;
    const book = books.find(b => b.id === bookId);
    
    if (!book) return;
    
    // 更新UI选中状态
    document.querySelectorAll('.book-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.book-item[data-id="${bookId}"]`)?.classList.add('active');
    
    // 填充表单
    document.getElementById('bookName').value = book.name;
    document.getElementById('bookAuthor').value = book.author;
    document.getElementById('bookDescription').value = book.description;
    
    // 更新已选魔法
    updateSelectedMagics();
}

// 保存所有魔法书
function saveBooks() {
    localStorage.setItem('magicBooks', JSON.stringify(books));
}

// 保存当前魔法书
function saveCurrentBook() {
    const book = books.find(b => b.id === currentBookId);
    if (!book) return;
    
    book.name = document.getElementById('bookName').value;
    book.author = document.getElementById('bookAuthor').value;
    book.description = document.getElementById('bookDescription').value;
    
    saveBooks();
    updateBookList();
}

// 更新书列表显示
function updateBookList() {
    const bookList = document.getElementById('bookList');
    bookList.innerHTML = '';
    
    books.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';
        bookItem.textContent = book.name;
        bookItem.setAttribute('data-id', book.id);
        if (book.id === currentBookId) {
            bookItem.classList.add('active');
        }
        bookItem.addEventListener('click', () => switchBook(book.id));
        bookList.appendChild(bookItem);
    });
}

// 加载可用魔法
function loadMagics() {
    const savedMagics = JSON.parse(localStorage.getItem('magics') || '[]');
    const magicItems = document.getElementById('magicItems');
    
    magicItems.innerHTML = '';
    
    savedMagics.forEach(magic => {
        const magicItem = document.createElement('div');
        magicItem.className = 'magic-item';
        magicItem.innerHTML = `
            <strong>${magic.name}</strong> (${magic.grade}) - ${magic.color}
            <div>${magic.effect.substring(0, 30)}...</div>
        `;
        magicItem.addEventListener('click', () => addMagicToBook(magic));
        magicItems.appendChild(magicItem);
    });
}

// 添加魔法到当前书
function addMagicToBook(magic) {
    const book = books.find(b => b.id === currentBookId);
    if (!book) return;
    
    if (!book.magics.some(m => m.name === magic.name && m.author === magic.author)) {
        book.magics.push({...magic});
        updateSelectedMagics();
        saveBooks();
    }
}

// 从当前书移除魔法
function removeMagicFromBook(index) {
    const book = books.find(b => b.id === currentBookId);
    if (!book) return;
    
    book.magics.splice(index, 1);
    updateSelectedMagics();
    saveBooks();
}

// 更新已选魔法显示
function updateSelectedMagics() {
    const book = books.find(b => b.id === currentBookId);
    if (!book) return;
    
    const selectedMagics = document.getElementById('selectedMagics');
    selectedMagics.innerHTML = '<h3>已选魔法</h3>';
    
    if (book.magics.length === 0) {
        selectedMagics.innerHTML += '<p>暂无已选魔法</p>';
        return;
    }
    
    book.magics.forEach((magic, index) => {
        const magicDiv = document.createElement('div');
        magicDiv.className = 'selected-magic';
        magicDiv.innerHTML = `
            <span>${magic.name} (${magic.grade})</span>
            <button onclick="removeMagicFromBook(${index})">移除</button>
        `;
        selectedMagics.appendChild(magicDiv);
    });
}

// 显示导入对话框
function showImportDialog() {
    // 加载可导入的魔法书
    const importBookSelect = document.getElementById('importBookSelect');
    importBookSelect.innerHTML = '';
    
    books.filter(b => b.id !== currentBookId).forEach(book => {
        const option = document.createElement('option');
        option.value = book.id;
        option.textContent = book.name;
        importBookSelect.appendChild(option);
    });
    
    // 切换到导入标签页
    showTab('importMagics');
}

// 从其他书导入魔法
function importFromBook() {
    const importBookSelect = document.getElementById('importBookSelect');
    const sourceBookId = importBookSelect.value;
    const sourceBook = books.find(b => b.id === sourceBookId);
    const currentBook = books.find(b => b.id === currentBookId);
    
    if (!sourceBook || !currentBook) return;
    
    // 添加不重复的魔法
    sourceBook.magics.forEach(magic => {
        if (!currentBook.magics.some(m => m.name === magic.name && m.author === magic.author)) {
            currentBook.magics.push({...magic});
        }
    });
    
    updateSelectedMagics();
    saveBooks();
}

// 切换标签页
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`.tab-btn[onclick="showTab('${tabId}')"]`).classList.add('active');
}

// 导出当前魔法书
function exportBook() {
    const book = books.find(b => b.id === currentBookId);
    if (!book) return;
    
    // 更新书信息
    book.name = document.getElementById('bookName').value;
    book.author = document.getElementById('bookAuthor').value;
    book.description = document.getElementById('bookDescription').value;
    saveBooks();
    
    if (!book.name || !book.author) {
        alert('请填写魔法书名称和作者');
        return;
    }
    
    // 生成导出内容
    let content = `魔法书名称: ${book.name}\n`;
    content += `作者: ${book.author}\n`;
    content += `描述: ${book.description}\n\n`;
    content += `包含魔法(${book.magics.length}个):\n\n`;
    
    book.magics.forEach(magic => {
        content += `=== ${magic.name} ===\n`;
        content += `等级: ${magic.grade}\n`;
        content += `颜色: ${magic.color}\n`;
        content += `魔力花费: ${magic.minCost}-${magic.maxCost}\n`;
        content += `效果:\n${magic.effect}\n\n`;
    });
    
    // 创建下载
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.name}_魔法书.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// 添加新魔法
function addNewMagic() {
    if (!currentBookId) {
        alert('请先创建或选择一本魔法书');
        return;
    }
    
    // 保存当前魔法书状态
    saveCurrentBook();
    
    // 跳转到魔法编辑页面，并传递当前魔法书ID
    window.location.href = `magic.html?bookId=${currentBookId}`;
}

// 设置事件监听
function setupEventListeners() {
    document.getElementById('bookName').addEventListener('input', saveCurrentBook);
    document.getElementById('bookAuthor').addEventListener('input', saveCurrentBook);
    document.getElementById('bookDescription').addEventListener('input', saveCurrentBook);
}
