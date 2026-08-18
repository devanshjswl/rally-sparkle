export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      cohost_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          email: string
          event_id: string | null
          expires_at: string
          id: string
          inviter_id: string
          scope: Database["public"]["Enums"]["cohost_scope"]
          status: Database["public"]["Enums"]["cohost_invitation_status"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email: string
          event_id?: string | null
          expires_at?: string
          id?: string
          inviter_id: string
          scope: Database["public"]["Enums"]["cohost_scope"]
          status?: Database["public"]["Enums"]["cohost_invitation_status"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email?: string
          event_id?: string | null
          expires_at?: string
          id?: string
          inviter_id?: string
          scope?: Database["public"]["Enums"]["cohost_scope"]
          status?: Database["public"]["Enums"]["cohost_invitation_status"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohost_invitations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cohost_invitations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "public_events"
            referencedColumns: ["id"]
          },
        ]
      }
      cohosts: {
        Row: {
          cohost_user_id: string
          created_at: string
          event_id: string | null
          id: string
          owner_id: string
        }
        Insert: {
          cohost_user_id: string
          created_at?: string
          event_id?: string | null
          id?: string
          owner_id: string
        }
        Update: {
          cohost_user_id?: string
          created_at?: string
          event_id?: string | null
          id?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohosts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cohosts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "public_events"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body: string
          enabled: boolean
          event_id: string
          id: string
          subject: string
          template_type: Database["public"]["Enums"]["email_template_type"]
        }
        Insert: {
          body?: string
          enabled?: boolean
          event_id: string
          id?: string
          subject?: string
          template_type: Database["public"]["Enums"]["email_template_type"]
        }
        Update: {
          body?: string
          enabled?: boolean
          event_id?: string
          id?: string
          subject?: string
          template_type?: Database["public"]["Enums"]["email_template_type"]
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_templates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "public_events"
            referencedColumns: ["id"]
          },
        ]
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      event_image_library: {
        Row: {
          created_at: string
          event_id: string
          id: string
          prompt: string | null
          source: string
          tag: string | null
          url: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          prompt?: string | null
          source?: string
          tag?: string | null
          url: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          prompt?: string | null
          source?: string
          tag?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_image_library_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_image_library_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "public_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_modules: {
        Row: {
          content: Json
          created_at: string
          enabled: boolean
          event_id: string
          id: string
          position: number
          type: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          enabled?: boolean
          event_id: string
          id?: string
          position?: number
          type: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          enabled?: boolean
          event_id?: string
          id?: string
          position?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_modules_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_modules_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "public_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_tracking_links: {
        Row: {
          click_count: number
          code: string
          created_at: string
          event_id: string
          id: string
          label: string
          updated_at: string
          utm: Json
        }
        Insert: {
          click_count?: number
          code: string
          created_at?: string
          event_id: string
          id?: string
          label: string
          updated_at?: string
          utm?: Json
        }
        Update: {
          click_count?: number
          code?: string
          created_at?: string
          event_id?: string
          id?: string
          label?: string
          updated_at?: string
          utm?: Json
        }
        Relationships: [
          {
            foreignKeyName: "event_tracking_links_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tracking_links_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "public_events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          background_image_position: string | null
          background_image_scale: number | null
          background_image_url: string | null
          capacity: number | null
          color_mode: string | null
          created_at: string
          description: string | null
          email_intro: string | null
          email_signature: string | null
          event_date: string | null
          event_end_date: string | null
          event_type: string | null
          id: string
          location_type: string | null
          location_value: string | null
          logo_url: string | null
          name: string
          primary_color: string | null
          registration_deadline: string | null
          registration_limit: number | null
          registration_opens_at: string | null
          requires_approval: boolean | null
          send_confirmation_email: boolean
          send_reminder_1h: boolean
          send_reminder_24h: boolean
          slug: string
          status: Database["public"]["Enums"]["event_status"]
          template: string | null
          ticket_price: number | null
          ticket_tiers: Json
          timezone: string | null
          updated_at: string
          user_id: string
          waitlist_enabled: boolean
        }
        Insert: {
          background_image_position?: string | null
          background_image_scale?: number | null
          background_image_url?: string | null
          capacity?: number | null
          color_mode?: string | null
          created_at?: string
          description?: string | null
          email_intro?: string | null
          email_signature?: string | null
          event_date?: string | null
          event_end_date?: string | null
          event_type?: string | null
          id?: string
          location_type?: string | null
          location_value?: string | null
          logo_url?: string | null
          name: string
          primary_color?: string | null
          registration_deadline?: string | null
          registration_limit?: number | null
          registration_opens_at?: string | null
          requires_approval?: boolean | null
          send_confirmation_email?: boolean
          send_reminder_1h?: boolean
          send_reminder_24h?: boolean
          slug: string
          status?: Database["public"]["Enums"]["event_status"]
          template?: string | null
          ticket_price?: number | null
          ticket_tiers?: Json
          timezone?: string | null
          updated_at?: string
          user_id: string
          waitlist_enabled?: boolean
        }
        Update: {
          background_image_position?: string | null
          background_image_scale?: number | null
          background_image_url?: string | null
          capacity?: number | null
          color_mode?: string | null
          created_at?: string
          description?: string | null
          email_intro?: string | null
          email_signature?: string | null
          event_date?: string | null
          event_end_date?: string | null
          event_type?: string | null
          id?: string
          location_type?: string | null
          location_value?: string | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          registration_deadline?: string | null
          registration_limit?: number | null
          registration_opens_at?: string | null
          requires_approval?: boolean | null
          send_confirmation_email?: boolean
          send_reminder_1h?: boolean
          send_reminder_24h?: boolean
          slug?: string
          status?: Database["public"]["Enums"]["event_status"]
          template?: string | null
          ticket_price?: number | null
          ticket_tiers?: Json
          timezone?: string | null
          updated_at?: string
          user_id?: string
          waitlist_enabled?: boolean
        }
        Relationships: []
      }
      form_fields: {
        Row: {
          event_id: string
          field_type: string
          id: string
          label: string
          placeholder: string | null
          position: number
          required: boolean
        }
        Insert: {
          event_id: string
          field_type?: string
          id?: string
          label: string
          placeholder?: string | null
          position?: number
          required?: boolean
        }
        Update: {
          event_id?: string
          field_type?: string
          id?: string
          label?: string
          placeholder?: string | null
          position?: number
          required?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "form_fields_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_fields_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "public_events"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_appointments: {
        Row: {
          created_at: string
          date: string
          department_id: string | null
          doctor_id: string | null
          id: string
          patient_id: string | null
          patient_name: string
          predicted_wait: number
          priority: Database["public"]["Enums"]["hospital_priority"]
          reason: string | null
          slot: string
          status: Database["public"]["Enums"]["hospital_appointment_status"]
          token_number: number
        }
        Insert: {
          created_at?: string
          date: string
          department_id?: string | null
          doctor_id?: string | null
          id?: string
          patient_id?: string | null
          patient_name: string
          predicted_wait?: number
          priority?: Database["public"]["Enums"]["hospital_priority"]
          reason?: string | null
          slot: string
          status?: Database["public"]["Enums"]["hospital_appointment_status"]
          token_number: number
        }
        Update: {
          created_at?: string
          date?: string
          department_id?: string | null
          doctor_id?: string | null
          id?: string
          patient_id?: string | null
          patient_name?: string
          predicted_wait?: number
          priority?: Database["public"]["Enums"]["hospital_priority"]
          reason?: string | null
          slot?: string
          status?: Database["public"]["Enums"]["hospital_appointment_status"]
          token_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "hospital_appointments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "hospital_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospital_appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "hospital_doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospital_appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "hospital_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_departments: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          load: number
          name: string
          open_from: string
          open_to: string
          rooms: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          load?: number
          name: string
          open_from?: string
          open_to?: string
          rooms?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          load?: number
          name?: string
          open_from?: string
          open_to?: string
          rooms?: number
        }
        Relationships: []
      }
      hospital_doctors: {
        Row: {
          available: boolean
          avg_consult_minutes: number
          created_at: string
          days: string[]
          department_id: string | null
          experience_years: number
          fee: number
          id: string
          name: string
          qualification: string | null
          rating: number
          room: string | null
          slot_end: string
          slot_start: string
          specialization: string | null
        }
        Insert: {
          available?: boolean
          avg_consult_minutes?: number
          created_at?: string
          days?: string[]
          department_id?: string | null
          experience_years?: number
          fee?: number
          id?: string
          name: string
          qualification?: string | null
          rating?: number
          room?: string | null
          slot_end?: string
          slot_start?: string
          specialization?: string | null
        }
        Update: {
          available?: boolean
          avg_consult_minutes?: number
          created_at?: string
          days?: string[]
          department_id?: string | null
          experience_years?: number
          fee?: number
          id?: string
          name?: string
          qualification?: string | null
          rating?: number
          room?: string | null
          slot_end?: string
          slot_start?: string
          specialization?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hospital_doctors_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "hospital_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_emergencies: {
        Row: {
          age: number | null
          arrived_at: string
          assigned_doctor_id: string | null
          condition: string | null
          department_id: string | null
          id: string
          patient_name: string
          status: Database["public"]["Enums"]["hospital_emergency_status"]
          triage: Database["public"]["Enums"]["hospital_triage"]
        }
        Insert: {
          age?: number | null
          arrived_at?: string
          assigned_doctor_id?: string | null
          condition?: string | null
          department_id?: string | null
          id?: string
          patient_name: string
          status?: Database["public"]["Enums"]["hospital_emergency_status"]
          triage?: Database["public"]["Enums"]["hospital_triage"]
        }
        Update: {
          age?: number | null
          arrived_at?: string
          assigned_doctor_id?: string | null
          condition?: string | null
          department_id?: string | null
          id?: string
          patient_name?: string
          status?: Database["public"]["Enums"]["hospital_emergency_status"]
          triage?: Database["public"]["Enums"]["hospital_triage"]
        }
        Relationships: [
          {
            foreignKeyName: "hospital_emergencies_assigned_doctor_id_fkey"
            columns: ["assigned_doctor_id"]
            isOneToOne: false
            referencedRelation: "hospital_doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospital_emergencies_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "hospital_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_patients: {
        Row: {
          age: number | null
          blood_group: string | null
          created_at: string
          gender: string | null
          id: string
          name: string
          phone: string | null
          profile_id: string | null
          uhid: string
        }
        Insert: {
          age?: number | null
          blood_group?: string | null
          created_at?: string
          gender?: string | null
          id?: string
          name: string
          phone?: string | null
          profile_id?: string | null
          uhid: string
        }
        Update: {
          age?: number | null
          blood_group?: string | null
          created_at?: string
          gender?: string | null
          id?: string
          name?: string
          phone?: string | null
          profile_id?: string | null
          uhid?: string
        }
        Relationships: []
      }
      hospital_profiles: {
        Row: {
          created_at: string
          doctor_id: string | null
          email: string
          id: string
          name: string
          patient_id: string | null
          role: Database["public"]["Enums"]["hospital_role"]
        }
        Insert: {
          created_at?: string
          doctor_id?: string | null
          email: string
          id: string
          name: string
          patient_id?: string | null
          role?: Database["public"]["Enums"]["hospital_role"]
        }
        Update: {
          created_at?: string
          doctor_id?: string | null
          email?: string
          id?: string
          name?: string
          patient_id?: string | null
          role?: Database["public"]["Enums"]["hospital_role"]
        }
        Relationships: [
          {
            foreignKeyName: "hospital_profiles_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "hospital_doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospital_profiles_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "hospital_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      image_generation_jobs: {
        Row: {
          count: number
          created_at: string
          error: string | null
          event_id: string
          id: string
          prompt: string
          result_urls: Json
          status: string
          style_seed_url: string | null
          tag: string | null
          template: string
          updated_at: string
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          error?: string | null
          event_id: string
          id?: string
          prompt: string
          result_urls?: Json
          status?: string
          style_seed_url?: string | null
          tag?: string | null
          template?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          error?: string | null
          event_id?: string
          id?: string
          prompt?: string
          result_urls?: Json
          status?: string
          style_seed_url?: string | null
          tag?: string | null
          template?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      landing_sections: {
        Row: {
          assets: Json
          content: Json
          section_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          assets?: Json
          content?: Json
          section_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          assets?: Json
          content?: Json
          section_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          company_description: string | null
          company_slug: string | null
          created_at: string
          full_name: string | null
          id: string
          social_links: Json | null
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          company_description?: string | null
          company_slug?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          social_links?: Json | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          company_description?: string | null
          company_slug?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          social_links?: Json | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      registrations: {
        Row: {
          checked_in_at: string | null
          created_at: string
          data: Json
          event_id: string
          id: string
          is_vip: boolean
          notes: string | null
          status: Database["public"]["Enums"]["registration_status"]
          utm: Json | null
        }
        Insert: {
          checked_in_at?: string | null
          created_at?: string
          data?: Json
          event_id: string
          id?: string
          is_vip?: boolean
          notes?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          utm?: Json | null
        }
        Update: {
          checked_in_at?: string | null
          created_at?: string
          data?: Json
          event_id?: string
          id?: string
          is_vip?: boolean
          notes?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          utm?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "public_events"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_events: {
        Row: {
          background_image_position: string | null
          background_image_scale: number | null
          background_image_url: string | null
          capacity: number | null
          color_mode: string | null
          created_at: string | null
          description: string | null
          event_date: string | null
          event_end_date: string | null
          event_type: string | null
          id: string | null
          location_type: string | null
          location_value: string | null
          logo_url: string | null
          name: string | null
          primary_color: string | null
          registration_deadline: string | null
          registration_limit: number | null
          registration_opens_at: string | null
          requires_approval: boolean | null
          slug: string | null
          status: Database["public"]["Enums"]["event_status"] | null
          template: string | null
          ticket_price: number | null
          ticket_tiers: Json | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
          waitlist_enabled: boolean | null
        }
        Insert: {
          background_image_position?: string | null
          background_image_scale?: number | null
          background_image_url?: string | null
          capacity?: number | null
          color_mode?: string | null
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          event_end_date?: string | null
          event_type?: string | null
          id?: string | null
          location_type?: string | null
          location_value?: string | null
          logo_url?: string | null
          name?: string | null
          primary_color?: string | null
          registration_deadline?: string | null
          registration_limit?: number | null
          registration_opens_at?: string | null
          requires_approval?: boolean | null
          slug?: string | null
          status?: Database["public"]["Enums"]["event_status"] | null
          template?: string | null
          ticket_price?: number | null
          ticket_tiers?: Json | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          waitlist_enabled?: boolean | null
        }
        Update: {
          background_image_position?: string | null
          background_image_scale?: number | null
          background_image_url?: string | null
          capacity?: number | null
          color_mode?: string | null
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          event_end_date?: string | null
          event_type?: string | null
          id?: string | null
          location_type?: string | null
          location_value?: string | null
          logo_url?: string | null
          name?: string | null
          primary_color?: string | null
          registration_deadline?: string | null
          registration_limit?: number | null
          registration_opens_at?: string | null
          requires_approval?: boolean | null
          slug?: string | null
          status?: Database["public"]["Enums"]["event_status"] | null
          template?: string | null
          ticket_price?: number | null
          ticket_tiers?: Json | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          waitlist_enabled?: boolean | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          company_description: string | null
          company_slug: string | null
          full_name: string | null
          id: string | null
          social_links: Json | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          company_description?: string | null
          company_slug?: string | null
          full_name?: string | null
          id?: string | null
          social_links?: Json | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          company_description?: string | null
          company_slug?: string | null
          full_name?: string | null
          id?: string | null
          social_links?: Json | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_cohost_invitation: { Args: { _token: string }; Returns: Json }
      check_in_attendee: { Args: { p_registration_id: string }; Returns: Json }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_cohost_invitation: { Args: { _token: string }; Returns: Json }
      get_event_email_config: { Args: { p_event_id: string }; Returns: Json }
      get_my_tickets: { Args: never; Returns: Json }
      get_registration_count: { Args: { p_event_id: string }; Returns: number }
      get_ticket: { Args: { p_registration_id: string }; Returns: Json }
      has_any_organizer_access: { Args: { _user_id: string }; Returns: boolean }
      has_event_access: {
        Args: { _event_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hospital_current_doctor_id: { Args: never; Returns: string }
      hospital_current_patient_id: { Args: never; Returns: string }
      hospital_current_role: {
        Args: never
        Returns: Database["public"]["Enums"]["hospital_role"]
      }
      increment_link_click: { Args: { p_link_id: string }; Returns: undefined }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      promote_from_waitlist: {
        Args: { p_registration_id: string }
        Returns: undefined
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      register_for_event: {
        Args: { p_data: Json; p_event_id: string; p_utm?: Json }
        Returns: Json
      }
      update_event_email_config: {
        Args: { p_event_id: string; p_patch: Json }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "viewer"
      cohost_invitation_status: "pending" | "accepted" | "revoked" | "expired"
      cohost_scope: "account" | "event"
      email_template_type: "confirmation" | "reminder" | "followup"
      event_status: "draft" | "live" | "past"
      hospital_appointment_status:
        | "waiting"
        | "in-consultation"
        | "completed"
        | "cancelled"
      hospital_emergency_status: "incoming" | "in-treatment" | "stabilised"
      hospital_priority: "emergency" | "high" | "normal"
      hospital_role: "patient" | "doctor" | "admin"
      hospital_triage: "Red" | "Yellow" | "Green"
      registration_status:
        | "registered"
        | "checked_in"
        | "cancelled"
        | "attended"
        | "no_show"
        | "waitlisted"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "viewer"],
      cohost_invitation_status: ["pending", "accepted", "revoked", "expired"],
      cohost_scope: ["account", "event"],
      email_template_type: ["confirmation", "reminder", "followup"],
      event_status: ["draft", "live", "past"],
      hospital_appointment_status: [
        "waiting",
        "in-consultation",
        "completed",
        "cancelled",
      ],
      hospital_emergency_status: ["incoming", "in-treatment", "stabilised"],
      hospital_priority: ["emergency", "high", "normal"],
      hospital_role: ["patient", "doctor", "admin"],
      hospital_triage: ["Red", "Yellow", "Green"],
      registration_status: [
        "registered",
        "checked_in",
        "cancelled",
        "attended",
        "no_show",
        "waitlisted",
      ],
    },
  },
} as const
