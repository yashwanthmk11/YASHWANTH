import OpenAI from 'openai';
import AIFeedback from '../models/AIFeedback.js';
import Message from '../models/Message.js';
import Session from '../models/Session.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate AI response to a message or query
export const generateAIResponse = async (req, res) => {
  try {
    const { sessionId, query, messageId } = req.body;
    const userId = req.user.id;

    // Check if session exists and AI is enabled
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (!session.aiSettings.isAiEnabled) {
      return res.status(400).json({
        success: false,
        message: 'AI is disabled for this session'
      });
    }

    // Check if user is participant
    const isParticipant = session.participants.some(
      p => p.user.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this session'
      });
    }

    // Get recent messages for context
    const recentMessages = await Message.find({
      session: sessionId,
      isDeleted: false
    })
      .populate('sender', 'username')
      .sort({ createdAt: -1 })
      .limit(10);

    // Build context for AI
    const context = recentMessages.reverse().map(msg => 
      `${msg.sender.username}: ${msg.content}`
    ).join('\n');

    const systemPrompt = `You are an AI assistant in a group discussion platform. 
    Your role is to facilitate productive conversations, provide insights, and help maintain a positive discussion environment.
    
    Session: ${session.title}
    Description: ${session.description}
    
    Recent conversation context:
    ${context}
    
    Current query: ${query}
    
    Please provide a helpful, constructive response that adds value to the discussion.`;

    const startTime = Date.now();

    const completion = await openai.chat.completions.create({
      model: session.aiSettings.aiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const processingTime = Date.now() - startTime;
    const aiResponse = completion.choices[0].message.content;

    // Save AI feedback
    const aiFeedback = await AIFeedback.create({
      session: sessionId,
      triggerMessage: messageId || null,
      feedbackType: 'response',
      content: aiResponse,
      metadata: {
        model: session.aiSettings.aiModel,
        confidence: 0.8,
        processingTime,
        tokenUsage: completion.usage?.total_tokens || 0
      }
    });

    // Also create a message in the chat
    const aiMessage = await Message.create({
      session: sessionId,
      sender: userId, // We'll use a special AI user ID in production
      content: aiResponse,
      messageType: 'ai'
    });

    res.json({
      success: true,
      response: aiResponse,
      feedback: aiFeedback,
      message: aiMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating AI response',
      error: error.message
    });
  }
};

// Generate session summary
export const generateSessionSummary = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is participant or creator
    const isParticipant = session.participants.some(
      p => p.user.toString() === userId
    );
    const isCreator = session.creator.toString() === userId;

    if (!isParticipant && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get all messages
    const messages = await Message.find({
      session: sessionId,
      isDeleted: false,
      messageType: { $in: ['text', 'system'] }
    })
      .populate('sender', 'username')
      .sort({ createdAt: 1 });

    // Build conversation text
    const conversation = messages.map(msg => 
      `${msg.sender.username}: ${msg.content}`
    ).join('\n');

    const systemPrompt = `Please provide a comprehensive summary of this group discussion session:

    Session: ${session.title}
    Description: ${session.description}
    Duration: ${session.createdAt} to ${session.endedAt || 'ongoing'}
    Participants: ${session.participants.length}

    Conversation:
    ${conversation}

    Please include:
    1. Main topics discussed
    2. Key points and insights
    3. Decisions made (if any)
    4. Action items (if any)
    5. Overall sentiment and engagement level

    Keep the summary concise but comprehensive.`;

    const startTime = Date.now();

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const processingTime = Date.now() - startTime;
    const summary = completion.choices[0].message.content;

    // Save AI feedback
    const aiFeedback = await AIFeedback.create({
      session: sessionId,
      feedbackType: 'summary',
      content: summary,
      metadata: {
        model: 'gpt-3.5-turbo',
        confidence: 0.9,
        processingTime,
        tokenUsage: completion.usage?.total_tokens || 0
      }
    });

    res.json({
      success: true,
      summary,
      feedback: aiFeedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating session summary',
      error: error.message
    });
  }
};

// Get AI feedback for a session
export const getAIFeedback = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { type } = req.query;
    const userId = req.user.id;

    // Check if user is participant
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const isParticipant = session.participants.some(
      p => p.user.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this session'
      });
    }

    const query = {
      session: sessionId,
      isVisible: true,
      ...(type && { feedbackType: type })
    };

    const feedback = await AIFeedback.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching AI feedback',
      error: error.message
    });
  }
};

// Generate discussion insights
export const generateInsights = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is creator
    if (session.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only session creator can generate insights'
      });
    }

    // Get all messages and participants data
    const messages = await Message.find({
      session: sessionId,
      isDeleted: false,
      messageType: 'text'
    })
      .populate('sender', 'username')
      .sort({ createdAt: 1 });

    // Calculate participation metrics
    const participationStats = {};
    messages.forEach(msg => {
      const username = msg.sender.username;
      if (!participationStats[username]) {
        participationStats[username] = 0;
      }
      participationStats[username]++;
    });

    const conversation = messages.slice(-50).map(msg => 
      `${msg.sender.username}: ${msg.content}`
    ).join('\n');

    const systemPrompt = `Analyze this group discussion and provide insights:

    Session: ${session.title}
    Total Messages: ${messages.length}
    Participants: ${session.participants.length}
    
    Participation Stats:
    ${Object.entries(participationStats).map(([user, count]) => `${user}: ${count} messages`).join('\n')}

    Recent conversation sample:
    ${conversation}

    Please provide insights on:
    1. Discussion quality and depth
    2. Participation balance
    3. Emerging themes or topics
    4. Engagement levels
    5. Suggestions for improvement

    Format as a structured analysis.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt }
      ],
      max_tokens: 800,
      temperature: 0.4,
    });

    const insights = completion.choices[0].message.content;

    // Save AI feedback
    const aiFeedback = await AIFeedback.create({
      session: sessionId,
      feedbackType: 'analysis',
      content: insights,
      metadata: {
        model: 'gpt-3.5-turbo',
        confidence: 0.8,
        tokenUsage: completion.usage?.total_tokens || 0
      }
    });

    res.json({
      success: true,
      insights,
      participationStats,
      feedback: aiFeedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating insights',
      error: error.message
    });
  }
};