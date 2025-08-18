export interface WhatsAppInstance {
  api_key: string;
  clinic_id: string;
  instance_name: string | null;
  phone_number: string;
  status: 'connecting' | 'connected' | 'disconnected';
  created_at: string;
  type?: 'WHATSAPP-BAILEYS' | 'WHATSAPP-BUSINESS'; // Optional
  qr_code?: string | null; // Optional
}

export interface Lead {
  id: string;
  clientName: string;
  phone: string | null;
  lastContact: string | null;
  appointmentDate?: string;
  appointmentTime?: string;
  status: 'new' | 'contacted' | 'no-show' | 'in-attendance' | 'canceled' | 'to-reschedule' | 'rescheduled' | 'pending';
  notes?: string;
  clinic_id: string | null;
}

export interface OperatingHours {
  [key: string]: {
    enabled: boolean;
    start_time: string | null;
    end_time: string | null;
  };
}

export interface ClinicProfile {
  clinic_id: string;
  name: string;
  assistant_name: string;
  asaas_api_key: string;
  klingo_api_key: string;
  address: string;
  recommendations: string;
  support_phone: string;
  asaas_enabled: boolean;
  klingo_enabled: boolean;
  attendance_agent_enabled: boolean;
  scheduling_agent_enabled: boolean;
  payment_agent_enabled: boolean;
  reminder_agent_enabled: boolean;
  initial_message_enabled: boolean; // Novo campo
  offered_services_enabled: boolean; // Novo campo
}

export interface AgentPrompt {
  id: string;
  clinic_id: string;
  name: string;
  prompt: string;
  variables: string[];
  enabled: boolean;
}