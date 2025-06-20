export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: 'admin' | 'mentor' | 'user';
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface AITool {
  id: string;
  name: string;
  description: string;
  category_id: string;
  url?: string;
  image_url?: string;
  how_to_use?: string;
  created_by?: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  // Joins
  category?: Category;
  created_by_user?: Profile;
}

export interface Request {
  id: string;
  user_id: string;
  request_type: 'mentorship' | 'hackathon' | 'workshop' | 'business' | 'other';
  title: string;
  description: string;
  status: 'new' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  tool_id?: string;
  private_notes?: string;
  created_at: string;
  updated_at: string;
  // Joins
  user?: Profile;
  assigned_to_user?: Profile;
  tool?: AITool;
}

export interface Workshop {
  id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  online_link?: string;
  max_participants?: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  organizer_id: string;
  created_at: string;
  updated_at: string;
  // Joins
  organizer?: Profile;
  participants?: WorkshopParticipant[];
}

export interface WorkshopParticipant {
  workshop_id: string;
  user_id: string;
  registered_at: string;
  attended: boolean;
  feedback?: string;
  // Joins
  user?: Profile;
  workshop?: Workshop;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id?: string;
  request_id?: string;
  content: string;
  is_read: boolean;
  created_at: string;
  // Joins
  sender?: Profile;
  receiver?: Profile;
  request?: Request;
}

export interface Newsletter {
  id: string;
  email: string;
  first_name?: string;
  subscribed_at: string;
  is_active: boolean;
}

export interface Testimonial {
  id: string;
  user_id?: string;
  content: string;
  rating: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  // Joins
  user?: Profile;
}

export interface Certificate {
  id: string;
  user_id: string;
  title: string;
  description: string;
  certificate_url: string;
  issued_by: string;
  issue_date: string;
  category: 'hackathon' | 'workshop' | 'course' | 'achievement' | 'other';
  is_verified: boolean;
  is_featured: boolean;
  feedback?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
  // Joins
  user?: Profile;
}