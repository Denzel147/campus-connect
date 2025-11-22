const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const Notification = require('../models/Notification');

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socket instance
    this.userRooms = new Map(); // userId -> Set of room names
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    logger.info('WebSocket service initialized');
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        
        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.userId;
      
      // Store connected user
      this.connectedUsers.set(userId, socket);
      this.userRooms.set(userId, new Set());
      
      logger.info(`User ${userId} connected via WebSocket`);

      // Join user to their personal notification room
      socket.join(`user_${userId}`);

      // Handle classroom joining
      socket.on('join_classroom', (classroomId) => {
        const roomName = `classroom_${classroomId}`;
        socket.join(roomName);
        
        if (!this.userRooms.has(userId)) {
          this.userRooms.set(userId, new Set());
        }
        this.userRooms.get(userId).add(roomName);
        
        logger.info(`User ${userId} joined classroom ${classroomId}`);
      });

      // Handle leaving classroom
      socket.on('leave_classroom', (classroomId) => {
        const roomName = `classroom_${classroomId}`;
        socket.leave(roomName);
        
        if (this.userRooms.has(userId)) {
          this.userRooms.get(userId).delete(roomName);
        }
        
        logger.info(`User ${userId} left classroom ${classroomId}`);
      });

      // Handle new message in classroom
      socket.on('new_message', (data) => {
        const { classroomId, message, messageId } = data;
        const roomName = `classroom_${classroomId}`;
        
        // Broadcast to all users in the classroom except sender
        socket.to(roomName).emit('message_received', {
          messageId,
          classroomId,
          message,
          userId,
          timestamp: new Date().toISOString()
        });
      });

      // Handle message reactions
      socket.on('message_reaction', (data) => {
        const { messageId, classroomId, reaction } = data;
        const roomName = `classroom_${classroomId}`;
        
        socket.to(roomName).emit('reaction_received', {
          messageId,
          classroomId,
          reaction,
          userId
        });
      });

      // Handle typing indicators
      socket.on('typing_start', (classroomId) => {
        const roomName = `classroom_${classroomId}`;
        socket.to(roomName).emit('user_typing', { userId, classroomId });
      });

      socket.on('typing_stop', (classroomId) => {
        const roomName = `classroom_${classroomId}`;
        socket.to(roomName).emit('user_stopped_typing', { userId, classroomId });
      });

      // Handle online status
      socket.on('update_status', (status) => {
        // Broadcast status to all classrooms user is part of
        if (this.userRooms.has(userId)) {
          for (const roomName of this.userRooms.get(userId)) {
            socket.to(roomName).emit('user_status_changed', { userId, status });
          }
        }
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        this.connectedUsers.delete(userId);
        this.userRooms.delete(userId);
        
        logger.info(`User ${userId} disconnected: ${reason}`);
        
        // Notify connected classrooms about user going offline
        if (this.userRooms.has(userId)) {
          for (const roomName of this.userRooms.get(userId)) {
            socket.to(roomName).emit('user_status_changed', { 
              userId, 
              status: 'offline' 
            });
          }
        }
      });
    });
  }

  // Send notification to specific user
  sendToUser(userId, event, data) {
    if (this.connectedUsers.has(userId)) {
      this.connectedUsers.get(userId).emit(event, data);
      return true;
    }
    return false;
  }

  // Send notification to multiple users
  sendToUsers(userIds, event, data) {
    let sentCount = 0;
    for (const userId of userIds) {
      if (this.sendToUser(userId, event, data)) {
        sentCount++;
      }
    }
    return sentCount;
  }

  // Broadcast to a classroom
  sendToClassroom(classroomId, event, data) {
    this.io.to(`classroom_${classroomId}`).emit(event, data);
  }

  // Send notification and store in database
  async sendNotification(userId, notification) {
    try {
      // Store notification in database
      const savedNotification = await Notification.create({
        user_id: userId,
        notification_type: notification.type,
        message: notification.message,
        related_item_id: notification.relatedItemId,
        related_transaction_id: notification.relatedTransactionId,
        priority: notification.priority || 'normal'
      });

      // Send real-time notification if user is online
      const sent = this.sendToUser(userId, 'notification', {
        id: savedNotification.notification_id,
        type: notification.type,
        message: notification.message,
        priority: notification.priority || 'normal',
        relatedItemId: notification.relatedItemId,
        relatedTransactionId: notification.relatedTransactionId,
        timestamp: savedNotification.date_created
      });

      logger.info(`Notification sent to user ${userId}: ${notification.message} (real-time: ${sent})`);
      
      return savedNotification;
    } catch (error) {
      logger.error('Send notification error:', error);
      throw error;
    }
  }

  // Send bulk notifications
  async sendBulkNotifications(notifications) {
    const results = [];
    
    for (const notification of notifications) {
      try {
        const result = await this.sendNotification(notification.userId, notification);
        results.push({ success: true, notificationId: result.notification_id });
      } catch (error) {
        results.push({ success: false, error: error.message, userId: notification.userId });
      }
    }
    
    return results;
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get users in a classroom
  getClassroomUsers(classroomId) {
    const roomName = `classroom_${classroomId}`;
    const room = this.io.sockets.adapter.rooms.get(roomName);
    return room ? Array.from(room) : [];
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

module.exports = webSocketService;
