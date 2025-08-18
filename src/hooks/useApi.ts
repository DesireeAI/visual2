import { useState, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Lead, OperatingHours, ClinicProfile, AgentPrompt, WhatsAppInstance } from '../types';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  // Fetch clinic_id for the current user
  const getClinicId = useCallback(async () => {
    if (!session?.user?.id) {
      throw new Error('No user session');
    }
    const { data, error } = await supabase
      .from('clinic_users')
      .select('clinic_id')
      .eq('user_id', session.user.id)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return data.clinic_id;
  }, [session]);

  // Fetch clinic name for instance naming
  const getClinicName = useCallback(async () => {
    const clinic_id = await getClinicId();
    const { data, error } = await supabase
      .from('clinics')
      .select('name')
      .eq('clinic_id', clinic_id)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return data.name;
  }, [getClinicId]);

  // Fetch leads from Supabase
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const clinic_id = await getClinicId();
      const { data, error } = await supabase
        .from('clients')
        .select('remotejid, nome_cliente, pushname, telefone, ult_contato, appointment_datetime, status, sintomas, clinic_id')
        .eq('clinic_id', clinic_id)
        .neq('status', 'contacted') // Exclude 'concluído' leads
        .range(0, 99);
      if (error) {
        throw new Error(error.message);
      }
      const mappedLeads: Lead[] = data.map((client) => ({
        id: client.remotejid,
        clientName: client.nome_cliente || client.pushname || 'Unknown',
        phone: client.telefone || null,
        lastContact: client.ult_contato || null,
        appointmentDate: client.appointment_datetime
          ? new Date(client.appointment_datetime).toISOString().split('T')[0]
          : undefined,
        appointmentTime: client.appointment_datetime
          ? new Date(client.appointment_datetime).toTimeString().slice(0, 5)
          : undefined,
        status: client.status && ['new', 'contacted', 'no-show', 'in-attendance', 'canceled', 'to-reschedule', 'rescheduled', 'pending'].includes(client.status)
          ? client.status as Lead['status']
          : 'pending',
        notes: client.sintomas || undefined,
        clinic_id: client.clinic_id || null,
      }));
      return mappedLeads;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch leads';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getClinicId]);

  // Update lead status in Supabase
  const updateLead = useCallback(async (remotejid: string, data: { status: Lead['status'] }) => {
    setLoading(true);
    setError(null);
    try {
      const clinic_id = await getClinicId();
      const { data: updatedData, error } = await supabase
        .from('clients')
        .update({ status: data.status })
        .eq('remotejid', remotejid)
        .eq('clinic_id', clinic_id)
        .select('remotejid, nome_cliente, pushname, telefone, ult_contato, appointment_datetime, status, sintomas, clinic_id')
        .single();
      if (error) {
        throw new Error(error.message);
      }
      const mappedLead: Lead = {
        id: updatedData.remotejid,
        clientName: updatedData.nome_cliente || updatedData.pushname || 'Unknown',
        phone: updatedData.telefone || null,
        lastContact: updatedData.ult_contato || null,
        appointmentDate: updatedData.appointment_datetime
          ? new Date(updatedData.appointment_datetime).toISOString().split('T')[0]
          : undefined,
        appointmentTime: updatedData.appointment_datetime
          ? new Date(updatedData.appointment_datetime).toTimeString().slice(0, 5)
          : undefined,
        status: updatedData.status as Lead['status'],
        notes: updatedData.sintomas || undefined,
        clinic_id: updatedData.clinic_id || null,
      };
      return mappedLead;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update lead';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getClinicId]);

  // Fetch WhatsApp instances from Supabase
  const fetchInstances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const clinic_id = await getClinicId();
      const { data, error } = await supabase
        .from('clinic_instances')
        .select('api_key, clinic_id, instance_name, phone_number, status, created_at, qr_code')
        .eq('clinic_id', clinic_id);
      if (error) {
        throw new Error(error.message);
      }
      return data as WhatsAppInstance[];
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch WhatsApp instances';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getClinicId]);

  // Verify instance activation via backend
  const verifyInstance = useCallback(async (api_key: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/verify-instance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ api_key }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data as { api_key: string; status: 'connected' | 'disconnected' };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to verify instance';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Fetch operating hours from Supabase
  const fetchHours = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const clinic_id = await getClinicId();
      const { data, error } = await supabase
        .from('operating_hours')
        .select('*')
        .eq('clinic_id', clinic_id);
      if (error) {
        throw new Error(error.message);
      }
      const transformed = data.reduce((acc: OperatingHours, item) => ({
        ...acc,
        [item.day]: {
          enabled: item.enabled,
          start_time: item.start_time,
          end_time: item.end_time,
        },
      }), {});
      return transformed;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch operating hours';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getClinicId]);

  // Update operating hours in Supabase
  const updateHours = useCallback(async (hours: OperatingHours) => {
    setLoading(true);
    setError(null);
    try {
      const clinic_id = await getClinicId();
      const updates = Object.entries(hours).map(([day, { enabled, start_time, end_time }]) => ({
        clinic_id,
        day,
        enabled,
        start_time,
        end_time,
      }));
      const { data, error } = await supabase
        .from('operating_hours')
        .upsert(updates, { onConflict: 'clinic_id,day' })
        .select();
      if (error) {
        throw new Error(error.message);
      }
      const transformed = data.reduce((acc: OperatingHours, item) => ({
        ...acc,
        [item.day]: {
          enabled: item.enabled,
          start_time: item.start_time,
          end_time: item.end_time,
        },
      }), {});
      return transformed;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update operating hours';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getClinicId]);

  // Fetch clinic profile and prompts from Supabase
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const clinic_id = await getClinicId();
      const { data: profileData, error: profileError } = await supabase
        .from('clinics')
        .select('*')
        .eq('clinic_id', clinic_id)
        .single();
      const { data: promptsData, error: promptsError } = await supabase
        .from('agent_prompts')
        .select('*')
        .eq('clinic_id', clinic_id);
      if (profileError || promptsError) {
        throw new Error(profileError?.message || promptsError?.message);
      }
      return { 
        profile: profileData as ClinicProfile, 
        prompts: promptsData as AgentPrompt[] 
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch clinic profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getClinicId]);

  // Update clinic profile and prompts in Supabase
  const updateProfile = useCallback(async (profile: ClinicProfile, prompts: AgentPrompt[]) => {
    setLoading(true);
    setError(null);
    try {
      const clinic_id = await getClinicId();
      const { data: profileData, error: profileError } = await supabase
        .from('clinics')
        .upsert({
          clinic_id,
          name: profile.name,
          asaas_api_key: profile.asaas_api_key,
          klingo_api_key: profile.klingo_api_key,
          address: profile.address,
          recommendations: profile.recommendations,
          support_phone: profile.support_phone,
          asaas_enabled: profile.asaas_enabled,
          klingo_enabled: profile.klingo_enabled,
          assistant_name: profile.assistant_name,
        }, { onConflict: 'clinic_id' })
        .select()
        .single();
      const { data: promptsData, error: promptsError } = await supabase
        .from('agent_prompts')
        .upsert(prompts.map(p => ({ ...p, clinic_id })), { onConflict: 'id' })
        .select();
      if (profileError || promptsError) {
        throw new Error(profileError?.message || promptsError?.message);
      }
      return { 
        profile: profileData as ClinicProfile, 
        prompts: promptsData as AgentPrompt[] 
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update clinic profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getClinicId]);

  // Generic HTTP request for FastAPI endpoints
  const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
    setLoading(true);
    setError(null);
    try {
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        Authorization: `Bearer ${session.access_token}`,
      };
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          if (typeof value === 'string') {
            headers[key] = value;
          }
        });
      }
      console.log('Making request to:', `${API_BASE_URL}${endpoint}`);
      console.log('Request headers:', headers);
      console.log('Request body:', options.body || 'No body');
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response body:', responseText);
      if (!response.ok) {
        const errorData = responseText ? JSON.parse(responseText) : {};
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      return responseText ? JSON.parse(responseText) : {};
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      console.error('Request error:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const get = useCallback((endpoint: string) => makeRequest(endpoint), []);
  const post = useCallback((endpoint: string, data: any) => 
    makeRequest(endpoint, { method: 'POST', body: JSON.stringify(data) }), []);
  const put = useCallback((endpoint: string, data: any) => 
    makeRequest(endpoint, { method: 'PUT', body: JSON.stringify(data) }), []);
  const del = useCallback((endpoint: string) => 
    makeRequest(endpoint, { method: 'DELETE' }), []);

  return useMemo(() => ({
    fetchLeads,
    updateLead,
    fetchInstances,
    verifyInstance,
    fetchHours,
    updateHours,
    fetchProfile,
    updateProfile,
    get,
    post,
    put,
    del,
    loading,
    error,
    getClinicName,
    getClinicId,
  }), [fetchLeads, updateLead, fetchInstances, verifyInstance, fetchHours, updateHours, fetchProfile, updateProfile, get, post, put, del, loading, error, getClinicName, getClinicId]);
};