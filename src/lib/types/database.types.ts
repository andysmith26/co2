export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          created_at: string;
          first_name: string;
          last_initial: string | null;
          teacher_id: string;
          status: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          first_name: string;
          last_initial?: string | null;
          teacher_id: string;
          status?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          first_name?: string;
          last_initial?: string | null;
          teacher_id?: string;
          status?: string;
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          role: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
      };
      // Add more tables as needed
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};