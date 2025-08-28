/**
 * WebRTCManager.js - Handles WebRTC connections for voice chat
 * Provides audio streaming, voice level detection, and peer management
 */

export class WebRTCManager {
  constructor() {
    this.localStream = null;
    this.peerConnections = new Map();
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.dataArray = null;
    this.isInitialized = false;
    this.isMuted = false;
    this.isSpeaking = false;
    this.voiceThreshold = 30; // Voice detection threshold
    this.onVoiceLevelUpdate = null;
    this.onPeerConnected = null;
    this.onPeerDisconnected = null;
    
    // WebRTC configuration
    this.rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
  }

  /**
   * Initialize WebRTC and audio context
   */
  async initialize() {
    try {
      // Request microphone access
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        },
        video: false
      });

      // Set up audio analysis
      await this.setupAudioAnalysis();
      
      // Start voice level monitoring
      this.startVoiceLevelMonitoring();
      
      this.isInitialized = true;
      console.log('WebRTC initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
      throw new Error('Microphone access denied or not available');
    }
  }

  /**
   * Set up audio context and analyser for voice detection
   */
  async setupAudioAnalysis() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      
      this.microphone = this.audioContext.createMediaStreamSource(this.localStream);
      this.microphone.connect(this.analyser);
      
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      
    } catch (error) {
      console.error('Failed to setup audio analysis:', error);
      throw error;
    }
  }

  /**
   * Start monitoring voice levels
   */
  startVoiceLevelMonitoring() {
    const updateVoiceLevel = () => {
      if (!this.analyser || !this.dataArray) return;
      
      this.analyser.getByteFrequencyData(this.dataArray);
      
      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < this.dataArray.length; i++) {
        sum += this.dataArray[i];
      }
      const average = sum / this.dataArray.length;
      
      // Normalize to 0-1 range
      const normalizedLevel = Math.min(average / 128, 1);
      
      // Update voice level callback
      if (this.onVoiceLevelUpdate) {
        this.onVoiceLevelUpdate(normalizedLevel);
      }
      
      // Detect speaking
      const wasSpeaking = this.isSpeaking;
      this.isSpeaking = average > this.voiceThreshold && !this.isMuted;
      
      // Trigger speaking state change events
      if (this.isSpeaking !== wasSpeaking) {
        this.onSpeakingStateChange(this.isSpeaking);
      }
      
      requestAnimationFrame(updateVoiceLevel);
    };
    
    updateVoiceLevel();
  }

  /**
   * Create a peer connection for a new user
   */
  async createPeerConnection(userId) {
    try {
      const peerConnection = new RTCPeerConnection(this.rtcConfig);
      
      // Add local stream tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, this.localStream);
        });
      }
      
      // Handle incoming stream
      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        this.handleRemoteStream(userId, remoteStream);
      };
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.sendSignalingMessage(userId, {
            type: 'ice-candidate',
            candidate: event.candidate
          });
        }
      };
      
      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log(`Peer connection state: ${peerConnection.connectionState}`);
        
        if (peerConnection.connectionState === 'connected') {
          if (this.onPeerConnected) {
            this.onPeerConnected(userId);
          }
        } else if (peerConnection.connectionState === 'disconnected' || 
                   peerConnection.connectionState === 'failed') {
          this.removePeerConnection(userId);
        }
      };
      
      this.peerConnections.set(userId, peerConnection);
      return peerConnection;
      
    } catch (error) {
      console.error('Failed to create peer connection:', error);
      throw error;
    }
  }

  /**
   * Handle incoming remote stream
   */
  handleRemoteStream(userId, stream) {
    // Create audio element for remote stream
    const audioElement = document.createElement('audio');
    audioElement.srcObject = stream;
    audioElement.autoplay = true;
    audioElement.id = `remote-audio-${userId}`;
    
    // Add to DOM (hidden)
    audioElement.style.display = 'none';
    document.body.appendChild(audioElement);
    
    console.log(`Remote stream added for user: ${userId}`);
  }

  /**
   * Create and send offer to peer
   */
  async createOffer(userId) {
    try {
      const peerConnection = await this.createPeerConnection(userId);
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      this.sendSignalingMessage(userId, {
        type: 'offer',
        offer: offer
      });
      
    } catch (error) {
      console.error('Failed to create offer:', error);
    }
  }

  /**
   * Handle incoming offer
   */
  async handleOffer(userId, offer) {
    try {
      const peerConnection = await this.createPeerConnection(userId);
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      this.sendSignalingMessage(userId, {
        type: 'answer',
        answer: answer
      });
      
    } catch (error) {
      console.error('Failed to handle offer:', error);
    }
  }

  /**
   * Handle incoming answer
   */
  async handleAnswer(userId, answer) {
    try {
      const peerConnection = this.peerConnections.get(userId);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error('Failed to handle answer:', error);
    }
  }

  /**
   * Handle incoming ICE candidate
   */
  async handleIceCandidate(userId, candidate) {
    try {
      const peerConnection = this.peerConnections.get(userId);
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Failed to handle ICE candidate:', error);
    }
  }

  /**
   * Send signaling message (to be implemented with WebSocket or Supabase)
   */
  sendSignalingMessage(userId, message) {
    // This would typically send via WebSocket or Supabase real-time
    console.log(`Sending signaling message to ${userId}:`, message);
    
    // For now, we'll use a simple event system
    window.dispatchEvent(new CustomEvent('webrtc-signaling', {
      detail: { userId, message }
    }));
  }

  /**
   * Remove peer connection
   */
  removePeerConnection(userId) {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(userId);
      
      // Remove remote audio element
      const audioElement = document.getElementById(`remote-audio-${userId}`);
      if (audioElement) {
        audioElement.remove();
      }
      
      if (this.onPeerDisconnected) {
        this.onPeerDisconnected(userId);
      }
      
      console.log(`Peer connection removed for user: ${userId}`);
    }
  }

  /**
   * Start speaking (enable microphone)
   */
  startSpeaking() {
    if (!this.localStream || this.isMuted) return;
    
    this.localStream.getAudioTracks().forEach(track => {
      track.enabled = true;
    });
    
    console.log('Started speaking');
  }

  /**
   * Stop speaking (disable microphone)
   */
  stopSpeaking() {
    if (!this.localStream) return;
    
    this.localStream.getAudioTracks().forEach(track => {
      track.enabled = false;
    });
    
    console.log('Stopped speaking');
  }

  /**
   * Set mute state
   */
  setMuted(muted) {
    this.isMuted = muted;
    
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }
    
    console.log(`Microphone ${muted ? 'muted' : 'unmuted'}`);
  }

  /**
   * Handle speaking state change
   */
  onSpeakingStateChange(isSpeaking) {
    // Broadcast speaking status to other peers
    window.dispatchEvent(new CustomEvent('speaking-state-change', {
      detail: { isSpeaking }
    }));
  }

  /**
   * Get current voice level (0-1)
   */
  getCurrentVoiceLevel() {
    if (!this.analyser || !this.dataArray) return 0;
    
    this.analyser.getByteFrequencyData(this.dataArray);
    
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    
    return Math.min((sum / this.dataArray.length) / 128, 1);
  }

  /**
   * Set voice detection threshold
   */
  setVoiceThreshold(threshold) {
    this.voiceThreshold = Math.max(0, Math.min(100, threshold));
  }

  /**
   * Get connected peers count
   */
  getConnectedPeersCount() {
    return this.peerConnections.size;
  }

  /**
   * Disconnect from all peers and clean up
   */
  disconnect() {
    // Close all peer connections
    this.peerConnections.forEach((peerConnection, userId) => {
      this.removePeerConnection(userId);
    });
    
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.localStream = null;
    }
    
    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    // Reset state
    this.isInitialized = false;
    this.isMuted = false;
    this.isSpeaking = false;
    this.analyser = null;
    this.microphone = null;
    this.dataArray = null;
    
    console.log('WebRTC disconnected and cleaned up');
  }

  /**
   * Check if WebRTC is supported
   */
  static isSupported() {
    return !!(navigator.mediaDevices && 
             navigator.mediaDevices.getUserMedia && 
             window.RTCPeerConnection);
  }

  /**
   * Get available audio devices
   */
  static async getAudioDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'audioinput');
    } catch (error) {
      console.error('Failed to get audio devices:', error);
      return [];
    }
  }
}

// Export for use in other modules
export default WebRTCManager;