// 数据管理
class DataManager {
    constructor() {
        this.STORAGE_KEY = 'moneytracker_data';
        this.data = this.loadData();
    }

    loadData() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        return {
            transactions: [],
            accounts: [
                { id: '1', name: '现金', balance: 0, type: 'cash' },
                { id: '2', name: '银行卡', balance: 0, type: 'bank' },
                { id: '3', name: '支付宝', balance: 0, type: 'alipay' },
                { id: '4', name: '微信', balance: 0, type: 'wechat' }
            ],
            categories: {
                expense: ['餐饮', '交通', '购物', '娱乐', '医疗', '住房', '教育', '通讯', '其他'],
                income: ['工资', '奖金', '理财', '兼职', '礼金', '报销', '其他']
            }
        };
    }

    saveData() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    }

    addTransaction(transaction) {
        transaction.id = Date.now().toString();
        transaction.date = new Date().toISOString();
        this.data.transactions.unshift(transaction);
        this.updateAccountBalance(transaction);
        this.saveData();
        return transaction;
    }

    deleteTransaction(id) {
        const transaction = this.data.transactions.find(t => t.id === id);
        if (transaction) {
            this.reverseAccountBalance(transaction);
            this.data.transactions = this.data.transactions.filter(t => t.id !== id);
            this.saveData();
        }
    }

    updateAccountBalance(transaction) {
        const account = this.data.accounts.find(a => a.name === transaction.account);
        if (account) {
            if (transaction.type === 'income') {
                account.balance += parseFloat(transaction.amount);
            } else {
                account.balance -= parseFloat(transaction.amount);
            }
        }
    }

    reverseAccountBalance(transaction) {
        const account = this.data.accounts.find(a => a.name === transaction.account);
        if (account) {
            if (transaction.type === 'income') {
                account.balance -= parseFloat(transaction.amount);
            } else {
                account.balance += parseFloat(transaction.amount);
            }
        }
    }

    getTotalBalance() {
        return this.data.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    }

    getMonthlyIncome() {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        return this.data.transactions
            .filter(t => t.type === 'income' && new Date(t.date) >= firstDay)
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    }

    getMonthlyExpense() {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        return this.data.transactions
            .filter(t => t.type === 'expense' && new Date(t.date) >= firstDay)
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    }

    getRecentTransactions(limit = 5) {
        return this.data.transactions.slice(0, limit);
    }

    getAllTransactions() {
        return this.data.transactions;
    }

    getCategories(type) {
        return this.data.categories[type] || [];
    }

    getAccounts() {
        return this.data.accounts;
    }
}

// 全局状态
const dataManager = new DataManager();
let currentType = 'expense';
let selectedCategory = '';
let currentPage = 'home';

// 分类图标映射
const categoryIcons = {
    // 支出分类
    '餐饮': '🍜',
    '交通': '🚗',
    '购物': '🛍️',
    '娱乐': '🎮',
    '医疗': '💊',
    '住房': '🏠',
    '教育': '📚',
    '通讯': '📱',
    '其他': '💰',
    // 收入分类
    '工资': '💼',
    '奖金': '🎁',
    '理财': '📈',
    '兼职': '💻',
    '礼金': '🧧',
    '报销': '📄'
};

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    updateDashboard();
    renderRecentTransactions();
    
    // 注册 Service Worker（PWA 支持）
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => {
            console.log('Service Worker registration failed:', err);
        });
    }
});

// 更新首页统计数据
function updateDashboard() {
    document.getElementById('totalBalance').textContent = formatMoney(dataManager.getTotalBalance());
    document.getElementById('monthIncome').textContent = formatMoney(dataManager.getMonthlyIncome());
    document.getElementById('monthExpense').textContent = formatMoney(dataManager.getMonthlyExpense());
}

// 格式化金额
function formatMoney(amount) {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (targetDate.getTime() === today.getTime()) {
        return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (targetDate.getTime() === yesterday.getTime()) {
        return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else {
        return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) + ' ' + 
               date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
}

// 渲染最近交易
function renderRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    const transactions = dataManager.getRecentTransactions(5);
    
    if (transactions.length === 0) {
        container.innerHTML = `
            <li class="empty-state">
                <div class="empty-icon">📊</div>
                <div>暂无交易记录</div>
                <div style="margin-top: 8px; font-size: 13px;">点击上方按钮开始记账</div>
            </li>
        `;
        return;
    }
    
    container.innerHTML = transactions.map(t => `
        <li class="transaction-item">
            <div class="transaction-icon ${t.type}">
                ${categoryIcons[t.category] || '💰'}
            </div>
            <div class="transaction-info">
                <div class="transaction-category">${t.category}</div>
                <div class="transaction-note">${t.note || formatDate(t.date)}</div>
            </div>
            <div class="transaction-amount ${t.type}">
                ${t.type === 'income' ? '+' : '-'}¥${formatMoney(parseFloat(t.amount))}
            </div>
        </li>
    `).join('');
}

// 渲染全部交易
function renderAllTransactions() {
    const container = document.getElementById('allTransactions');
    const transactions = dataManager.getAllTransactions();
    
    if (transactions.length === 0) {
        container.innerHTML = `
            <li class="empty-state">
                <div class="empty-icon">📊</div>
                <div>暂无交易记录</div>
            </li>
        `;
        return;
    }
    
    container.innerHTML = transactions.map(t => `
        <li class="transaction-item" onclick="deleteTransactionConfirm('${t.id}')">
            <div class="transaction-icon ${t.type}">
                ${categoryIcons[t.category] || '💰'}
            </div>
            <div class="transaction-info">
                <div class="transaction-category">${t.category}</div>
                <div class="transaction-note">${t.note || formatDate(t.date)}</div>
            </div>
            <div class="transaction-amount ${t.type}">
                ${t.type === 'income' ? '+' : '-'}¥${formatMoney(parseFloat(t.amount))}
            </div>
        </li>
    `).join('');
}

// 删除交易确认
function deleteTransactionConfirm(id) {
    if (confirm('确定要删除这条记录吗？')) {
        dataManager.deleteTransaction(id);
        updateDashboard();
        renderRecentTransactions();
        renderAllTransactions();
    }
}

// 打开添加记录模态框
function openAddModal(type = 'expense') {
    currentType = type;
    selectedCategory = '';
    
    document.getElementById('addModal').classList.add('show');
    document.getElementById('amountInput').value = '';
    document.getElementById('noteInput').value = '';
    
    // 更新类型按钮状态
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });
    
    // 渲染分类
    renderCategories();
    
    // 聚焦金额输入框
    setTimeout(() => {
        document.getElementById('amountInput').focus();
    }, 300);
}

// 关闭添加记录模态框
function closeAddModal() {
    document.getElementById('addModal').classList.remove('show');
}

// 切换交易类型
function switchType(type) {
    currentType = type;
    selectedCategory = '';
    
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });
    
    renderCategories();
}

// 渲染分类选择
function renderCategories() {
    const container = document.getElementById('categoryGrid');
    const categories = dataManager.getCategories(currentType);
    
    container.innerHTML = categories.map(cat => `
        <div class="category-item ${selectedCategory === cat ? 'active' : ''}" 
             onclick="selectCategory('${cat}')">
            <div class="category-icon">${categoryIcons[cat] || '💰'}</div>
            <div class="category-name">${cat}</div>
        </div>
    `).join('');
}

// 选择分类
function selectCategory(category) {
    selectedCategory = category;
    renderCategories();
}

// 保存交易记录
function saveTransaction() {
    const amount = document.getElementById('amountInput').value;
    const note = document.getElementById('noteInput').value;
    
    // 验证
    if (!amount || parseFloat(amount) <= 0) {
        alert('请输入有效的金额');
        return;
    }
    
    if (!selectedCategory) {
        alert('请选择分类');
        return;
    }
    
    // 创建交易记录
    const transaction = {
        amount: parseFloat(amount),
        type: currentType,
        category: selectedCategory,
        account: '现金', // 默认账户
        note: note.trim()
    };
    
    // 保存
    dataManager.addTransaction(transaction);
    
    // 更新界面
    updateDashboard();
    renderRecentTransactions();
    if (currentPage === 'list') {
        renderAllTransactions();
    }
    
    // 关闭模态框
    closeAddModal();
    
    // 显示成功提示
    showToast(`已记录${currentType === 'income' ? '收入' : '支出'} ¥${formatMoney(parseFloat(amount))}`);
}

// 显示提示信息
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 70px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 300;
        animation: fadeIn 0.3s;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// 切换页面
function switchPage(page) {
    currentPage = page;
    
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // 显示目标页面
    document.getElementById(page + 'Page').classList.add('active');
    
    // 更新导航栏标题
    const titles = {
        'home': '首页',
        'list': '明细',
        'stats': '统计',
        'settings': '设置'
    };
    document.getElementById('pageTitle').textContent = titles[page];
    
    // 更新底部导航状态
    document.querySelectorAll('.nav-item').forEach((item, index) => {
        const pages = ['home', 'list', 'stats', 'settings'];
        item.classList.toggle('active', pages[index] === page);
    });
    
    // 渲染对应页面内容
    if (page === 'list') {
        renderAllTransactions();
    }
}

// 阻止模态框内容点击冒泡
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.modal-content')?.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // 点击模态框背景关闭
    document.getElementById('addModal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            closeAddModal();
        }
    });
});
