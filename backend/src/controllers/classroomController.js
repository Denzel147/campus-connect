const Classroom = require('../models/Classroom');
const Message = require('../models/Message');
const logger = require('../config/logger');

// Get all classrooms
const getClassrooms = async (req, res, next) => {
  try {
    const classrooms = await Classroom.findAll();
    
    res.json({
      success: true,
      data: classrooms
    });
  } catch (error) {
    logger.error('Get classrooms error:', error);
    next(error);
  }
};

// Get user's joined classrooms
const getJoinedClassrooms = async (req, res, next) => {
  try {
    const classrooms = await Classroom.findByUser(req.user.userId);
    
    res.json({
      success: true,
      data: classrooms
    });
  } catch (error) {
    logger.error('Get joined classrooms error:', error);
    next(error);
  }
};

// Join a classroom
const joinClassroom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Check if classroom exists
    const classroom = await Classroom.findById(id);
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Classroom not found'
      });
    }
    
    // Check if user is already a member
    const isMember = await Classroom.isUserMember(id, userId);
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this classroom'
      });
    }
    
    // Join the classroom
    await Classroom.joinClassroom(id, userId);
    
    res.json({
      success: true,
      message: 'Successfully joined classroom'
    });
  } catch (error) {
    logger.error('Join classroom error:', error);
    next(error);
  }
};

// Leave a classroom
const leaveClassroom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const result = await Classroom.leaveClassroom(id, userId);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this classroom'
      });
    }
    
    res.json({
      success: true,
      message: 'Successfully left classroom'
    });
  } catch (error) {
    logger.error('Leave classroom error:', error);
    next(error);
  }
};

// Get classroom messages
const getClassroomMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.userId;
    
    // Check if user is a member of the classroom
    const isMember = await Classroom.isUserMember(id, userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of this classroom to view messages'
      });
    }
    
    const messages = await Message.findByClassroom(id, parseInt(page), parseInt(limit));
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    logger.error('Get classroom messages error:', error);
    next(error);
  }
};

// Send a message to classroom
const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.userId;
    
    // Check if user is a member of the classroom
    const isMember = await Classroom.isUserMember(id, userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of this classroom to send messages'
      });
    }
    
    const newMessage = await Message.create({
      classroom_id: id,
      user_id: userId,
      message
    });
    
    // Fetch the complete message data
    const completeMessage = await Message.findById(newMessage.id);
    
    res.status(201).json({
      success: true,
      data: completeMessage
    });
  } catch (error) {
    logger.error('Send message error:', error);
    next(error);
  }
};

// Like/unlike a message
const toggleMessageLike = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;
    
    const isLiked = await Message.isMessageLiked(messageId, userId);
    
    if (isLiked) {
      await Message.unlikeMessage(messageId, userId);
    } else {
      await Message.likeMessage(messageId, userId);
    }
    
    // Get updated message data
    const updatedMessage = await Message.findById(messageId);
    
    res.json({
      success: true,
      data: {
        liked: !isLiked,
        message: updatedMessage
      }
    });
  } catch (error) {
    logger.error('Toggle message like error:', error);
    next(error);
  }
};

// Delete a message
const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;
    
    const deletedMessage = await Message.delete(messageId, userId);
    if (!deletedMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you do not have permission to delete it'
      });
    }
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    logger.error('Delete message error:', error);
    next(error);
  }
};

module.exports = {
  getClassrooms,
  getJoinedClassrooms,
  joinClassroom,
  leaveClassroom,
  getClassroomMessages,
  sendMessage,
  toggleMessageLike,
  deleteMessage
};
