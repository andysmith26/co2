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