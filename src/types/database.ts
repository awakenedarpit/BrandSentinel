/**
 * Supabase Database Table Definitions & Row Interfaces (Supabase v2 Schema Compatible)
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      brand_profiles: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          tagline: string | null;
          industry: string | null;
          voice_persona: string[];
          active_version: string;
          primary_contact_name: string | null;
          primary_contact_title: string | null;
          primary_contact_email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          tagline?: string | null;
          industry?: string | null;
          voice_persona?: string[];
          active_version?: string;
          primary_contact_name?: string | null;
          primary_contact_title?: string | null;
          primary_contact_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          tagline?: string | null;
          industry?: string | null;
          voice_persona?: string[];
          active_version?: string;
          primary_contact_name?: string | null;
          primary_contact_title?: string | null;
          primary_contact_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      brand_rules: {
        Row: {
          id: string;
          brand_profile_id: string | null;
          user_id: string | null;
          title: string;
          category: string;
          severity: 'high' | 'medium' | 'low';
          is_active: boolean;
          statement: string;
          source_doc_name: string;
          source_page: number | null;
          source_paragraph: string | null;
          source_type: 'pdf' | 'manual' | 'template';
          prohibited_patterns: string[];
          approved_substitutions: string[];
          enforced_channels: string[];
          trigger_words: string[] | null;
          mandatory_copy: string | null;
          regex_pattern: string | null;
          placement_requirement: string | null;
          clean_scans: number;
          soft_warns: number;
          auto_corrections: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          brand_profile_id?: string | null;
          user_id?: string | null;
          title: string;
          category: string;
          severity: 'high' | 'medium' | 'low';
          is_active?: boolean;
          statement: string;
          source_doc_name: string;
          source_page?: number | null;
          source_paragraph?: string | null;
          source_type?: 'pdf' | 'manual' | 'template';
          prohibited_patterns?: string[];
          approved_substitutions?: string[];
          enforced_channels?: string[];
          trigger_words?: string[] | null;
          mandatory_copy?: string | null;
          regex_pattern?: string | null;
          placement_requirement?: string | null;
          clean_scans?: number;
          soft_warns?: number;
          auto_corrections?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          brand_profile_id?: string | null;
          user_id?: string | null;
          title?: string;
          category?: string;
          severity?: 'high' | 'medium' | 'low';
          is_active?: boolean;
          statement?: string;
          source_doc_name?: string;
          source_page?: number | null;
          source_paragraph?: string | null;
          source_type?: 'pdf' | 'manual' | 'template';
          prohibited_patterns?: string[];
          approved_substitutions?: string[];
          enforced_channels?: string[];
          trigger_words?: string[] | null;
          mandatory_copy?: string | null;
          regex_pattern?: string | null;
          placement_requirement?: string | null;
          clean_scans?: number;
          soft_warns?: number;
          auto_corrections?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_reports: {
        Row: {
          id: string;
          brand_profile_id: string | null;
          user_id: string | null;
          campaign_name: string;
          target_entity: string;
          publishing_surface: string;
          submitted_copy: string;
          remediated_copy: string;
          status: 'Approved' | 'Blocked' | 'Review Required';
          health_score: number;
          total_rules_checked: number;
          flagged_count: number;
          execution_latency_ms: number;
          findings: any;
          approver_name: string | null;
          approver_title: string | null;
          approver_avatar_initials: string | null;
          approver_status: 'Assigned' | 'Pending' | 'Approved' | null;
          audit_log: any;
          image_asset: any;
          created_at: string;
        };
        Insert: {
          id: string;
          brand_profile_id?: string | null;
          user_id?: string | null;
          campaign_name: string;
          target_entity: string;
          publishing_surface: string;
          submitted_copy: string;
          remediated_copy: string;
          status: 'Approved' | 'Blocked' | 'Review Required';
          health_score: number;
          total_rules_checked?: number;
          flagged_count?: number;
          execution_latency_ms?: number;
          findings?: any;
          approver_name?: string | null;
          approver_title?: string | null;
          approver_avatar_initials?: string | null;
          approver_status?: 'Assigned' | 'Pending' | 'Approved' | null;
          audit_log?: any;
          image_asset?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          brand_profile_id?: string | null;
          user_id?: string | null;
          campaign_name?: string;
          target_entity?: string;
          publishing_surface?: string;
          submitted_copy?: string;
          remediated_copy?: string;
          status?: 'Approved' | 'Blocked' | 'Review Required';
          health_score?: number;
          total_rules_checked?: number;
          flagged_count?: number;
          execution_latency_ms?: number;
          findings?: any;
          approver_name?: string | null;
          approver_title?: string | null;
          approver_avatar_initials?: string | null;
          approver_status?: 'Assigned' | 'Pending' | 'Approved' | null;
          audit_log?: any;
          image_asset?: any;
          created_at?: string;
        };
        Relationships: [];
      };
      knowledge_documents: {
        Row: {
          id: string;
          brand_profile_id: string | null;
          user_id: string | null;
          file_name: string;
          file_type: 'PDF' | 'DOCX' | 'MD' | 'TXT';
          file_size: string;
          rules_extracted: number;
          vector_index: string;
          status: 'Synced' | 'Indexing' | 'Draft' | 'Pending' | 'Processing' | 'Completed' | 'Failed';
          last_indexed: string;
          chunks_count: number;
          description: string | null;
          storage_path?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          brand_profile_id?: string | null;
          user_id?: string | null;
          file_name: string;
          file_type: 'PDF' | 'DOCX' | 'MD' | 'TXT';
          file_size: string;
          rules_extracted?: number;
          vector_index?: string;
          status?: 'Synced' | 'Indexing' | 'Draft' | 'Pending' | 'Processing' | 'Completed' | 'Failed';
          last_indexed?: string;
          chunks_count?: number;
          description?: string | null;
          storage_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          brand_profile_id?: string | null;
          user_id?: string | null;
          file_name?: string;
          file_type?: 'PDF' | 'DOCX' | 'MD' | 'TXT';
          file_size?: string;
          rules_extracted?: number;
          vector_index?: string;
          status?: 'Synced' | 'Indexing' | 'Draft' | 'Pending' | 'Processing' | 'Completed' | 'Failed';
          last_indexed?: string;
          chunks_count?: number;
          description?: string | null;
          storage_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      document_chunks: {
        Row: {
          id: string;
          document_id: string;
          brand_profile_id: string | null;
          user_id: string | null;
          chunk_index: number;
          page_number: number | null;
          content: string;
          token_count: number | null;
          embedding: string | number[] | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          brand_profile_id?: string | null;
          user_id?: string | null;
          chunk_index: number;
          page_number?: number | null;
          content: string;
          token_count?: number | null;
          embedding?: string | number[] | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          brand_profile_id?: string | null;
          user_id?: string | null;
          chunk_index?: number;
          page_number?: number | null;
          content?: string;
          token_count?: number | null;
          embedding?: string | number[] | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      match_document_chunks: {
        Args: {
          query_embedding: string | number[];
          match_threshold?: number;
          match_count?: number;
          filter_brand_id?: string | null;
          filter_user_id?: string | null;
        };
        Returns: {
          id: string;
          document_id: string;
          brand_profile_id: string;
          chunk_index: number;
          page_number: number | null;
          content: string;
          similarity: number;
          metadata: Json;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type DocumentChunkRow = Database['public']['Tables']['document_chunks']['Row'];
export type KnowledgeDocumentRow = Database['public']['Tables']['knowledge_documents']['Row'];

export interface MatchDocumentChunkResult {
  id: string;
  document_id: string;
  brand_profile_id: string;
  chunk_index: number;
  page_number: number | null;
  content: string;
  similarity: number;
  metadata: Record<string, any>;
}

