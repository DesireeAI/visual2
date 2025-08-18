import React, { useState, useEffect } from 'react';
import { Save, Plus, Edit, Trash2 } from 'lucide-react';
import { CustomButton } from '@/components/ui/CustomButton';
import { CustomInput } from '@/components/ui/CustomInput';
import { Toggle } from '@/components/ui/toggle';
import { useApi } from '@/hooks/useApi';
import { ClinicProfile as ClinicProfileType, AgentPrompt } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const defaultVariables = [
  '{clinic_name}',
  '{client_name}',
  '{appointment_time}',
  '{appointment_date}',
  '{service_name}',
  '{doctor_name}',
  '{phone_number}',
  '{greeting}',
  '{service_list}',
];

export const ClinicProfile: React.FC = () => {
  const { fetchProfile, updateProfile, loading, error } = useApi();
  const [profile, setProfile] = useState<ClinicProfileType>({
    clinic_id: '',
    name: '',
    assistant_name: '',
    asaas_api_key: '',
    klingo_api_key: '',
    address: '',
    recommendations: '',
    support_phone: '',
    asaas_enabled: false,
    klingo_enabled: false,
    attendance_agent_enabled: true,
    scheduling_agent_enabled: true,
    payment_agent_enabled: false,
    reminder_agent_enabled: true,
    initial_message_enabled: true,
    offered_services_enabled: true,
  });
  const [agentPrompts, setAgentPrompts] = useState<AgentPrompt[]>([]);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [newVariable, setNewVariable] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { profile: clinicData, prompts: promptsData } = await fetchProfile();
        setProfile({
          clinic_id: clinicData.clinic_id || '',
          name: clinicData.name || '',
          assistant_name: clinicData.assistant_name || '',
          asaas_api_key: clinicData.asaas_api_key || '',
          klingo_api_key: clinicData.klingo_api_key || '',
          address: clinicData.address || '',
          recommendations: clinicData.recommendations || '',
          support_phone: clinicData.support_phone || '',
          asaas_enabled: clinicData.asaas_enabled || false,
          klingo_enabled: clinicData.klingo_enabled || false,
          attendance_agent_enabled: promptsData.find((p: AgentPrompt) => p.name === 'Attendance Agent')?.enabled ?? true,
          scheduling_agent_enabled: promptsData.find((p: AgentPrompt) => p.name === 'Scheduling Agent')?.enabled ?? true,
          payment_agent_enabled: promptsData.find((p: AgentPrompt) => p.name === 'Payment Agent')?.enabled ?? false,
          reminder_agent_enabled: promptsData.find((p: AgentPrompt) => p.name === 'Reminder Agent')?.enabled ?? true,
          initial_message_enabled: promptsData.find((p: AgentPrompt) => p.name === 'Initial Message')?.enabled ?? true,
          offered_services_enabled: promptsData.find((p: AgentPrompt) => p.name === 'Offered Services')?.enabled ?? true,
        });
        setAgentPrompts(promptsData || []);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfileData();
  }, [fetchProfile]);

  const handleSave = async () => {
    try {
      // Remover o campo 'id' de novos prompts para permitir que o Supabase gere UUIDs
      const cleanedPrompts = agentPrompts.map((prompt) => ({
        ...prompt,
        id: prompt.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(prompt.id) ? prompt.id : undefined,
      }));
      await updateProfile(profile, cleanedPrompts);
      alert('Profile and prompts saved successfully');
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile');
    }
  };

  const addVariableToPrompt = (promptId: string, variable: string) => {
    setAgentPrompts((prev) =>
      prev.map((prompt) =>
        prompt.id === promptId
          ? { ...prompt, variables: [...prompt.variables, `{${variable}}`] }
          : prompt
      )
    );
  };

  const removeVariableFromPrompt = (promptId: string, variable: string) => {
    setAgentPrompts((prev) =>
      prev.map((prompt) =>
        prompt.id === promptId
          ? { ...prompt, variables: prompt.variables.filter((v) => v !== variable) }
          : prompt
      )
    );
  };

  const updatePromptText = (promptId: string, text: string) => {
    setAgentPrompts((prev) =>
      prev.map((prompt) =>
        prompt.id === promptId ? { ...prompt, prompt: text } : prompt
      )
    );
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Clinic Profile</h2>
        <p className="text-gray-600">Configure your clinic information and integrations</p>
      </div>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomInput
                label="Clinic Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
              <CustomInput
                label="Assistant Name"
                value={profile.assistant_name}
                onChange={(e) => setProfile({ ...profile, assistant_name: e.target.value })}
                placeholder="e.g., ClinicBot"
              />
              <CustomInput
                label="Support Phone"
                value={profile.support_phone}
                onChange={(e) => setProfile({ ...profile, support_phone: e.target.value })}
              />
              <div className="md:col-span-2">
                <CustomInput
                  label="Address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
                <textarea
                  value={profile.recommendations}
                  onChange={(e) => setProfile({ ...profile, recommendations: e.target.value })}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Asaas Integration</h4>
                  <p className="text-sm text-gray-600">Payment processing integration</p>
                </div>
                <Toggle
                  enabled={profile.asaas_enabled}
                  onChange={(enabled) => setProfile({ ...profile, asaas_enabled: enabled })}
                />
              </div>
              {profile.asaas_enabled && (
                <CustomInput
                  label="Asaas API Key"
                  type="password"
                  value={profile.asaas_api_key}
                  onChange={(e) => setProfile({ ...profile, asaas_api_key: e.target.value })}
                  placeholder="Enter your Asaas API key"
                />
              )}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Klingo Integration</h4>
                  <p className="text-sm text-gray-600">Communication automation</p>
                </div>
                <Toggle
                  enabled={profile.klingo_enabled}
                  onChange={(enabled) => setProfile({ ...profile, klingo_enabled: enabled })}
                />
              </div>
              {profile.klingo_enabled && (
                <CustomInput
                  label="Klingo API Key"
                  type="password"
                  value={profile.klingo_api_key}
                  onChange={(e) => setProfile({ ...profile, klingo_api_key: e.target.value })}
                  placeholder="Enter your Klingo API key"
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agent Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {agentPrompts.map((agent) => (
                <div key={agent.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{agent.name}</h4>
                      <p className="text-sm text-gray-600">
                        {agent.name === 'Initial Message'
                          ? 'Configure the initial message sent to clients'
                          : agent.name === 'Offered Services'
                          ? 'Configure the list of offered services'
                          : 'Configure automated responses'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Toggle
                        enabled={agent.enabled}
                        onChange={(enabled) => {
                          setAgentPrompts((prev) =>
                            prev.map((p) =>
                              p.id === agent.id ? { ...p, enabled } : p
                            )
                          );
                          setProfile((prev) => ({
                            ...prev,
                            attendance_agent_enabled: agent.name.includes('Attendance') ? enabled : prev.attendance_agent_enabled,
                            scheduling_agent_enabled: agent.name.includes('Scheduling') ? enabled : prev.scheduling_agent_enabled,
                            payment_agent_enabled: agent.name.includes('Payment') ? enabled : prev.payment_agent_enabled,
                            reminder_agent_enabled: agent.name.includes('Reminder') ? enabled : prev.reminder_agent_enabled,
                            initial_message_enabled: agent.name.includes('Initial Message') ? enabled : prev.initial_message_enabled,
                            offered_services_enabled: agent.name.includes('Offered Services') ? enabled : prev.offered_services_enabled,
                          }));
                        }}
                      />
                      <CustomButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPrompt(editingPrompt === agent.id ? null : agent.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </CustomButton>
                    </div>
                  </div>
                  {editingPrompt === agent.id && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Template</label>
                        <textarea
                          value={agent.prompt}
                          onChange={(e) => updatePromptText(agent.id, e.target.value)}
                          rows={3}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Available Variables</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {agent.variables.map((variable) => (
                            <span
                              key={variable}
                              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                            >
                              {variable}
                              <button
                                onClick={() => removeVariableFromPrompt(agent.id, variable)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center space-x-2">
                          <CustomInput
                            placeholder="Add custom variable"
                            value={newVariable}
                            onChange={(e) => setNewVariable(e.target.value)}
                            className="flex-1"
                          />
                          <CustomButton
                            size="sm"
                            onClick={() => {
                              if (newVariable.trim()) {
                                addVariableToPrompt(agent.id, newVariable.trim());
                                setNewVariable('');
                              }
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </CustomButton>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Default variables:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {defaultVariables.map((variable) => (
                              <button
                                key={variable}
                                onClick={() => {
                                  if (!agent.variables.includes(variable)) {
                                    addVariableToPrompt(agent.id, variable.slice(1, -1));
                                  }
                                }}
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                              >
                                {variable}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <CustomButton onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </CustomButton>
        </div>
      </div>
    </div>
  );
};