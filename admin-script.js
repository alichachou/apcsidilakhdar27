import { messageService, authService } from './src/lib/supabase.js'

// Sample data for demonstration
let messages = [];

// Admin credentials (in real application, this should be handled securely)
const adminCredentials = {
    username: 'admin',
    password: 'admin123'
};

// Current selected message
let selectedMessage = null;

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const navLinks = document.querySelectorAll('.nav-link');
const contentSections = document.querySelectorAll('.content-section');
const messagesList = document.getElementById('messagesList');
const messageDetails = document.getElementById('messageDetails');
const filterStatus = document.getElementById('filterStatus');
const refreshMessages = document.getElementById('refreshMessages');
const closeMessage = document.getElementById('closeMessage');
const replyForm = document.getElementById('replyForm');
const markAsRead = document.getElementById('markAsRead');
const successModal = document.getElementById('successModal');
const closeSuccessModal = document.getElementById('closeSuccessModal');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    checkAuthStatus();
        showDashboard();
    
    setupEventListeners();
    updateStatistics();
});

// Check authentication status
async function checkAuthStatus() {
    try {
        const isAuth = await authService.isAuthenticated();
        if (isAuth) {
            showDashboard();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout button
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Messages
    filterStatus.addEventListener('change', filterMessages);
    refreshMessages.addEventListener('click', loadMessages);
    closeMessage.addEventListener('click', closeMessageDetails);
    replyForm.addEventListener('submit', handleReply);
    markAsRead.addEventListener('click', markMessageAsRead);
    
    // Modal
    closeSuccessModal.addEventListener('click', closeModal);
    
    // Settings
    const accountSettings = document.getElementById('accountSettings');
    if (accountSettings) {
        accountSettings.addEventListener('submit', handleAccountSettings);
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // For demo purposes, use simple credentials
    // In production, this should use proper authentication
    if (username === adminCredentials.username && password === adminCredentials.password) {
        showDashboard();
        loginError.style.display = 'none';
    } else {
        loginError.style.display = 'block';
    }
    
    // Alternative: Use Supabase auth (uncomment for production)
    /*
    try {
        await authService.signIn(username, password);
        showDashboard();
        loginError.style.display = 'none';
    } catch (error) {
        console.error('Login failed:', error);
        loginError.style.display = 'block';
    }
    */
}

// Handle logout
async function handleLogout() {
    try {
        // await authService.signOut(); // Uncomment for Supabase auth
        loginScreen.style.display = 'flex';
        adminDashboard.style.display = 'none';
        
        // Reset form
        loginForm.reset();
        loginError.style.display = 'none';
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// Show dashboard
async function showDashboard() {
    loginScreen.style.display = 'none';
    adminDashboard.style.display = 'grid';
    await loadMessages();
    await updateStatistics();
}

// Load messages from Supabase
async function loadMessages() {
    try {
        const filter = filterStatus.value;
        messages = await messageService.getMessages(filter);
        
        messagesList.innerHTML = '';
        
        messages.forEach(message => {
            const messageElement = createMessageElement(message);
            messagesList.appendChild(messageElement);
        });
        
        updateUnreadCount();
    } catch (error) {
        console.error('Error loading messages:', error);
        // Fallback to empty array
        messages = [];
        messagesList.innerHTML = '<p>حدث خطأ في تحميل الرسائل</p>';
    }
}

// Create message element
function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-item ${message.status}`;
    messageDiv.dataset.messageId = message.id;
    
    const typeLabels = {
        'documents': 'الوثائق الإدارية',
        'permits': 'الرخص',
        'complaint': 'شكوى',
        'suggestion': 'اقتراح',
        'other': 'أخرى'
    };
    
    const statusLabels = {
        'unread': 'غير مقروءة',
        'read': 'مقروءة',
        'replied': 'تم الرد عليها'
    };
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <div>
                <div class="message-sender">${message.name}</div>
                <div class="message-email">${message.email}</div>
            </div>
            <div class="message-date">${formatDate(message.created_at)}</div>
        </div>
        <div class="message-preview">${message.message}</div>
        <div class="message-meta">
            <span class="message-type">${typeLabels[message.inquiry_type] || 'أخرى'}</span>
            <span class="message-status ${message.status}">${statusLabels[message.status]}</span>
        </div>
    `;
    
    messageDiv.addEventListener('click', () => showMessageDetails(message));
    
    return messageDiv;
}

// Show message details
function showMessageDetails(message) {
    selectedMessage = message;
    
    // Update selected state
    document.querySelectorAll('.message-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelector(`[data-message-id="${message.id}"]`).classList.add('selected');
    
    // Populate message details
    document.getElementById('messageName').textContent = message.name;
    document.getElementById('messageEmail').textContent = message.email;
    document.getElementById('messagePhone').textContent = message.phone || 'غير محدد';
    
    const typeLabels = {
        'documents': 'الوثائق الإدارية',
        'permits': 'الرخص',
        'complaint': 'شكوى',
        'suggestion': 'اقتراح',
        'other': 'أخرى'
    };
    
    document.getElementById('messageType').textContent = typeLabels[message.inquiry_type] || 'أخرى';
    document.getElementById('messageDate').textContent = formatDate(message.created_at);
    document.getElementById('messageBody').textContent = message.message;
    
    // Show reply if exists
    const replyText = document.getElementById('replyText');
    if (message.reply) {
        replyText.value = message.reply;
        replyText.readOnly = true;
        document.querySelector('.reply-btn').style.display = 'none';
    } else {
        replyText.value = '';
        replyText.readOnly = false;
        document.querySelector('.reply-btn').style.display = 'inline-flex';
    }
    
    // Show message details panel
    messageDetails.style.display = 'block';
    
    // Mark as read if unread
    if (message.status === 'unread') {
        markMessageAsRead();
    }
}

// Handle reply
async function handleReply(e) {
    e.preventDefault();
    
    if (!selectedMessage) return;
    
    const replyText = document.getElementById('replyText').value.trim();
    if (!replyText) return;
    
    try {
        // Update message with reply
        await messageService.replyToMessage(selectedMessage.id, replyText);
        
        // Update local data
        const messageIndex = messages.findIndex(msg => msg.id === selectedMessage.id);
        if (messageIndex !== -1) {
            messages[messageIndex].reply = replyText;
            messages[messageIndex].status = 'replied';
            selectedMessage = messages[messageIndex];
        }
        
        // Update UI
        await loadMessages();
        await updateStatistics();
        showSuccessMessage('تم إرسال الرد بنجاح');
        
        // Update reply form
        document.getElementById('replyText').readOnly = true;
        document.querySelector('.reply-btn').style.display = 'none';
    } catch (error) {
        console.error('Error sending reply:', error);
        alert('حدث خطأ أثناء إرسال الرد');
    }
}

// Mark message as read
async function markMessageAsRead() {
    if (!selectedMessage || selectedMessage.status !== 'unread') return;
    
    try {
        await messageService.updateMessageStatus(selectedMessage.id, 'read');
        
        // Update local data
        const messageIndex = messages.findIndex(msg => msg.id === selectedMessage.id);
        if (messageIndex !== -1) {
            messages[messageIndex].status = 'read';
            selectedMessage = messages[messageIndex];
        }
        
        // Update UI
        await loadMessages();
        await updateStatistics();
        
        // Update message item class
        const messageElement = document.querySelector(`[data-message-id="${selectedMessage.id}"]`);
        if (messageElement) {
            messageElement.classList.remove('unread');
            messageElement.classList.add('read');
            messageElement.querySelector('.message-status').textContent = 'مقروءة';
            messageElement.querySelector('.message-status').className = 'message-status read';
        }
    } catch (error) {
        console.error('Error marking message as read:', error);
    }
}

// Update statistics
async function updateStatistics() {
    try {
        const stats = await messageService.getStatistics();
        
        // Update UI
        document.getElementById('totalMessages').textContent = stats.total;
        document.getElementById('unreadMessages').textContent = stats.unread;
        document.getElementById('repliedMessages').textContent = stats.replied;
        document.getElementById('todayMessages').textContent = stats.today;
        
        updateUnreadCount();
    } catch (error) {
        console.error('Error updating statistics:', error);
        // Fallback to local calculation
        const totalMessages = messages.length;
        const unreadMessages = messages.filter(msg => msg.status === 'unread').length;
        const repliedMessages = messages.filter(msg => msg.status === 'replied').length;
        
        document.getElementById('totalMessages').textContent = totalMessages;
        document.getElementById('unreadMessages').textContent = unreadMessages;
        document.getElementById('repliedMessages').textContent = repliedMessages;
        document.getElementById('todayMessages').textContent = 0;
        
        updateUnreadCount();
    }
}

// Filter messages
function filterMessages() {
    loadMessages();
}

// Handle navigation
async function handleNavigation(e) {
    e.preventDefault();
    
    const targetSection = e.target.closest('.nav-link').dataset.section;
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    e.target.closest('.nav-item').classList.add('active');
    
    // Show target section
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(targetSection + 'Section').classList.add('active');
    
    // Update statistics when viewing statistics section
    if (targetSection === 'statistics') {
        await updateStatistics();
    }
}

// Close message details
function closeMessageDetails() {
    messageDetails.style.display = 'none';
    selectedMessage = null;
    
    // Remove selected state
    document.querySelectorAll('.message-item').forEach(item => {
        item.classList.remove('selected');
    });
}

// Update unread count in sidebar
function updateUnreadCount() {
    const unreadCount = messages.filter(msg => msg.status === 'unread').length;
    document.getElementById('unreadCount').textContent = unreadCount;
    
    if (unreadCount === 0) {
        document.getElementById('unreadCount').style.display = 'none';
    } else {
        document.getElementById('unreadCount').style.display = 'inline-block';
    }
}

// Format date
function formatDate(date) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('ar-SA', options);
}

// Show success message
function showSuccessMessage(message) {
    document.getElementById('successMessage').textContent = message;
    successModal.style.display = 'block';
}

// Close modal
function closeModal() {
    successModal.style.display = 'none';
}

// Handle account settings
function handleAccountSettings(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword && newPassword === confirmPassword) {
        // In a real application, this would be sent to the server
        adminCredentials.password = newPassword;
        showSuccessMessage('تم تحديث كلمة المرور بنجاح');
        
        // Clear form
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    } else if (newPassword !== confirmPassword) {
        alert('كلمة المرور غير متطابقة');
    }
}

// Auto-refresh messages every 30 seconds
setInterval(() => {
    if (document.getElementById('adminDashboard').style.display !== 'none') {
        updateStatistics();
        // Optionally reload messages
        // loadMessages();
    }
}, 30000);