// WebRTCManager.js - Handles WebRTC voice chat functionality

export class WebRTCManager {
  constructor() {
    this.localStream = null;
    this.peerConnections = new Map();
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.isInitialized = false;
    this.isMuted = false;
    this.isSpeaking = false;
    this.voiceLevel = 0;
    this.websocket = null;
    this.roomId = 'goat-main-room';
    
    // WebRTC configuration
    this.rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
    
    this.setupEventListeners();
  }

  async initialize() {
    try {
      console.log('🎤 Initializing WebRTC Manager...');
      
      // Get user media (microphone)
      await this.getUserMedia();
      
      // Initialize audio analysis
      await this.initializeAudioAnalysis();
      
      // Connect to signaling server
      await this.connectSignaling();
      
      this.isInitialized = true;
      console.log('✅ WebRTC Manager initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize WebRTC Manager:', error);
      throw error;
    }
  }

  async getUserMedia() {
    try {
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        },
        video: false
      };
      
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('🎵 Got user media stream');
      
      return this.localStream;
    } catch (error) {
      console.error('Failed to get user media:', error);
      throw new Error('Microphone access denied or not available');
    }
  }

  async initializeAudioAnalysis() {
    try {
      // Create audio context for voice level analysis
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(this.localStream);
      
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      
      this.microphone.connect(this.analyser);
      
      // Start voice level monitoring
      this.startVoiceLevelMonitoring();
      
      console.log('🔊 Audio analysis initialized');
    } catch (error) {
      console.error('Failed to initialize audio analysis:', error);
    }
  }

  startVoiceLevelMonitoring() {
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateVoiceLevel = () => {
      if (!this.analyser) return;
      
      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      
      const average = sum / bufferLength;
      this.voiceLevel = Math.min(100, (average / 128) * 100);
      
      // Update UI voice level indicator
      this.updateVoiceLevelUI(this.voiceLevel);
      
      // Detect speaking (threshold-based)
      const wasSpeaking = this.isSpeaking;
      this.isSpeaking = this.voiceLevel > 15; // Adjust threshold as needed
      
      if (this.isSpeaking !== wasSpeaking) {
        this.broadcastSpeakingStatus(this.isSpeaking);
      }
      
      requestAnimationFrame(updateVoiceLevel);
    };
    
    updateVoiceLevel();
  }

  updateVoiceLevelUI(level) {
    const voiceLevelFill = document.getElementById('voice-level-fill');
    if (voiceLevelFill) {
      voiceLevelFill.style.width = `${level}%`;
    }
  }

  async connectSignaling() {
    try {
      // Connect to WebSocket signaling server
      // For now, we'll use a simple implementation
      // In production, you'd connect to your signaling server
      
      const wsUrl = this.getWebSocketUrl();
      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.onopen = () => {
        console.log('🔗 Connected to signaling server');
        this.joinRoom(this.roomId);
      };
      
      this.websocket.onmessage = (event) => {
        this.handleSignalingMessage(JSON.parse(event.data));
      };
      
      this.websocket.onclose = () => {
        console.log('🔌 Disconnected from signaling server');
        setTimeout(() => this.reconnectSignaling(), 3000);
      };
      
      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
    } catch (error) {
      console.error('Failed to connect to signaling server:', error);
      // For demo purposes, continue without signaling
    }
  }

  getWebSocketUrl() {
    // In a real implementation, this would be your signaling server URL
    // For now, we'll use a placeholder that will fail gracefully
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws/voice`;
  }

  joinRoom(roomId) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'join-room',
        roomId: roomId,
        userId: window.communicationHub?.currentUser?.id || 'anonymous'
      }));
    }
  }

  handleSignalingMessage(message) {
    switch (message.type) {
      case 'user-joined':
        this.handleUserJoined(message);
        break;
      case 'user-left':
        this.handleUserLeft(message);
        break;
      case 'offer':
        this.handleOffer(message);
        break;
      case 'answer':
        this.handleAnswer(message);
        break;
      case 'ice-candidate':
        this.handleIceCandidate(message);
        break;
      case 'speaking-status':
        this.handleSpeakingStatus(message);
        break;
      default:
        console.log('Unknown signaling message:', message);
    }
  }

  async handleUserJoined(message) {
    console.log('👤 User joined:', message.userId);
    
    // Create peer connection for new user
    const peerConnection = await this.createPeerConnection(message.userId);
    
    // Add local stream to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream);
      });
    }
    
    // Create and send offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    this.sendSignalingMessage({
      type: 'offer',
      targetUserId: message.userId,
      offer: offer
    });
  }

  handleUserLeft(message) {
    console.log('👋 User left:', message.userId);
    
    const peerConnection = this.peerConnections.get(message.userId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(message.userId);
    }
  }

  async handleOffer(message) {
    console.log('📞 Received offer from:', message.fromUserId);
    
    const peerConnection = await this.createPeerConnection(message.fromUserId);
    
    await peerConnection.setRemoteDescription(message.offer);
    
    // Add local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream);
      });
    }
    
    // Create and send answer
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    this.sendSignalingMessage({
      type: 'answer',
      targetUserId: message.fromUserId,
      answer: answer
    });
  }

  async handleAnswer(message) {
    console.log('📱 Received answer from:', message.fromUserId);
    
    const peerConnection = this.peerConnections.get(message.fromUserId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(message.answer);
    }
  }

  async handleIceCandidate(message) {
    const peerConnection = this.peerConnections.get(message.fromUserId);
    if (peerConnection) {
      await peerConnection.addIceCandidate(message.candidate);
    }
  }

  handleSpeakingStatus(message) {
    // Update UI to show who is speaking
    this.updateUserSpeakingStatus(message.userId, message.isSpeaking);
  }

  async createPeerConnection(userId) {
    const peerConnection = new RTCPeerConnection(this.rtcConfig);
    this.peerConnections.set(userId, peerConnection);
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: 'ice-candidate',
          targetUserId: userId,
          candidate: event.candidate
        });
      }
    };
    
    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('🎵 Received remote stream from:', userId);
      this.handleRemoteStream(userId, event.streams[0]);
    };
    
    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with ${userId}:`, peerConnection.connectionState);
    };
    
    return peerConnection;
  }

  handleRemoteStream(userId, stream) {
    // Create audio element for remote stream
    let audioElement = document.getElementById(`audio-${userId}`);
    
    if (!audioElement) {
      audioElement = document.createElement('audio');
      audioElement.id = `audio-${userId}`;
      audioElement.autoplay = true;
      audioElement.style.display = 'none';
      document.body.appendChild(audioElement);
    }
    
    audioElement.srcObject = stream;
  }

  sendSignalingMessage(message) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    }
  }

  broadcastSpeakingStatus(isSpeaking) {
    this.sendSignalingMessage({
      type: 'speaking-status',
      isSpeaking: isSpeaking,
      userId: window.communicationHub?.currentUser?.id || 'anonymous'
    });
  }

  updateUserSpeakingStatus(userId, isSpeaking) {
    // Update user list UI to show speaking status
    const userElement = document.querySelector(`[data-user-id="${userId}"]`);
    if (userElement) {
      if (isSpeaking) {
        userElement.classList.add('user-speaking');
      } else {
        userElement.classList.remove('user-speaking');
      }
    }
  }

  startSpeaking() {
    if (!this.isInitialized || this.isMuted) return;
    
    // Enable microphone
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = true;
      });
    }
    
    console.log('🎤 Started speaking');
  }

  stopSpeaking() {
    if (!this.isInitialized) return;
    
    // Disable microphone (for push-to-talk)
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
    }
    
    console.log('🔇 Stopped speaking');
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !this.isMuted;
      });
    }
    
    // Update UI
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
      const icon = muteBtn.querySelector('.btn-icon');
      const text = muteBtn.querySelector('.btn-text');
      
      if (this.isMuted) {
        icon.textContent = '🔇';
        text.textContent = 'Unmute';
        muteBtn.classList.add('muted');
      } else {
        icon.textContent = '🎤';
        text.textContent = 'Mute';
        muteBtn.classList.remove('muted');
      }
    }
    
    console.log(this.isMuted ? '🔇 Muted' : '🎤 Unmuted');
  }

  async reconnectSignaling() {
    if (this.websocket?.readyState === WebSocket.CONNECTING) return;
    
    console.log('🔄 Reconnecting to signaling server...');
    await this.connectSignaling();
  }

  setupEventListeners() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Pause audio processing when tab is hidden
        if (this.audioContext && this.audioContext.state === 'running') {
          this.audioContext.suspend();
        }
      } else {
        // Resume audio processing when tab is visible
        if (this.audioContext && this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
      }
    });
    
    // Handle beforeunload to clean up connections
    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });
  }

  async disconnect() {
    console.log('🔌 Disconnecting WebRTC Manager...');
    
    // Close all peer connections
    this.peerConnections.forEach((peerConnection, userId) => {
      peerConnection.close();
    });
    this.peerConnections.clear();
    
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.localStream = null;
    }
    
    // Close audio context
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
    
    // Close WebSocket
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    // Remove remote audio elements
    document.querySelectorAll('audio[id^="audio-"]').forEach(audio => {
      audio.remove();
    });
    
    this.isInitialized = false;
    console.log('✅ WebRTC Manager disconnected');
  }

  // Utility methods
  getConnectionStats() {
    const stats = {
      totalConnections: this.peerConnections.size,
      isInitialized: this.isInitialized,
      isMuted: this.isMuted,
      isSpeaking: this.isSpeaking,
      voiceLevel: this.voiceLevel
    };
    
    return stats;
  }

  // Debug method
  debug() {
    console.log('🐛 WebRTC Manager Debug Info:');
    console.log('- Initialized:', this.isInitialized);
    console.log('- Muted:', this.isMuted);
    console.log('- Speaking:', this.isSpeaking);
    console.log('- Voice Level:', this.voiceLevel);
    console.log('- Peer Connections:', this.peerConnections.size);
    console.log('- Local Stream:', this.localStream);
    console.log('- WebSocket State:', this.websocket?.readyState);
  }
}

// Export for use in other modules
export default WebRTCManager;