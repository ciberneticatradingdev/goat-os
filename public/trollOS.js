// Troll-OS Main Application Logic
// Global contract address variable
const CONTRACT_ADDRESS = "CA WILL UPDATE SOON | CA WILL UPDATE SOON"; // Replace with actual contract address

class TrollOS {
  constructor() {
    this.openWindows = new Set();
    this.zIndexCounter = 1000;
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.initializeElements();
      this.setupEventListeners();
      this.initializeContractAddress();
      this.startIntroSequence();
    });
  }

  initializeElements() {
    this.introScreen = document.getElementById('intro-screen');
    this.mainScreen = document.getElementById('main-screen');
    this.startButton = document.getElementById('start-button');
    this.startMenu = document.getElementById('start-menu');
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

  initializeContractAddress() {
    // Initialize taskbar contract address display
    const taskbarContractFull = document.getElementById('taskbar-contract-full');
    const taskbarContractShort = document.getElementById('taskbar-contract-short');
    
    if (taskbarContractFull) {
      taskbarContractFull.textContent = CONTRACT_ADDRESS;
    }
    
    if (taskbarContractShort) {
      // Create shortened version for mobile
      const shortAddress = CONTRACT_ADDRESS.length > 10 ? 
        CONTRACT_ADDRESS.substring(0, 6) + '...' + CONTRACT_ADDRESS.substring(CONTRACT_ADDRESS.length - 4) : 
        CONTRACT_ADDRESS;
      taskbarContractShort.textContent = shortAddress;
    }
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
        
        // Clock removed - replaced with contract address component
      }, 500);
    }, 4000);
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
      
      // Clean up chat subscription when closing chat window
      if (appName === 'chat' && chatSubscription) {
        supabaseClient.removeChannel(chatSubscription);
        chatSubscription = null;
        console.log('Chat subscription closed');
      }
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
      'myvideos': 'My Videos',
      'controlpanel': 'Control Panel',
      'search': 'Search',
      'help': 'Help',
      'dexscreener': 'DexScreener',
      'twitter': 'X/Twitter',
      'telegram': 'Telegram',
      'contract': 'Contract Info',
      'chat': 'Chat',
      'trollteaser': 'Troll Era Teaser'
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

    const dragStart = (e) => {
      if (e.target === header || header.contains(e.target)) {
        isDragging = true;
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        windowElement.style.zIndex = (++this.zIndexCounter).toString();
      }
    };

    const drag = (e) => {
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

    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
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
        this.openWindow('mycomputer-window');
        setTimeout(() => navigateToDocuments(), 300);
        break;
      case 'mypictures':
        this.openWindow('mycomputer-window');
        setTimeout(() => navigateToPictures(), 300);
        break;
      case 'myvideos':
        this.openWindow('mycomputer-window');
        setTimeout(() => navigateToVideos(), 300);
        break;
      case 'controlpanel':
      case 'search':
      case 'help':
        alert(`${this.getAppDisplayName(appName)} - This feature is not implemented yet.`);
        break;
      case 'dexscreener':
        window.open(`https://dexscreener.com/solana/${CONTRACT_ADDRESS}`, '_blank');
        break;
      case 'twitter':
        window.open('https://x.com/trollos_', '_blank');
        break;
      case 'telegram':
        this.openWindow('telegram-window');
        break;
      case 'contract':
        this.openWindow('contract-window');
        setTimeout(() => {
          // Fill contract address display
          const addressDisplay = document.getElementById('contract-address-display');
          const copyBtn = document.getElementById('copy-contract-btn');
          
          if (addressDisplay) {
            addressDisplay.textContent = CONTRACT_ADDRESS;
          }
          
          if (copyBtn) {
            copyBtn.onclick = () => {
              navigator.clipboard.writeText(CONTRACT_ADDRESS).then(() => {
                // Show brief notification
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                copyBtn.style.backgroundColor = '#10b981';
                setTimeout(() => {
                  copyBtn.textContent = originalText;
                  copyBtn.style.backgroundColor = '#3b82f6';
                }, 1000);
              });
            };
          }
        }, 100);
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
        this.openWindow('trash-window');
        break;
      case 'chat':
        this.openWindow('chat-window');
        loadChatMessages();
        break;
      case 'orangeteaser':
        this.openWindow('orangeteaser-window');
        break;
      default:
        this.openWindow(appName + '-window');
    }
    this.startMenu.classList.add('hidden');
  }
}

// Initialize Troll-OS

// Photo navigation variables
let currentPhotoIndex = 1;
const totalPhotos = 13;

// Photo viewer functions
function viewPhoto(imageSrc, photoIndex) {
  currentPhotoIndex = photoIndex || 1;
  const photoViewer = document.getElementById('photo-viewer');
  const photoImg = document.getElementById('photo-viewer-img');
  const photoCounter = document.getElementById('photo-counter');
  photoImg.src = imageSrc;
  photoCounter.textContent = `${currentPhotoIndex} / ${totalPhotos}`;
  photoViewer.classList.remove('hidden');
}

function closePhotoViewer() {
  const photoViewer = document.getElementById('photo-viewer');
  photoViewer.classList.add('hidden');
}

function previousPhoto() {
  if (currentPhotoIndex > 1) {
    currentPhotoIndex--;
    viewPhoto(`/mypictures/${currentPhotoIndex}.jpeg`, currentPhotoIndex);
  }
}

function nextPhoto() {
  if (currentPhotoIndex < totalPhotos) {
    currentPhotoIndex++;
    viewPhoto(`/mypictures/${currentPhotoIndex}.jpeg`, currentPhotoIndex);
  }
}

// Video navigation variables
let currentVideoIndex = 1;
const totalVideos = 6;

// Video viewer functions
function viewVideo(videoSrc, videoIndex) {
  currentVideoIndex = videoIndex || 1;
  const videoViewer = document.getElementById('video-viewer');
  const videoElement = document.getElementById('video-viewer-video');
  const videoCounter = document.getElementById('video-counter');
  const videoSource = videoElement.querySelector('source');
  
  videoSource.src = videoSrc;
  videoElement.load();
  videoCounter.textContent = `${currentVideoIndex} / ${totalVideos}`;
  videoViewer.classList.remove('hidden');
}

function closeVideoViewer() {
  const videoViewer = document.getElementById('video-viewer');
  const videoElement = document.getElementById('video-viewer-video');
  videoViewer.classList.add('hidden');
  videoElement.pause();
}

function previousVideo() {
  if (currentVideoIndex > 1) {
    currentVideoIndex--;
    viewVideo(`/videos/${currentVideoIndex}.mp4`, currentVideoIndex);
  }
}

function nextVideo() {
  if (currentVideoIndex < totalVideos) {
    currentVideoIndex++;
    viewVideo(`/videos/${currentVideoIndex}.mp4`, currentVideoIndex);
  }
}

// PDF viewer functions
function viewPDF(pdfSrc) {
  const pdfViewer = document.getElementById('pdf-viewer');
  const pdfFrame = document.getElementById('pdf-viewer-frame');
  pdfFrame.src = pdfSrc;
  pdfViewer.classList.remove('hidden');
}

function closePDFViewer() {
  const pdfViewer = document.getElementById('pdf-viewer');
  pdfViewer.classList.add('hidden');
  const pdfFrame = document.getElementById('pdf-viewer-frame');
  pdfFrame.src = '';
}

// My Computer navigation functions
function navigateToDocuments() {
  const mainView = document.getElementById('main-view');
  const documentsView = document.getElementById('documents-view');
  const picturesView = document.getElementById('pictures-view');
  const videosView = document.getElementById('videos-view');
  const backBtn = document.getElementById('back-btn');
  const title = document.getElementById('mycomputer-title');
  
  mainView.classList.add('hidden');
  picturesView.classList.add('hidden');
  videosView.classList.add('hidden');
  documentsView.classList.remove('hidden');
  backBtn.classList.remove('hidden');
  title.textContent = 'My Documents';
}

function navigateToPictures() {
  const mainView = document.getElementById('main-view');
  const documentsView = document.getElementById('documents-view');
  const picturesView = document.getElementById('pictures-view');
  const videosView = document.getElementById('videos-view');
  const backBtn = document.getElementById('back-btn');
  const title = document.getElementById('mycomputer-title');
  
  mainView.classList.add('hidden');
  documentsView.classList.add('hidden');
  videosView.classList.add('hidden');
  picturesView.classList.remove('hidden');
  backBtn.classList.remove('hidden');
  title.textContent = 'My Pictures';
}

function navigateToVideos() {
  const mainView = document.getElementById('main-view');
  const documentsView = document.getElementById('documents-view');
  const picturesView = document.getElementById('pictures-view');
  const videosView = document.getElementById('videos-view');
  const backBtn = document.getElementById('back-btn');
  const title = document.getElementById('mycomputer-title');
  
  mainView.classList.add('hidden');
  documentsView.classList.add('hidden');
  picturesView.classList.add('hidden');
  videosView.classList.remove('hidden');
  backBtn.classList.remove('hidden');
  title.textContent = 'My Videos';
}

function navigateBack() {
  const mainView = document.getElementById('main-view');
  const documentsView = document.getElementById('documents-view');
  const picturesView = document.getElementById('pictures-view');
  const videosView = document.getElementById('videos-view');
  const backBtn = document.getElementById('back-btn');
  const title = document.getElementById('mycomputer-title');
  
  documentsView.classList.add('hidden');
  picturesView.classList.add('hidden');
  videosView.classList.add('hidden');
  mainView.classList.remove('hidden');
  backBtn.classList.add('hidden');
  title.textContent = 'My Computer';
}

const trollOS = new TrollOS();

// Contract address function
function copyContractAddress() {
  const contractAddress = CONTRACT_ADDRESS;
  
  navigator.clipboard.writeText(contractAddress).then(() => {
    // Show a brief notification
    const notification = document.createElement('div');
    notification.textContent = 'Contract address copied!';
    notification.style.cssText = 'position: fixed; bottom: 4rem; right: 1rem; background-color: #ff9b05; color: black; padding: 0.5rem 1rem; border-radius: 0.375rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); z-index: 999999; transition: opacity 0.3s; font-family: system-ui, -apple-system, sans-serif; border: 2px solid black;';
    document.body.appendChild(notification);
    
    // Remove notification after 2 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy contract address: ', err);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = contractAddress;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    // Show notification for fallback too
    const notification = document.createElement('div');
    notification.textContent = 'Contract address copied!';
    notification.style.cssText = 'position: fixed; bottom: 4rem; right: 1rem; background-color: #ff9b05; color: black; padding: 0.5rem 1rem; border-radius: 0.375rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); z-index: 999999; transition: opacity 0.3s; font-family: system-ui, -apple-system, sans-serif; border: 2px solid black;';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 2000);
  });
}

// Supabase configuration
const SUPABASE_URL = 'https://zfasxsiqjlxjaqojtvzt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmYXN4c2lxamx4amFxb2p0dnp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTQ2NzEsImV4cCI6MjA3MDEzMDY3MX0.skvv6gB0mulDoZ-v-lcSf_2MNbZrWkAYM2lQeNW9nNQ';

// Initialize Supabase client
let supabaseClient = null;
let chatSubscription = null;

// Initialize Supabase when available
function initializeSupabase() {
  if (typeof window !== 'undefined' && window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      },
      auth: {
        persistSession: false
      }
    });
    console.log('✅ Supabase client initialized with realtime enabled');
    console.log('🔗 Supabase URL:', SUPABASE_URL);
    console.log('🔑 Using anon key (first 20 chars):', SUPABASE_ANON_KEY.substring(0, 20) + '...');
    
    // Test connection
    testSupabaseConnection();
  } else {
    console.log('⏳ Supabase not available yet, retrying...');
    setTimeout(initializeSupabase, 100);
  }
}

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabaseClient
      .from('chat_messages')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
    } else {
      console.log('✅ Supabase connection test successful');
    }
  } catch (error) {
    console.error('❌ Supabase connection test error:', error);
  }
}

// Start initialization
initializeSupabase();

// Chat functionality
async function loadChatMessages() {
  if (!supabaseClient) {
    console.log('Supabase client not ready, retrying...');
    setTimeout(loadChatMessages, 500);
    return;
  }
  
  console.log('🔄 Loading chat messages...');
  
  try {
    const { data: messages, error } = await supabaseClient
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50);
    
    if (error) {
      console.error('❌ Error loading messages:', error);
      return;
    }
    
    console.log(`✅ Loaded ${messages?.length || 0} messages`);
    displayChatMessages(messages || []);
    
    // Set up real-time subscription if not already active
    if (!chatSubscription) {
      console.log('🔗 Setting up realtime subscription...');
      setupRealtimeSubscription();
    } else {
      console.log('✅ Realtime subscription already active');
    }
  } catch (error) {
    console.error('❌ Error loading chat messages:', error);
  }
}

// Set up real-time subscription for new messages
function setupRealtimeSubscription() {
  if (!supabaseClient) {
    console.log('Supabase client not ready, retrying...');
    setTimeout(setupRealtimeSubscription, 500);
    return;
  }
  
  console.log('🔗 Setting up realtime subscription...');
  console.log('📡 Creating channel for chat_messages table');
  
  // Close existing subscription if any
  if (chatSubscription) {
    console.log('🔒 Closing existing subscription');
    chatSubscription.unsubscribe();
    chatSubscription = null;
  }
  
  // Create a unique channel name
  const channelName = 'chat_messages_' + Date.now();
  console.log('📺 Channel name:', channelName);
  
  // Create a channel for chat_messages table
  const channel = supabaseClient
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages'
      },
      (payload) => {
        console.log('📨 New message received via realtime:', payload.new);
        addNewMessageToChat(payload.new);
      }
    )
    .on('postgres_changes', 
      {
        event: '*',
        schema: 'public',
        table: 'chat_messages'
      },
      (payload) => {
        console.log('📊 Database change detected:', payload.eventType, payload.new);
      }
    )
    .on('error', (error) => {
      console.error('❌ Realtime subscription error:', error);
    })
    .subscribe((status, error) => {
      console.log('📡 Subscription status changed to:', status);
      if (error) {
        console.error('❌ Subscription error details:', error);
      }
      
      switch(status) {
        case 'SUBSCRIBED':
          console.log('✅ Successfully subscribed to chat messages realtime updates');
          break;
        case 'CHANNEL_ERROR':
          console.error('❌ Channel error - realtime may not be enabled on this table');
          console.log('💡 Try enabling realtime in Supabase dashboard: Database > Replication');
          break;
        case 'TIMED_OUT':
          console.error('❌ Subscription timed out - retrying in 5 seconds');
          setTimeout(setupRealtimeSubscription, 5000);
          break;
        case 'CLOSED':
          console.log('🔒 Subscription closed');
          break;
        default:
          console.log('📡 Unknown status:', status);
      }
    });
  
  chatSubscription = channel;
  console.log('💾 Subscription stored in chatSubscription variable');
}

// Add a new message to the chat without reloading all messages
function addNewMessageToChat(message) {
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'chat-message mb-3 p-3 bg-white border border-gray-200 rounded';
  
  const timestamp = new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  
  messageDiv.innerHTML = `
    <div class="flex justify-between items-start mb-1">
      <span class="font-semibold text-orange-600">${escapeHtml(message.username)}</span>
      <span class="text-xs text-gray-500">${timestamp}</span>
    </div>
    <p class="text-sm text-gray-800">${escapeHtml(message.message)}</p>
  `;
  
  chatMessages.appendChild(messageDiv);
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function displayChatMessages(messages) {
  const chatMessages = document.getElementById('chat-messages');
  const welcomeMessage = chatMessages.querySelector('.text-center');
  
  // Clear existing messages but keep welcome message
  const existingMessages = chatMessages.querySelectorAll('.chat-message');
  existingMessages.forEach(msg => msg.remove());
  
  messages.forEach(message => {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message mb-3 p-3 bg-white border border-gray-200 rounded';
    
    const timestamp = new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    messageDiv.innerHTML = `
      <div class="flex justify-between items-start mb-1">
        <span class="font-semibold text-orange-600">${escapeHtml(message.username)}</span>
        <span class="text-xs text-gray-500">${timestamp}</span>
      </div>
      <p class="text-sm text-gray-800">${escapeHtml(message.message)}</p>
    `;
    
    chatMessages.appendChild(messageDiv);
  });
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendChatMessage() {
  if (!supabaseClient) {
    alert('Chat service not ready. Please try again.');
    return;
  }
  
  const usernameInput = document.getElementById('chat-username');
  const messageInput = document.getElementById('chat-message-input');
  const sendBtn = document.getElementById('send-message-btn');
  
  const username = usernameInput.value.trim();
  const message = messageInput.value.trim();
  
  if (!username) {
    alert('Please enter your name first!');
    usernameInput.focus();
    return;
  }
  
  if (!message) {
    alert('Please enter a message!');
    messageInput.focus();
    return;
  }
  
  // Disable send button temporarily
  sendBtn.disabled = true;
  sendBtn.textContent = 'Sending...';
  
  try {
    const { data, error } = await supabaseClient
      .from('chat_messages')
      .insert([
        {
          username: username,
          message: message
        }
      ]);
    
    if (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
      return;
    }
    
    messageInput.value = '';
    console.log('Message sent successfully');
    // No need to reload messages, real-time subscription will handle it
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Failed to send message. Please try again.');
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send';
  }
}

// Helper function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Add Enter key support for chat
document.addEventListener('DOMContentLoaded', () => {
  const messageInput = document.getElementById('chat-message-input');
  if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });
  }
});

// Make functions globally accessible
window.viewPhoto = viewPhoto;
window.closePhotoViewer = closePhotoViewer;
window.previousPhoto = previousPhoto;
window.nextPhoto = nextPhoto;
window.viewPDF = viewPDF;
window.closePDFViewer = closePDFViewer;
window.navigateToDocuments = navigateToDocuments;
window.navigateToPictures = navigateToPictures;
window.navigateBack = navigateBack;
window.copyContractAddress = copyContractAddress;
window.loadChatMessages = loadChatMessages;
window.sendChatMessage = sendChatMessage;