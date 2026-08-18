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
                expense: [
                    {id: 'c1', name: '餐饮', icon: '🍜', color: '#FF9500'},
                    {id: 'c2', name: '交通', icon: '🚗', color: '#007AFF'},
                    {id: 'c3', name: '购物', icon: '🛍️', color: '#FF2D55'},
                    {id: 'c4', name: '住房', icon: '🏠', color: '#5856D6'},
                    {id: 'c5', name: '娱乐', icon: '🎮', color: '#AF52DE'},
                    {id: 'c6', name: '医疗', icon: '💊', color: '#FF3B30'},
                    {id: 'c7', name: '教育', icon: '📚', color: '#5AC8FA'},
                    {id: 'c8', name: '通讯', icon: '📱', color: '#8E8E93'},
                    {id: 'c9', name: '其他', icon: '💰', color: '#8E8E93'}
                ],
                income: [
                    {id: 'i1', name: '工资', icon: '💼', color: '#34C759'},
                    {id: 'i2', name: '奖金', icon: '🎁', color: '#FF9500'},
                    {id: 'i3', name: '理财', icon: '📈', color: '#5856D6'},
                    {id: 'i4', name: '兼职', icon: '💻', color: '#5AC8FA'},
                    {id: 'i5', name: '礼金', icon: '🧧', color: '#FF3B30'},
                    {id: 'i6', name: '报销', icon: '📄', color: '#8E8E93'},
                    {id: 'i7', name: '其他', icon: '💰', color: '#8E8E93'}
                ]
            },
            settings: {
                currency: '¥',
                startOfWeek: 1, // 1=周一, 0=周日
                budgetAlert: true,
                monthlyBudget: 0
            }
        };
    }

    saveData() {
        try {
            const dataStr = JSON.stringify(this.data);
            // 检查存储容量（localStorage 限制通常为 5-10MB）
            if (dataStr.length > 4.5 * 1024 * 1024) {
                // 超过 4.5MB，自动清理 6 个月前的记录
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                this.data.transactions = this.data.transactions.filter(t => 
                    new Date(t.date) > sixMonthsAgo
                );
                console.warn('已自动清理 6 个月前的记录以节省空间');
            }
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                alert('存储空间已满，请导出数据后清理旧记录');
                // 紧急清理：仅保留最近 3 个月
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                this.data.transactions = this.data.transactions.filter(t => 
                    new Date(t.date) > threeMonthsAgo
                );
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
            } else {
                throw e;
            }
        }
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

    // 获取分类统计（按月）
    getCategoryStats(type, month = null) {
        const now = new Date();
        const targetMonth = month || now.getMonth();
        const targetYear = now.getFullYear();
        
        const filtered = this.data.transactions.filter(t => {
            const date = new Date(t.date);
            return t.type === type && 
                   date.getMonth() === targetMonth && 
                   date.getFullYear() === targetYear;
        });

        const stats = {};
        filtered.forEach(t => {
            if (!stats[t.category]) {
                stats[t.category] = 0;
            }
            stats[t.category] += parseFloat(t.amount);
        });

        return Object.entries(stats)
            .map(([name, amount]) => ({name, amount}))
            .sort((a, b) => b.amount - a.amount);
    }

    // 获取每日统计
    getDailyStats(days = 30) {
        const now = new Date();
        const stats = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayTransactions = this.data.transactions.filter(t => 
                t.date.startsWith(dateStr)
            );
            
            const income = dayTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
            
            const expense = dayTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
            
            stats.push({
                date: dateStr,
                dateLabel: `${date.getMonth() + 1}/${date.getDate()}`,
                income,
                expense
            });
        }
        
        return stats;
    }

    // 导出数据
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    // 获取设置
    getSettings() {
        return this.data.settings || {};
    }

    // 更新设置
    updateSettings(newSettings) {
        this.data.settings = {...this.data.settings, ...newSettings};
        this.saveData();
    }
}

// 全局状态
const dataManager = new DataManager();
let currentType = 'expense';
let selectedCategory = '';
let currentPage = 'home';

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
    
    container.innerHTML = transactions.map(t => {
        const cat = getCategoryInfo(t.category, t.type);
        const categoryName = cat.name || t.category || '未分类';
        return `
        <li class="transaction-item">
            <div class="transaction-icon ${t.type}">
                ${cat.icon}
            </div>
            <div class="transaction-info">
                <div class="transaction-category">${categoryName}</div>
                <div class="transaction-note">${t.note || formatDate(t.date)}</div>
            </div>
            <div class="transaction-amount ${t.type}">
                ${t.type === 'income' ? '+' : '-'}¥${formatMoney(parseFloat(t.amount))}
            </div>
        </li>
    `}).join('');
}

// 渲染全部交易（支持删除）
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
    
    container.innerHTML = transactions.map(t => {
        const cat = getCategoryInfo(t.category, t.type);
        const categoryName = cat.name || t.category || '未分类';
        return `
        <li class="transaction-item swipeable" data-id="${t.id}">
            <div class="transaction-content">
                <div class="transaction-icon ${t.type}">
                    ${cat.icon}
                </div>
                <div class="transaction-info">
                    <div class="transaction-category">${categoryName}</div>
                    <div class="transaction-note">${t.note || formatDate(t.date)}</div>
                </div>
                <div class="transaction-amount ${t.type}">
                    ${t.type === 'income' ? '+' : '-'}¥${formatMoney(parseFloat(t.amount))}
                </div>
            </div>
            <div class="delete-btn" onclick="deleteTransactionConfirm('${t.id}')">
                🗑️ 删除
            </div>
        </li>
    `}).join('');

    // 添加滑动删除功能
    setupSwipeDelete();
}

// 设置滑动删除
function setupSwipeDelete() {
    const items = document.querySelectorAll('.swipeable');
    items.forEach(item => {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        const content = item.querySelector('.transaction-content');

        item.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            content.style.transition = 'none';
        });

        item.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            const diff = startX - currentX;
            
            if (diff > 0 && diff < 80) {
                content.style.transform = `translateX(-${diff}px)`;
            }
        });

        item.addEventListener('touchend', () => {
            const diff = startX - currentX;
            content.style.transition = 'transform 0.3s';
            if (diff > 40) {
                content.style.transform = 'translateX(-80px)';
            } else {
                content.style.transform = 'translateX(0)';
            }
            isDragging = false;
        });
        
        // 点击其他区域时收回删除按钮
        document.addEventListener('touchstart', (e) => {
            if (!item.contains(e.target)) {
                content.style.transform = 'translateX(0)';
            }
        });
    });
}

// 获取分类信息
function getCategoryInfo(name, type) {
    const categories = dataManager.getCategories(type);
    const found = categories.find(c => c.name === name);
    return found || {name: name || '未分类', icon: '💰', color: '#8E8E93'};
}

// 删除交易确认
function deleteTransactionConfirm(id) {
    if (confirm('确定要删除这条记录吗？')) {
        dataManager.deleteTransaction(id);
        updateDashboard();
        renderRecentTransactions();
        if (currentPage === 'list') {
            renderAllTransactions();
        }
        if (currentPage === 'stats') {
            renderStats();
        }
        showToast('已删除');
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
        <div class="category-item ${selectedCategory === cat.name ? 'active' : ''}" 
             onclick="selectCategory('${cat.name}')">
            <div class="category-icon">${cat.icon}</div>
            <div class="category-name">${cat.name}</div>
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
    
    // 验证金额
    if (!amount || amount.trim() === '') {
        showToast('请输入金额');
        return;
    }
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        showToast('请输入有效的金额');
        return;
    }
    
    if (parsedAmount > 99999999) {
        showToast('金额不能超过 9999 万');
        return;
    }
    
    if (!selectedCategory) {
        showToast('请选择分类');
        return;
    }
    
    // 创建交易记录
    const transaction = {
        amount: parsedAmount,
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
    if (currentPage === 'stats') {
        renderStats();
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

// 渲染统计页面
function renderStats() {
    renderCategoryChart('expense');
    renderTrendChart();
}

// 渲染分类统计图
function renderCategoryChart(type) {
    const stats = dataManager.getCategoryStats(type);
    const container = document.getElementById('categoryStats');
    
    if (stats.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">📊</div><div>暂无数据</div></div>';
        return;
    }

    const total = stats.reduce((sum, s) => sum + s.amount, 0);
    const maxAmount = Math.max(...stats.map(s => s.amount));
    
    container.innerHTML = stats.map(s => {
        const percent = ((s.amount / total) * 100).toFixed(1);
        const barWidth = (s.amount / maxAmount) * 100;
        const cat = getCategoryInfo(s.name, type);
        
        return `
            <div class="stat-item">
                <div class="stat-header">
                    <span class="stat-icon">${cat.icon}</span>
                    <span class="stat-name">${s.name}</span>
                    <span class="stat-percent">${percent}%</span>
                </div>
                <div class="stat-bar-bg">
                    <div class="stat-bar" style="width: ${barWidth}%; background: ${cat.color};"></div>
                </div>
                <div class="stat-amount">¥${formatMoney(s.amount)}</div>
            </div>
        `;
    }).join('');
}

// 切换统计类型
function switchStatsType(type) {
    document.querySelectorAll('.stats-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });
    renderCategoryChart(type);
}

// 渲染趋势图
function renderTrendChart() {
    const stats = dataManager.getDailyStats(30);
    const container = document.getElementById('trendChart');
    
    if (stats.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">📈</div><div>暂无数据</div></div>';
        return;
    }

    const maxValue = Math.max(...stats.map(s => Math.max(s.income, s.expense))) || 1;
    const chartHeight = 200;
    
    container.innerHTML = `
        <div class="chart-container">
            <svg width="100%" height="${chartHeight}" style="overflow: visible;">
                ${stats.map((s, i) => {
                    const x = (i / (stats.length - 1)) * 100;
                    const incomeHeight = (s.income / maxValue) * (chartHeight - 40);
                    const expenseHeight = (s.expense / maxValue) * (chartHeight - 40);
                    const barWidth = 100 / stats.length * 0.6;
                    
                    return `
                        <g>
                            <rect x="${x}%" y="${chartHeight - 30 - incomeHeight}" 
                                  width="${barWidth}%" height="${incomeHeight}" 
                                  fill="#10B981" opacity="0.7" rx="2"/>
                            <rect x="${x + barWidth}%" y="${chartHeight - 30 - expenseHeight}" 
                                  width="${barWidth}%" height="${expenseHeight}" 
                                  fill="#EF4444" opacity="0.7" rx="2"/>
                            ${i % 5 === 0 ? `<text x="${x + barWidth}%" y="${chartHeight - 10}" 
                                fill="#6B7280" font-size="10" text-anchor="middle">
                                ${s.dateLabel}
                            </text>` : ''}
                        </g>
                    `;
                }).join('')}
            </svg>
            <div class="chart-legend">
                <span><span style="color: #10B981;">●</span> 收入</span>
                <span><span style="color: #EF4444;">●</span> 支出</span>
            </div>
        </div>
    `;
}

// 渲染设置页面
function renderSettings() {
    const settings = dataManager.getSettings();
    const container = document.getElementById('settingsContent');
    
    container.innerHTML = `
        <div class="setting-section">
            <div class="setting-title">数据管理</div>
            <div class="setting-item" onclick="triggerImport()">
                <span>📥 导入数据</span>
                <span class="setting-arrow">›</span>
            </div>
            <div class="setting-item" onclick="exportDataToFile()">
                <span>📤 导出数据</span>
                <span class="setting-arrow">›</span>
            </div>
            <div class="setting-item" onclick="clearAllData()">
                <span style="color: #EF4444;">🗑️ 清空数据</span>
                <span class="setting-arrow">›</span>
            </div>
        </div>

        <div class="setting-section">
            <div class="setting-title">预算设置</div>
            <div class="setting-item">
                <span>每月预算</span>
                <input type="number" class="setting-input" 
                       value="${settings.monthlyBudget || 0}" 
                       onchange="updateBudget(this.value)" 
                       placeholder="0">
            </div>
            <div class="setting-item">
                <span>预算提醒</span>
                <label class="switch">
                    <input type="checkbox" ${settings.budgetAlert ? 'checked' : ''} 
                           onchange="toggleBudgetAlert(this.checked)">
                    <span class="slider"></span>
                </label>
            </div>
        </div>

        <div class="setting-section">
            <div class="setting-title">显示设置</div>
            <div class="setting-item">
                <span>货币符号</span>
                <select class="setting-select" onchange="updateCurrency(this.value)">
                    <option value="¥" ${settings.currency === '¥' ? 'selected' : ''}>¥ 人民币</option>
                    <option value="$" ${settings.currency === '$' ? 'selected' : ''}>$ 美元</option>
                    <option value="€" ${settings.currency === '€' ? 'selected' : ''}>€ 欧元</option>
                </select>
            </div>
        </div>

        <div class="setting-section">
            <div class="setting-title">关于</div>
            <div class="setting-item">
                <span>版本信息</span>
                <span class="setting-value">v1.0.0</span>
            </div>
        </div>
    `;
}

// 导出数据到文件
function exportDataToFile() {
    const data = dataManager.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `钱迹备份_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('导出成功');
}

// 触发导入文件选择
function triggerImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.name.endsWith('.json')) {
            showToast('请选择 JSON 格式文件');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                importDataFromFile(data);
            } catch (error) {
                showToast('文件格式错误');
            }
        };
        reader.onerror = () => showToast('文件读取失败');
        reader.readAsText(file);
    };
    input.click();
}

// 导入数据并验证
function importDataFromFile(data) {
    // 验证数据结构
    if (!data || typeof data !== 'object') {
        showToast('数据格式无效');
        return;
    }
    
    // 验证必要字段
    if (!Array.isArray(data.transactions)) {
        showToast('缺少交易记录字段');
        return;
    }
    
    // 验证每条记录
    const validTransactions = data.transactions.filter(t => {
        return t && 
               typeof t.id === 'string' &&
               typeof t.type === 'string' &&
               (t.type === 'expense' || t.type === 'income') &&
               typeof t.amount === 'number' &&
               t.amount > 0 &&
               typeof t.category === 'string' &&
               typeof t.date === 'string';
    });
    
    if (validTransactions.length === 0) {
        showToast('没有有效的交易记录');
        return;
    }
    
    // 询问导入方式
    const mode = confirm('点击"确定"合并数据，点击"取消"覆盖现有数据') ? 'merge' : 'replace';
    
    if (mode === 'replace') {
        // 覆盖模式
        const importData = {
            transactions: validTransactions,
            settings: data.settings || {},
            categories: data.categories || {}
        };
        localStorage.setItem('moneytracker_data', JSON.stringify(importData));
        showToast(`已导入 ${validTransactions.length} 条记录（覆盖模式）`);
    } else {
        // 合并模式
        const existing = dataManager.loadData();
        const existingIds = new Set(existing.transactions.map(t => t.id));
        
        // 过滤重复ID
        const newTransactions = validTransactions.filter(t => !existingIds.has(t.id));
        
        existing.transactions.push(...newTransactions);
        existing.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        localStorage.setItem('moneytracker_data', JSON.stringify(existing));
        showToast(`已合并 ${newTransactions.length} 条新记录`);
    }
    
    // 刷新页面
    location.reload();
}

// 清空所有数据
function clearAllData() {
    if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
        if (confirm('再次确认：真的要删除所有记录吗？')) {
            localStorage.removeItem('moneytracker_data');
            location.reload();
        }
    }
}

// 更新预算
function updateBudget(value) {
    dataManager.updateSettings({ monthlyBudget: parseFloat(value) || 0 });
    showToast('预算已更新');
}

// 切换预算提醒
function toggleBudgetAlert(checked) {
    dataManager.updateSettings({ budgetAlert: checked });
    showToast(checked ? '已开启预算提醒' : '已关闭预算提醒');
}

// 更新货币符号
function updateCurrency(value) {
    dataManager.updateSettings({ currency: value });
    showToast('货币符号已更新');
    location.reload();
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
    } else if (page === 'stats') {
        renderStats();
    } else if (page === 'settings') {
        renderSettings();
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
