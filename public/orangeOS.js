// Orange-OS Main Application Logic

class OrangeOS {
  constructor() {
    this.openWindows = new Set();
    this.zIndexCounter = 1000;
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.initializeElements();
      this.setupEventListeners();
      this.startIntroSequence();
    });
  }

  initializeElements() {
    this.introScreen = document.getElementById('intro-screen');
    this.mainScreen = document.getElementById('main-screen');
    this.startButton = document.getElementById('start-button');
    this.startMenu = document.getElementById('start-menu');
    this.clock = document.getElementById('clock');
    this.taskbarApps = document.getElementById('taskbar-apps');
  }

  setupEventListeners() {
    // Start menu functionality
    if (this.startButton && this.startMenu) {
      this.startButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.startMenu.classList.toggle('hidden');
      });

      document.addEventListener('click', (e) => {
        const target = e.target;
        if (target && !this.startMenu.contains(target) && !this.startButton.contains(target)) {
          this.startMenu.classList.add('hidden');
        }
      });
    }

    // Desktop icons functionality
    const desktopIcons = document.querySelectorAll('.desktop-icon');
    desktopIcons.forEach(icon => {
      icon.addEventListener('click', () => {
        const appName = icon.getAttribute('data-app');
        if (appName) {
          this.launchApp(appName);
        }
      });
    });

    // Start menu items functionality
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        const appName = item.getAttribute('data-app');
        if (appName) {
          this.launchApp(appName);
        }
      });
    });
  }

  startIntroSequence() {
    // After 4 seconds, show desktop directly
    setTimeout(() => {
      this.introScreen.style.transition = 'opacity 0.5s ease-out';
      this.introScreen.style.opacity = '0';
      
      setTimeout(() => {
        this.introScreen.style.display = 'none';
        this.mainScreen.classList.remove('hidden');
        this.mainScreen.style.opacity = '0';
        this.mainScreen.style.transition = 'opacity 0.5s ease-in';
        
        this.mainScreen.offsetHeight;
        this.mainScreen.style.opacity = '1';
        
        // Initialize clock
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
      }, 500);
    }, 4000);
  }

  updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    if (this.clock) {
      this.clock.textContent = timeString;
    }
  }

  openWindow(windowId) {
    const window = document.getElementById(windowId);
    const appName = windowId.replace('-window', '');
    
    if (window && !this.openWindows.has(appName)) {
      window.classList.remove('hidden');
      window.style.zIndex = (++this.zIndexCounter).toString();
      this.openWindows.add(appName);
      this.addToTaskbar(appName);
      this.makeWindowDraggable(window);
      
      // Add close button functionality
      const closeBtn = window.querySelector('.close-btn');
      if (closeBtn) {
        closeBtn.onclick = () => this.closeWindow(appName);
      }
    }
  }

  closeWindow(appName) {
    const windowId = appName + '-window';
    const window = document.getElementById(windowId);
    
    if (window) {
      window.classList.add('hidden');
      this.openWindows.delete(appName);
      this.removeFromTaskbar(appName);
    }
  }

  addToTaskbar(appName) {
    const taskbarButton = document.createElement('button');
    taskbarButton.className = 'bg-white border border-black px-3 py-1 text-black text-sm hover:bg-gray-100';
    taskbarButton.textContent = this.getAppDisplayName(appName);
    taskbarButton.id = 'taskbar-' + appName;
    taskbarButton.onclick = () => this.focusWindow(appName);
    this.taskbarApps.appendChild(taskbarButton);
  }

  removeFromTaskbar(appName) {
    const taskbarButton = document.getElementById('taskbar-' + appName);
    if (taskbarButton) {
      taskbarButton.remove();
    }
  }

  focusWindow(appName) {
    const windowId = appName + '-window';
    const window = document.getElementById(windowId);
    if (window) {
      window.style.zIndex = (++this.zIndexCounter).toString();
    }
  }

  getAppDisplayName(appName) {
    const names = {
      'notepad': 'Notepad',
      'mycomputer': 'My Computer',
      'internet': 'Internet Explorer',
      'recycle': 'Recycle Bin',
      'mydocuments': 'My Documents',
      'controlpanel': 'Control Panel',
      'search': 'Search',
      'help': 'Help',
      'dexscreener': 'DexScreener',
      'twitter': 'X/Twitter',
      'telegram': 'Telegram',
      'contract': 'Contract Info'
    };
    return names[appName] || appName;
  }

  makeWindowDraggable(windowElement) {
    const header = windowElement.querySelector('.window-header');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    header.addEventListener('mousedown', (e) => this.dragStart(e, windowElement));
    document.addEventListener('mousemove', (e) => this.drag(e, windowElement));
    document.addEventListener('mouseup', () => this.dragEnd());

    const dragStart = (e, windowElement) => {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;

      if (e.target === header || header.contains(e.target)) {
        isDragging = true;
        windowElement.style.zIndex = (++this.zIndexCounter).toString();
      }
    };

    const drag = (e, windowElement) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        xOffset = currentX;
        yOffset = currentY;
        windowElement.style.left = currentX + 'px';
        windowElement.style.top = currentY + 'px';
      }
    };

    const dragEnd = () => {
      isDragging = false;
    };

    // Bind methods to this context
    this.dragStart = dragStart;
    this.drag = drag;
    this.dragEnd = dragEnd;
  }

  launchApp(appName) {
    switch(appName) {
      case 'shutdown':
        if (confirm('Are you sure you want to turn off the computer?')) {
          document.body.style.background = 'black';
          document.body.innerHTML = '<div style="color: white; text-align: center; padding-top: 50vh; font-family: monospace;">It is now safe to turn off your computer.</div>';
        }
        break;
      case 'mydocuments':
      case 'controlpanel':
      case 'search':
      case 'help':
        alert(`${this.getAppDisplayName(appName)} - This feature is not implemented yet.`);
        break;
      case 'dexscreener':
        window.open('https://dexscreener.com', '_blank');
        break;
      case 'twitter':
        window.open('https://x.com', '_blank');
        break;
      case 'telegram':
        this.openWindow('telegram-window');
        break;
      case 'contract':
        this.openWindow('contract-window');
        break;
      case 'notepad':
        this.openWindow('notepad-window');
        break;
      case 'internet':
        this.openWindow('internet-window');
        break;
      case 'mycomputer':
      case 'files':
        this.openWindow('mycomputer-window');
        break;
      case 'recycle':
        this.openWindow('recycle-window');
        break;
      default:
        this.openWindow(appName + '-window');
    }
    this.startMenu.classList.add('hidden');
  }
}

// Initialize Orange-OS
const orangeOS = new OrangeOS();