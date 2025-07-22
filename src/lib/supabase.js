import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ukspmsqilttlxbjsesdz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrc3Btc3FpbHR0bHhianNlc2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODExMzksImV4cCI6MjA2ODY1NzEzOX0.qYKQvP0badE6ou7GTnmsdv---2UjIWDw5w9MvgDxulA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database operations for messages
export const messageService = {
  // Get all messages
  async getMessages(status = null) {
    let query = supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Create new message
  async createMessage(messageData) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        name: messageData.name,
        email: messageData.email,
        phone: messageData.phone || '',
        inquiry_type: messageData.inquiry || 'other',
        subject: `رسالة من ${messageData.name}`,
        message: messageData.message,
        status: 'unread'
      }])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Update message status
  async updateMessageStatus(id, status) {
    const { data, error } = await supabase
      .from('messages')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Reply to message
  async replyToMessage(id, reply) {
    const { data, error } = await supabase
      .from('messages')
      .update({ 
        reply,
        status: 'replied',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Get message statistics
  async getStatistics() {
    const { data: allMessages, error } = await supabase
      .from('messages')
      .select('status, created_at')
    
    if (error) throw error
    
    const total = allMessages.length
    const unread = allMessages.filter(msg => msg.status === 'unread').length
    const replied = allMessages.filter(msg => msg.status === 'replied').length
    
    const today = new Date().toDateString()
    const todayMessages = allMessages.filter(msg => 
      new Date(msg.created_at).toDateString() === today
    ).length
    
    return {
      total,
      unread,
      replied,
      today: todayMessages
    }
  }
}

// Database operations for news
export const newsService = {
  // Get published news
  async getPublishedNews() {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get all news (admin)
  async getAllNews() {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}

// Database operations for projects
export const projectService = {
  // Get published projects
  async getPublishedProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('year', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get all projects (admin)
  async getAllProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}

// Authentication
export const authService = {
  // Sign in with email and password
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Check if user is authenticated
  async isAuthenticated() {
    const user = await this.getCurrentUser()
    return !!user
  }
}